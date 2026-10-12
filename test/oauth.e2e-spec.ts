import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import request from 'supertest';
import { createServer, Server, request as rawRequest } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CATALOG_CONFIG } from '../src/mcp/catalog.config';
import { localBoundary } from '../src/mcp/local-boundary';
import { CatalogUpstreamFixture, LAB_ID, VERSION_ID } from './catalog.fixture';

describe('OAuth gateway boundary', () => {
  const owners = new CatalogUpstreamFixture();
  let app: INestApplication,
    auth: Server,
    url: string,
    calls = 0;
  let mode = 'active';
  beforeAll(async () => {
    await owners.start();
    auth = createServer((req, res) => {
      calls++;
      let body = '';
      req.on('data', (chunk) => {
        body += String(chunk);
      });
      req.on('end', () => {
        expect(req.headers.cookie).toBeUndefined();
        expect(req.headers.authorization).toBe(
          'Basic ' + Buffer.from('gateway:fixture-secret').toString('base64')
        );
        res.setHeader('content-type', 'application/json');
        const token = new URLSearchParams(body).get('token');
        const now = Math.floor(Date.now() / 1000);
        res.end(
          JSON.stringify(
            mode === 'inactive'
              ? { active: false }
              : mode === 'malformed'
                ? {}
                : {
                    active: true,
                    token_type: 'Bearer',
                    iss: issuer,
                    sub: token,
                    client_id: 'fixture-client',
                    aud: resource,
                    scope:
                      mode === 'scope' ? 'catalog:read-other' : 'catalog:read',
                    iat: now,
                    exp: now + 600,
                  }
          )
        );
      });
    });
    await new Promise<void>((resolve) => auth.listen(0, '127.0.0.1', resolve));
    const address = auth.address();
    if (!address || typeof address === 'string')
      throw new Error('No auth address');
    const issuer = `http://127.0.0.1:${address.port}`,
      resource = 'http://127.0.0.1:3011/mcp';
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CATALOG_CONFIG)
      .useValue({
        documentBaseUrl: owners.url,
        codingLabsBaseUrl: owners.url,
        port: 3011,
        auth: {
          mode: 'oauth',
          issuer,
          resource,
          endpoint: issuer + '/oauth/introspect',
          clientId: 'gateway',
          clientSecret: 'fixture-secret',
        },
      })
      .compile();
    app = module.createNestApplication({ bodyParser: false });
    app.use(localBoundary);
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });
  beforeEach(() => {
    calls = 0;
    mode = 'active';
    owners.reset();
  });
  afterAll(async () => {
    await app?.close();
    await owners.close();
    await new Promise<void>((resolve) => auth.close(() => resolve()));
  });
  it('serves path-aware public metadata and bounded preflight', async () => {
    const doc = await request(url)
      .get('/.well-known/oauth-protected-resource/mcp')
      .expect(200);
    expect(doc.body).toEqual(
      expect.objectContaining({
        resource: 'http://127.0.0.1:3011/mcp',
        scopes_supported: ['catalog:read'],
        bearer_methods_supported: ['header'],
      })
    );
    await request(url)
      .options('/mcp')
      .set('Origin', 'http://localhost:4201')
      .expect(204);
    expect(calls).toBe(0);
  });
  it.each(['post', 'get', 'delete'] as const)(
    'denies unauthenticated %s before body/tool/owner work',
    async (method) => {
      const denied = await request(url)
        [method]('/mcp')
        .send('bad-json')
        .expect(401);
      expect(denied.headers['www-authenticate']).toContain(
        'resource_metadata='
      );
      expect(calls).toBe(0);
    }
  );
  it('rejects JWT, query and cookie-only credentials without introspection', async () => {
    await request(url)
      .post('/mcp')
      .set('Authorization', 'Bearer ey.fake.jwt')
      .expect(401);
    await request(url)
      .post('/mcp?access_token=' + 'a'.repeat(43))
      .set('Authorization', 'Bearer ' + 'a'.repeat(43))
      .expect(401);
    await request(url)
      .post('/mcp')
      .set('Cookie', 'accessToken=' + 'a'.repeat(43))
      .expect(401);
    expect(calls).toBe(0);
  });
  it('rejects duplicate Authorization headers', async () => {
    const status = await new Promise<number | undefined>((resolve, reject) => {
      const req = rawRequest(
        url + '/mcp',
        {
          method: 'POST',
          headers: [
            'Host',
            new URL(url).host,
            'Authorization',
            'Bearer ' + 'a'.repeat(43),
            'Authorization',
            'Bearer ' + 'b'.repeat(43),
          ],
        },
        (res) => {
          res.resume();
          resolve(res.statusCode);
        }
      );
      req.on('error', reject);
      req.end();
    });
    expect(status).toBe(401);
    expect(calls).toBe(0);
  });
  it('requires exact scope and reports malformed auth responses', async () => {
    mode = 'scope';
    const denied = await request(url)
      .post('/mcp')
      .set('Authorization', 'Bearer ' + 'a'.repeat(43))
      .expect(403);
    expect(denied.headers['www-authenticate']).toContain('insufficient_scope');
    mode = 'malformed';
    await request(url)
      .post('/mcp')
      .set('Authorization', 'Bearer ' + 'a'.repeat(43))
      .expect(503);
    mode = 'inactive';
    await request(url)
      .post('/mcp')
      .set('Authorization', 'Bearer ' + 'a'.repeat(43))
      .expect(401);
  });
  it.each(['modern', 'legacy'] as const)(
    'authenticated %s tools keep owner reads credential-free',
    async (protocol) => {
      const client = new Client(
        { name: 'oauth-test', version: '1' },
        protocol === 'modern'
          ? { versionNegotiation: { mode: { pin: '2026-07-28' } } }
          : {}
      );
      const token = 'a'.repeat(43);
      try {
        await client.connect(
          new StreamableHTTPClientTransport(new URL(url + '/mcp'), {
            requestInit: {
              headers: {
                Authorization: 'Bearer ' + token,
                Cookie: 'accessToken=legacy-cookie',
              },
            },
          })
        );
        expect((await client.listTools()).tools).toHaveLength(3);
        for (const [name, args] of [
          ['list_workshops', { sectionId: 'angular' }],
          [
            'get_workshop',
            { sectionId: 'angular', workshopId: 'workshop-one' },
          ],
          ['get_coding_lab', { labId: LAB_ID, versionId: VERSION_ID }],
        ] as const) {
          const result = await client.callTool({ name, arguments: args });
          expect(result.isError).not.toBe(true);
          expect(JSON.stringify(result)).not.toContain(token);
        }
        expect(owners.requests.length).toBeGreaterThanOrEqual(3);
        for (const owner of owners.requests) {
          expect(owner.method).toBe('GET');
          expect(owner.headers.authorization).toBeUndefined();
          expect(owner.headers.cookie).toBeUndefined();
        }
        expect(calls).toBeGreaterThanOrEqual(4);
      } finally {
        await client.close();
      }
    }
  );
  it('verifies each concurrent request independently before protocol parsing', async () => {
    const results = await Promise.all(
      ['a', 'b'].map((value) =>
        request(url)
          .post('/mcp')
          .set('Authorization', 'Bearer ' + value.repeat(43))
          .set('Content-Type', 'application/json')
          .send('bad-json')
      )
    );
    expect(calls).toBe(2);
    expect(
      results.every(
        (res) => res.status !== 401 && res.status !== 403 && res.status !== 503
      )
    ).toBe(true);
  });
});
