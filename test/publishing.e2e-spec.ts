import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthClientService } from '@tmdjr/ngx-auth-client';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import request from 'supertest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { CATALOG_CONFIG, loadCatalogConfig } from '../src/mcp/catalog.config';
import { PublishingOwnerClient } from '../src/publishing/owner.client';
import { publishingDraft } from './fixtures/publishing-draft';
import { localBoundary } from '../src/mcp/local-boundary';
describe('Administrator publishing protocol', () => {
  let app: INestApplication;
  let url: string;
  let directory: string;
  const owner = {
    document: jest.fn().mockResolvedValue({}),
    assessment: jest.fn(),
    lab: jest.fn(),
    image: jest.fn(),
  };
  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'ngx-publishing-protocol-'));
    const config = loadCatalogConfig({
      DOCUMENT_BASE_URL: 'http://127.0.0.1:4001',
      CODING_LABS_BASE_URL: 'http://127.0.0.1:4002',
      MCP_AUTH_MODE: 'local-public',
      MCP_LOCAL_DEV: 'true',
      PUBLISHING_ENABLED: 'true',
      ASSESSMENT_BASE_URL: 'http://127.0.0.1:4003',
      UPLOADER_BASE_URL: 'http://127.0.0.1:4004',
      PUBLISHING_JOURNAL_DIRECTORY: directory,
    });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CATALOG_CONFIG)
      .useValue(config)
      .overrideProvider(PublishingOwnerClient)
      .useValue(owner)
      .overrideProvider(AuthClientService)
      .useValue({
        validateAccessToken: (req: {
          headers: { authorization: string };
          user?: unknown;
        }) => {
          if (req.headers.authorization !== 'Bearer admin-token')
            throw new Error('Invalid token');
          req.user = { sub: 'admin', role: 'admin' };
          return Promise.resolve(true);
        },
      })
      .compile();
    app = module.createNestApplication({ bodyParser: false });
    app.use(localBoundary);
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });
  afterAll(async () => {
    await app?.close();
    await rm(directory, { recursive: true, force: true });
  });
  it('rejects missing and catalog-only credentials before tools execute', async () => {
    await request(url)
      .post('/publisher/tools')
      .send({ name: 'manage_assessment', input: { operation: 'list' } })
      .expect(401);
    await request(url)
      .post('/mcp/publishing')
      .set('Authorization', 'Bearer catalog-only')
      .send({})
      .expect(401);
    expect(owner.assessment).not.toHaveBeenCalled();
  });
  it('discovers eight authoring tools with official client and validates editor draft', async () => {
    const client = new Client(
      { name: 'publisher-test', version: '1' },
      { versionNegotiation: { mode: { pin: '2026-07-28' } } }
    );
    try {
      await client.connect(
        new StreamableHTTPClientTransport(new URL(`${url}/mcp/publishing`), {
          requestInit: { headers: { Authorization: 'Bearer admin-token' } },
        })
      );
      const discovery = await client.listTools();
      expect(discovery.tools).toHaveLength(8);
      expect(
        discovery.tools.find((t) => t.name === 'publish_workshop')?.annotations
          ?.readOnlyHint
      ).toBe(false);
      const result = await client.callTool({
        name: 'validate_workshop_draft',
        arguments: { draft: publishingDraft },
      });
      expect(result.isError).not.toBe(true);
      expect(result.structuredContent).toEqual({ data: publishingDraft });
    } finally {
      await client.close();
    }
  });
  it('uses the same facade tool dispatcher and enforces strict input', async () => {
    const result = await request(url)
      .post('/publisher/tools')
      .set('Authorization', 'Bearer admin-token')
      .send({
        name: 'validate_workshop_draft',
        input: { draft: publishingDraft },
      })
      .expect(200);
    expect(
      (result.body as { structuredContent: { data: { name: string } } })
        .structuredContent.data.name
    ).toBe(publishingDraft.name);
    const invalid = await request(url)
      .post('/publisher/tools')
      .set('Authorization', 'Bearer admin-token')
      .send({
        name: 'manage_document',
        input: { operation: 'delete_workshop', id: 'bad' },
      })
      .expect(200);
    expect((invalid.body as { isError: boolean }).isError).toBe(true);
    expect(owner.document).not.toHaveBeenCalled();
  });
});
