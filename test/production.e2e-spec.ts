import request from 'supertest';
import type { Server } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { CATALOG_CONFIG, CatalogConfig } from '../src/mcp/catalog.config';
import { productionBoundary } from '../src/auth/production-boundary';
describe('trusted HTTPS proxy ingress', () => {
  let app: INestApplication<Server>;
  const config: CatalogConfig = {
    port: 3011,
    documentBaseUrl: 'http://127.0.0.1:1',
    codingLabsBaseUrl: 'http://127.0.0.1:1',
    runtime: {
      production: true,
      bind: '0.0.0.0',
      proxies: ['127.0.0.1'],
      origins: ['https://client.example.test'],
    },
    auth: {
      mode: 'oauth',
      issuer: 'https://auth.example.test',
      resource: 'https://mcp.example.test/mcp',
      endpoint: 'https://auth.example.test/oauth/introspect',
      clientId: 'gateway',
      clientSecret: 'a'.repeat(43),
    },
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CATALOG_CONFIG)
      .useValue(config)
      .compile();
    app = module.createNestApplication({ bodyParser: false });
    app.use(productionBoundary(config));
    await app.init();
  });
  afterAll(async () => app.close());
  const proxy = {
    Host: 'mcp.example.test',
    'X-Forwarded-Proto': 'https',
    'X-Forwarded-For': '203.0.113.7',
  };
  it('discovery is public but MCP still requires bearer before parsing', async () => {
    await request(app.getHttpServer())
      .get('/.well-known/oauth-protected-resource/mcp')
      .set(proxy)
      .expect(200);
    await request(app.getHttpServer())
      .post('/mcp')
      .set(proxy)
      .send('bad-json')
      .expect(401);
  });
  it.each([
    { Host: 'evil.example.test' },
    { 'X-Forwarded-Proto': 'http' },
    { 'X-Forwarded-For': '203.0.113.7, 127.0.0.1' },
    { Forwarded: 'proto=https' },
    { 'X-Forwarded-Host': 'evil.example.test' },
    { Origin: 'https://evil.example.test' },
  ])('rejects spoofed authority or origin %o', async (patch) => {
    await request(app.getHttpServer())
      .post('/mcp')
      .set({ ...proxy, ...patch })
      .expect(403);
  });
  it('allows cross-origin public discovery without credentials', async () => {
    await request(app.getHttpServer())
      .get('/.well-known/oauth-protected-resource/mcp')
      .set(proxy)
      .set('Origin', 'https://other.example.test')
      .expect('Access-Control-Allow-Origin', '*')
      .expect(200);
  });
  it('rejects direct requests without normalized proxy headers', async () => {
    await request(app.getHttpServer())
      .get('/.well-known/oauth-protected-resource/mcp')
      .set('Host', 'mcp.example.test')
      .expect(403);
  });
});
