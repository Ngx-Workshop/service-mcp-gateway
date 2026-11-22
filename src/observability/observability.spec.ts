import type { Server } from 'node:http';
import { Controller, Get, INestApplication, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ObservabilityModule } from './observability.module';
import { createServiceLogger, httpLoggingMiddleware } from './observability';
import { RequestContext } from './request-context';

@Controller('items')
class TestController {
  constructor(private readonly context: RequestContext) {}

  @Get(':id')
  async get() {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return { ok: true, requestId: this.context.requestId };
  }
}

describe('Service observability', () => {
  let app: INestApplication<Server>;
  const log = jest.fn();
  const warn = jest.fn();
  const error = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ObservabilityModule],
      controllers: [TestController],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.use(
      httpLoggingMiddleware(
        { log, warn, error } as unknown as Logger,
        app.get(RequestContext)
      )
    );
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('serves an anonymous, non-cached heartbeat without database or auth providers', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).toEqual({
      status: 'ok',
      info: { heartbeat: { status: 'up' } },
      error: {},
      details: { heartbeat: { status: 'up' } },
    });
    expect(log).not.toHaveBeenCalled();
  });

  it('logs route templates and timings without request data or concrete identifiers', async () => {
    const response = await request(app.getHttpServer())
      .get('/items/private-person?token=private-query')
      .set('Authorization', 'Bearer private-auth')
      .set('Cookie', 'session=private-cookie')
      .expect(200);
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'http_request',
        method: 'GET',
        route: '/items/:id',
        statusCode: 200,
        durationMs: expect.any(Number) as unknown,
        requestId: response.headers['x-request-id'],
      })
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-');
  });

  it('logs unknown routes without their raw paths or query values', async () => {
    await request(app.getHttpServer())
      .get('/private-missing?secret=private-query')
      .expect(404);
    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ route: '/unmatched', statusCode: 404 })
    );
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private-');
  });

  it('propagates only valid request IDs and isolates concurrent requests', async () => {
    const firstId = '00000000-0000-4000-8000-000000000001';
    const secondId = '00000000-0000-4000-8000-000000000002';
    const [first, second] = await Promise.all([
      request(app.getHttpServer())
        .get('/items/first')
        .set('X-Request-ID', firstId)
        .expect(200),
      request(app.getHttpServer())
        .get('/items/second')
        .set('X-Request-ID', secondId)
        .expect(200),
    ]);
    expect(first.body).toEqual({ ok: true, requestId: firstId });
    expect(second.body).toEqual({ ok: true, requestId: secondId });

    const invalid = await request(app.getHttpServer())
      .get('/items/third')
      .set('X-Request-ID', 'private-content')
      .expect(200);
    expect(invalid.body).toEqual({
      ok: true,
      requestId: invalid.headers['x-request-id'],
    });
    expect(invalid.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(invalid.headers['x-request-id']).not.toBe('private-content');
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-content');
  });

  it('does not provide a write endpoint for heartbeat', async () => {
    await request(app.getHttpServer())
      .post('/health')
      .send({ secret: 'private-body' })
      .expect(404);
    expect(warn).toHaveBeenCalled();
    expect(JSON.stringify(warn.mock.calls)).not.toContain('private-body');
  });

  it('uses native Nest JSON logging with a contextual, structured message', () => {
    const write = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    try {
      createServiceLogger().log({ event: 'test_event' }, 'ObservabilityTest');
      expect(write).toHaveBeenCalled();
      const entry: unknown = JSON.parse(String(write.mock.calls[0][0]));
      expect(entry).toEqual(
        expect.objectContaining({
          level: 'log',
          context: 'ObservabilityTest',
          message: { event: 'test_event' },
        })
      );
    } finally {
      write.mockRestore();
    }
  });
});
