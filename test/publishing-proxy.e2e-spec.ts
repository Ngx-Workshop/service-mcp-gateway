import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CATALOG_CONFIG, loadCatalogConfig } from '../src/mcp/catalog.config';

describe('Publisher compatibility forwarding', () => {
  let app: INestApplication;
  let owner: Server;
  let status = 200;
  let oversized = false;
  let received: {
    url?: string;
    authorization?: string;
    origin?: string;
    cookie?: string;
    body: string;
  };
  let calls = 0;
  beforeAll(async () => {
    owner = createServer((req, res) => {
      calls++;
      received = {
        url: req.url,
        authorization: req.headers.authorization,
        origin: req.headers.origin,
        cookie: req.headers.cookie,
        body: '',
      };
      req.on('data', (chunk: Buffer) => {
        received.body += chunk.toString();
      });
      req.on('end', () => {
        res.writeHead(status, {
          'content-type': 'application/json',
          'access-control-allow-origin': 'http://localhost:4201',
          'access-control-allow-credentials': 'true',
          location: 'http://127.0.0.1:1/never-follow',
        });
        res.end(
          oversized
            ? 'x'.repeat(8 * 1024 * 1024 + 1)
            : status === 200
              ? '{"structuredContent":{"data":{"models":[]}}}'
              : '{"error":"administrator_required"}'
        );
      });
    });
    await new Promise<void>((resolve) => owner.listen(0, '127.0.0.1', resolve));
    const config = loadCatalogConfig({
      DOCUMENT_BASE_URL: 'http://localhost:4001',
      CODING_LABS_BASE_URL: 'http://localhost:4002',
      MCP_AUTH_MODE: 'local-public',
      MCP_LOCAL_DEV: 'true',
      PUBLISHING_ENABLED: 'true',
      AI_PUBLISHER_BASE_URL: `http://127.0.0.1:${(owner.address() as AddressInfo).port}`,
    });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CATALOG_CONFIG)
      .useValue(config)
      .compile();
    app = module.createNestApplication({ bodyParser: false });
    await app.init();
  });
  afterAll(async () => {
    await app.close();
    owner.closeAllConnections();
    await new Promise<void>((resolve) => owner.close(() => resolve()));
  });
  it.each(['/publisher/tools', '/mcp/publishing'])(
    'forwards %s with original credentials and bounded opaque body',
    async (path) => {
      status = 200;
      const body = { name: 'list_publishing_models', input: {} };
      const result = await request(app.getHttpServer() as Server)
        .post(path)
        .set('Authorization', 'Bearer administrator')
        .set('Origin', 'http://localhost:4201')
        .set('Cookie', 'accessToken=administrator')
        .send(body)
        .expect(200);
      expect(received).toEqual({
        url: path,
        authorization: 'Bearer administrator',
        origin: 'http://localhost:4201',
        cookie: 'accessToken=administrator',
        body: JSON.stringify(body),
      });
      expect(result.body).toEqual({
        structuredContent: { data: { models: [] } },
      });
      expect(result.headers['access-control-allow-credentials']).toBe('true');
    }
  );
  it.each([401, 403, 405, 302])(
    'preserves owner status %s without redirects',
    async (code) => {
      status = code;
      await request(app.getHttpServer() as Server)
        .post('/publisher/tools')
        .send({})
        .expect(code);
      expect(received.authorization).toBeUndefined();
    }
  );
  it('forwards browser preflight without a credential', async () => {
    status = 204;
    await request(app.getHttpServer() as Server)
      .options('/publisher/tools')
      .set('Origin', 'http://localhost:4201')
      .expect(204);
  });
  it('rejects oversized bodies before contacting publisher', async () => {
    const before = calls;
    await request(app.getHttpServer() as Server)
      .post('/publisher/tools')
      .set('Content-Type', 'application/json')
      .send('x'.repeat(8 * 1024 * 1024 + 1))
      .expect(413);
    expect(calls).toBe(before);
  });
  it('bounds publisher responses and returns a safe transport error', async () => {
    status = 200;
    oversized = true;
    const result = await request(app.getHttpServer() as Server)
      .post('/publisher/tools')
      .send({})
      .expect(502);
    expect(result.body).toEqual({ error: 'publisher_unavailable' });
    oversized = false;
  });
  it('returns a safe error when publisher is unavailable', async () => {
    owner.closeAllConnections();
    await new Promise<void>((resolve) => owner.close(() => resolve()));
    const result = await request(app.getHttpServer() as Server)
      .post('/publisher/tools')
      .send({})
      .expect(502);
    expect(result.body).toEqual({ error: 'publisher_unavailable' });
  });
});
