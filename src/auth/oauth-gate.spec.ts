import { createServer, Server } from 'node:http';
import type { Request, Response } from 'express';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { OAuthGate } from './oauth-gate';
it('retains separate subjects and clients for overlapping authenticated requests', async () => {
  let server: Server | undefined;
  try {
    const resource = 'http://127.0.0.1:3011/mcp';
    let issuer = '';
    server = createServer((req, res) => {
      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const first = new URLSearchParams(body).get('token') === 'a'.repeat(43);
        setTimeout(
          () => {
            const now = Math.floor(Date.now() / 1000);
            res.setHeader('content-type', 'application/json');
            res.end(
              JSON.stringify({
                active: true,
                token_type: 'Bearer',
                iss: issuer,
                sub: first ? 'user-a' : 'user-b',
                client_id: first ? 'client-a' : 'client-b',
                aud: resource,
                scope: 'catalog:read',
                iat: now,
                exp: now + 600,
              })
            );
          },
          first ? 25 : 0
        );
      });
    });
    await new Promise<void>((resolve) =>
      server!.listen(0, '127.0.0.1', resolve)
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No fixture address');
    issuer = `http://127.0.0.1:${address.port}`;
    const gate = new OAuthGate({
      mode: 'oauth',
      issuer,
      resource,
      endpoint: issuer + '/oauth/introspect',
      clientId: 'gateway',
      clientSecret: 'fixture-secret',
    });
    const requests = ['a', 'b'].map(
      (value) =>
        ({
          method: 'POST',
          originalUrl: '/mcp',
          rawHeaders: ['Authorization', 'Bearer ' + value.repeat(43)],
          headers: { authorization: 'Bearer ' + value.repeat(43) },
        }) as Request & { auth: AuthInfo }
    );
    const response = { setHeader: jest.fn() } as unknown as Response;
    expect(
      await Promise.all(requests.map((req) => gate.authorize(req, response)))
    ).toEqual([true, true]);
    expect(
      requests.map((req) => ({
        client: req.auth.clientId,
        subject: req.auth.extra?.subject,
      }))
    ).toEqual([
      { client: 'client-a', subject: 'user-a' },
      { client: 'client-b', subject: 'user-b' },
    ]);
    expect(requests[0].auth).not.toBe(requests[1].auth);
  } finally {
    if (server)
      await new Promise<void>((resolve) => server!.close(() => resolve()));
  }
});
