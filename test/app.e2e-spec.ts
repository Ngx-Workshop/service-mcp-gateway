import request from 'supertest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import { AppModule } from '../src/app.module';
import { CATALOG_CONFIG } from '../src/mcp/catalog.config';
import { localBoundary } from '../src/mcp/local-boundary';
import {
  CatalogUpstreamFixture,
  LAB_ID,
  VERSION_ID,
  workshopFixture,
} from './catalog.fixture';
import {
  catalogDefinitions,
  getCodingLabOutputSchema,
  getWorkshopOutputSchema,
  listWorkshopsOutputSchema,
  toolErrorSchema,
} from '../src/tools/catalog.schemas';

// Real Nest listener + official SDK + disposable HTTP domain servers.
describe('Local MCP catalog protocol', () => {
  const upstream = new CatalogUpstreamFixture();
  let app: INestApplication;
  let url: string;
  let client: Client;
  beforeAll(async () => {
    await upstream.start();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CATALOG_CONFIG)
      .useValue({
        documentBaseUrl: upstream.url,
        codingLabsBaseUrl: upstream.url,
        port: 3011,
        auth: { mode: 'local-public' },
      })
      .compile();
    app = module.createNestApplication({ bodyParser: false });
    app.use(localBoundary);
    await app.listen(0, '127.0.0.1');
    url = `${await app.getUrl()}/mcp`;
    client = new Client(
      { name: 'catalog-tests', version: '1.0.0' },
      { versionNegotiation: { mode: { pin: '2026-07-28' } } }
    );
    await client.connect(
      new StreamableHTTPClientTransport(new URL(url), {
        requestInit: {
          headers: {
            Authorization: 'Bearer should-not-forward',
            Cookie: 'accessToken=should-not-forward',
          },
        },
      })
    );
  });
  beforeEach(() => upstream.reset());
  afterAll(async () => {
    await client?.close();
    await app?.close();
    await upstream.close();
  });
  it('discovers exactly the three read-only tools with input/output schemas', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'get_coding_lab',
      'get_workshop',
      'list_workshops',
    ]);
    for (const tool of tools) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
      });
      expect(tool.inputSchema.additionalProperties).toBe(false);
      expect(tool.outputSchema).toBeDefined();
    }
  });
  it('keeps the generated contract artifact aligned with discovery', async () => {
    const { tools } = await client.listTools();
    const generated = JSON.parse(
      readFileSync(join(__dirname, '../mcp-tools.json'), 'utf8')
    ) as { tools: unknown[] };
    const expected = Object.entries(catalogDefinitions).map(
      ([name, definition]) => ({
        name,
        description: definition.description,
        annotations: definition.annotations,
        inputSchema: z.toJSONSchema(definition.inputSchema),
        outputSchema: z.toJSONSchema(definition.outputSchema),
      })
    );
    expect(generated.tools).toEqual(expected);
    for (const tool of tools) {
      const definition = expected.find((item) => item.name === tool.name);
      // The SDK normalizes schema dialect metadata; structural schemas stay equal.
      const input = { ...definition!.inputSchema };
      delete input.$schema;
      const output = { ...definition!.outputSchema };
      delete output.$schema;
      expect(tool.inputSchema).toMatchObject(input);
      expect(tool.outputSchema).toMatchObject(output);
    }
  });
  it('calls all tools, validates structured results, redacts fields and never forwards credentials', async () => {
    const listed = await client.callTool({
      name: 'list_workshops',
      arguments: { sectionId: 'angular' },
    });
    expect(
      listWorkshopsOutputSchema.parse(listed.structuredContent).workshops
    ).toHaveLength(1);
    const detail = await client.callTool({
      name: 'get_workshop',
      arguments: { sectionId: 'angular', workshopId: 'workshop-one' },
    });
    expect(
      getWorkshopOutputSchema.parse(detail.structuredContent).workshop
        .outline[0].kind
    ).toBe('PAGE');
    const lab = await client.callTool({
      name: 'get_coding_lab',
      arguments: { labId: LAB_ID, versionId: VERSION_ID },
    });
    expect(getCodingLabOutputSchema.parse(lab.structuredContent).lab.id).toBe(
      LAB_ID
    );
    for (const result of [listed, detail, lab]) {
      expect(result.isError).not.toBe(true);
      expect(JSON.stringify(result)).not.toContain('must-not-escape');
      expect(result.content).toEqual([
        { type: 'text', text: JSON.stringify(result.structuredContent) },
      ]);
    }
    for (const request of upstream.requests) {
      expect(request.method).toBe('GET');
      expect(request.headers.authorization).toBeUndefined();
      expect(request.headers.cookie).toBeUndefined();
    }
  });
  it.each([
    ['get_coding_lab', { labId: '../secret' }],
    ['get_workshop', { workshopId: 'w' }],
    ['list_workshops', { sectionId: 'angular', extra: true }],
    ['list_workshops', { sectionId: ' ' }],
    ['list_workshops', { sectionId: 'x'.repeat(121) }],
    ['create_workshop', { sectionId: 'angular' }],
  ])(
    'rejects invalid/unknown tool call %s before contacting upstream',
    async (name, args) => {
      // SDK revisions represent validation failures as either an RPC rejection or isError.
      const result = await client
        .callTool({
          name,
          arguments: args,
        })
        .catch(() => undefined);
      if (result) expect(result.isError).toBe(true);
      expect(upstream.requests).toHaveLength(0);
    }
  );
  it.each([
    [404, 'NOT_FOUND'],
    [403, 'FORBIDDEN'],
    [503, 'UPSTREAM_UNAVAILABLE'],
  ])('returns safe execution error for HTTP %i', async (status, code) => {
    upstream.status = status;
    upstream.body = { secret: 'must-not-escape' };
    const result = await client.callTool({
      name: 'get_coding_lab',
      arguments: { labId: LAB_ID },
    });
    expect(result.isError).toBe(true);
    const first = result.content[0];
    if (first.type !== 'text') throw new Error('Expected text error');
    expect(toolErrorSchema.parse(JSON.parse(first.text)).error.code).toBe(code);
    expect(JSON.stringify(result)).not.toContain('must-not-escape');
  });
  it('reports missing workshop and malformed upstream data', async () => {
    const missing = await client.callTool({
      name: 'get_workshop',
      arguments: { sectionId: 'angular', workshopId: 'missing' },
    });
    expect(JSON.stringify(missing.content)).toContain('NOT_FOUND');
    upstream.body = [{ ...workshopFixture, level: 'invalid' }];
    const malformed = await client.callTool({
      name: 'list_workshops',
      arguments: { sectionId: 'angular' },
    });
    expect(JSON.stringify(malformed.content)).toContain(
      'UPSTREAM_INVALID_RESPONSE'
    );
  });
  it.each<Record<string, string>>([
    { Host: 'evil.example' },
    { Origin: 'https://evil.example' },
    { Origin: 'null' },
    { Origin: 'http://localhost/path' },
  ])('rejects invalid Host/Origin %p', async (headers) => {
    await request(new URL(url).origin).get('/mcp').set(headers).expect(403);
    expect(upstream.requests).toHaveLength(0);
  });
  it('accepts a valid local Origin and rejects unsupported methods', async () => {
    expect(
      (await fetch(url, { headers: { Origin: new URL(url).origin } })).status
    ).toBe(405);
    expect((await fetch(url, { method: 'DELETE' })).status).toBe(405);
  });
  it('rejects oversized request bodies and retired seed routes', async () => {
    expect(
      (
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ padding: 'x'.repeat(65536) }),
        })
      ).status
    ).toBe(413);
    expect((await fetch(url.replace('/mcp', '/example-crud'))).status).toBe(
      404
    );
    expect(upstream.requests).toHaveLength(0);
  });
  it('rejects malformed protocol and header/body mismatches without upstream calls', async () => {
    const malformed = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: '{',
    });
    expect(malformed.status).toBe(400);
    const mismatch = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        'MCP-Protocol-Version': '2026-07-28',
        'Mcp-Method': 'tools/call',
        'Mcp-Name': 'wrong_tool',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'list_workshops',
          arguments: { sectionId: 'angular' },
          _meta: {
            'io.modelcontextprotocol/protocolVersion': '2026-07-28',
            'io.modelcontextprotocol/clientInfo': {
              name: 'raw-test',
              version: '1.0.0',
            },
            'io.modelcontextprotocol/clientCapabilities': {},
          },
        },
      }),
    });
    expect(mismatch.status).toBe(400);
    expect(upstream.requests).toHaveLength(0);
  });
  it('supports a legacy SDK handshake without server sessions', async () => {
    const legacy = new Client({ name: 'legacy-test', version: '1.0.0' });
    try {
      const transport = new StreamableHTTPClientTransport(new URL(url));
      await legacy.connect(transport);
      expect(transport.sessionId).toBeUndefined();
      expect((await legacy.listTools()).tools).toHaveLength(3);
      const result = await legacy.callTool({
        name: 'get_coding_lab',
        arguments: { labId: LAB_ID },
      });
      expect(
        getCodingLabOutputSchema.parse(result.structuredContent).lab.id
      ).toBe(LAB_ID);
    } finally {
      await legacy.close();
    }
  });
});
