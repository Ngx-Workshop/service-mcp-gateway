import { createServer, Server } from 'node:http';
import { validateDependencies } from './readiness';
import type { CatalogConfig } from '../mcp/catalog.config';
it('readiness requires matching issuer metadata and both read owners', async () => {
  let server: Server | undefined;
  let issuer = '',
    fail = false;
  try {
    server = createServer((req, res) => {
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify(
          req.url?.includes('.well-known')
            ? {
                issuer: fail ? 'https://evil.test' : issuer,
                introspection_endpoint: issuer + '/oauth/introspect',
              }
            : []
        )
      );
    });
    await new Promise<void>((resolve) =>
      server!.listen(0, '127.0.0.1', resolve)
    );
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No fixture');
    issuer = `http://127.0.0.1:${address.port}`;
    const config: CatalogConfig = {
      port: 3011,
      documentBaseUrl: issuer,
      codingLabsBaseUrl: issuer,
      runtime: {
        production: true,
        bind: '0.0.0.0',
        proxies: ['127.0.0.1'],
        origins: [],
      },
      auth: {
        mode: 'oauth',
        issuer,
        resource: 'https://mcp.example.test/mcp',
        endpoint: issuer + '/oauth/introspect',
        clientId: 'gateway',
        clientSecret: 'fixture',
      },
    };
    await validateDependencies(config);
    fail = true;
    await expect(validateDependencies(config)).rejects.toThrow(
      'Production dependencies not ready'
    );
  } finally {
    if (server)
      await new Promise<void>((resolve) => server!.close(() => resolve()));
  }
});
