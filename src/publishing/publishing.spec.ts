import { readFileSync } from 'node:fs';
import { DraftAgentService } from './draft-agent.service';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import type { AxiosResponse } from 'axios';
import { loadCatalogConfig } from '../mcp/catalog.config';
import { blocksSchema, workshopDraftSchema } from './publishing.schemas';
import { publishingDraft } from '../../test/fixtures/publishing-draft';
import { PublishingRunService } from './publishing-run.service';
import { PublishingOwnerClient } from './owner.client';
import { PublishingController } from './publishing.controller';
import { AuthClientService } from '@tmdjr/ngx-auth-client';
import { PublishingToolsService } from './publishing-tools.service';
import type { Request, Response } from 'express';
const id = (n: number) => n.toString(16).padStart(24, '0');
const identity = { token: 'private-token', subject: 'admin-1' };
const config = (directory: string) =>
  loadCatalogConfig({
    DOCUMENT_BASE_URL: 'http://localhost:4001',
    CODING_LABS_BASE_URL: 'http://localhost:4002',
    MCP_AUTH_MODE: 'local-public',
    MCP_LOCAL_DEV: 'true',
    PUBLISHING_ENABLED: 'true',
    ASSESSMENT_BASE_URL: 'http://localhost:4003',
    UPLOADER_BASE_URL: 'http://localhost:4004',
    PUBLISHING_JOURNAL_DIRECTORY: directory,
  });
describe('draft generation', () => {
  it('accepts the user editor specimen including nested image/quiz JSON', () => {
    const value: unknown = JSON.parse(
      readFileSync(
        join(__dirname, '../../test/fixtures/editor-blocks.json'),
        'utf8'
      )
    );
    const blocks = blocksSchema.parse(value);
    expect(blocks).toHaveLength(23);
    expect(blocks[12].componentInstanceName).toBe('NgxEditorJs2ImageComponent');
    expect(JSON.parse(blocks[12].dataClean)).toHaveProperty('url');
  });
  it('uses server model credentials and verified uploader images without owner writes', async () => {
    const settings = config('/tmp/unused');
    settings.publishing!.model = 'configured-model';
    settings.publishing!.apiKey = 'private-model-key';
    const post = jest.fn().mockReturnValue(
      of({
        data: {
          status: 'completed',
          output: [
            {
              type: 'message',
              content: [
                {
                  type: 'output_text',
                  text: JSON.stringify(publishingDraft),
                },
              ],
            },
          ],
        },
      } as AxiosResponse)
    );
    const image = jest
      .fn()
      .mockResolvedValue([
        { name: 'Diagram', storageUrl: 'https://assets.example/diagram.png' },
      ]);
    const agent = new DraftAgentService(
      { post } as unknown as HttpService,
      { image } as unknown as PublishingOwnerClient,
      settings
    );
    expect(
      await agent.generate(
        { brief: 'Teach functions', sectionId: 'angular', level: 1 },
        identity
      )
    ).toEqual(publishingDraft);
    expect(image).toHaveBeenCalledWith(
      { operation: 'find', query: '' },
      identity
    );
    const call = (post.mock.calls as unknown[][])[0];
    expect(call[0]).toBe('https://api.openai.com/v1/responses');
    expect((call[2] as { headers: unknown }).headers).toEqual({
      Authorization: 'Bearer private-model-key',
    });
    expect((call[1] as { input: string }).input).toContain(
      'https://assets.example/diagram.png'
    );
  });
  it('rejects refused model responses', async () => {
    const settings = config('/tmp/unused');
    settings.publishing!.model = 'configured-model';
    settings.publishing!.apiKey = 'private-model-key';
    const post = jest.fn().mockReturnValue(
      of({
        data: {
          status: 'completed',
          output: [{ type: 'message', content: [{ type: 'refusal' }] }],
        },
      } as AxiosResponse)
    );
    const agent = new DraftAgentService(
      { post } as unknown as HttpService,
      {
        image: jest.fn().mockResolvedValue([]),
      } as unknown as PublishingOwnerClient,
      settings
    );
    await expect(
      agent.generate(
        { brief: 'Teach functions', sectionId: 'angular', level: 1 },
        identity
      )
    ).rejects.toThrow();
  });
});
describe('publishing boundaries', () => {
  it('rejects mismatched assessment, broken block ordering, unsafe HTML and invalid answers', () => {
    expect(
      workshopDraftSchema.safeParse({
        ...publishingDraft,
        assessment: { ...publishingDraft.assessment, subject: 'other' },
      }).success
    ).toBe(false);
    expect(
      blocksSchema.safeParse([
        { ...publishingDraft.pages[0].blocks[0], sortIndex: 2 },
      ]).success
    ).toBe(false);
    expect(
      blocksSchema.safeParse([
        {
          ...publishingDraft.pages[0].blocks[0],
          dataClean: '<img src=x onerror=alert(1)>',
        },
      ]).success
    ).toBe(false);
    expect(
      workshopDraftSchema.safeParse({
        ...publishingDraft,
        assessment: {
          ...publishingDraft.assessment,
          testQuestions: [
            {
              ...publishingDraft.assessment.testQuestions[0],
              answer: 'invalid',
            },
          ],
        },
      }).success
    ).toBe(false);
  });
  it('sanitizes encoded HTML URLs and preserves the supplied editor format', () => {
    const block = blocksSchema.parse([
      {
        ...publishingDraft.pages[0].blocks[0],
        dataClean: '<a href="jav&#97;script:alert(1)">link</a><b>bold</b>',
      },
    ])[0];
    expect(block.dataClean).toBe('<a>link</a><b>bold</b>');
    expect(block.componentInstanceName).toBe('ParagraphBlockComponent');
  });
  it('serializes blocks in document html and forwards only the selected admin bearer', async () => {
    const request = jest
      .fn()
      .mockReturnValue(of({ data: { _id: id(1) } } as AxiosResponse));
    const client = new PublishingOwnerClient(
      { request } as unknown as HttpService,
      config('/tmp/unused')
    );
    await client.document(
      {
        operation: 'update_page',
        id: id(1),
        blocks: publishingDraft.pages[0].blocks,
      },
      identity
    );
    const call = (request.mock.calls as unknown[][])[0][0] as {
      data: { html: string };
      headers: Record<string, string>;
      maxRedirects: number;
    };
    expect(JSON.parse(call.data.html)).toEqual(publishingDraft.pages[0].blocks);
    expect(call.headers).toEqual({ Authorization: 'Bearer private-token' });
    expect(call.maxRedirects).toBe(0);
  });
  it('requires validated admin identity even in local-public mode', async () => {
    const validateAccessToken = jest
      .fn()
      .mockImplementation((req: { user: unknown }) => {
        req.user = { sub: 'regular', role: 'regular' };
        return true;
      });
    const controller = new PublishingController(
      {} as PublishingToolsService,
      { validateAccessToken } as unknown as AuthClientService,
      config('/tmp/unused')
    );
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const response = {
      status,
      json,
      setHeader: jest.fn(),
    } as unknown as Response;
    expect(
      await controller.authorize(
        {
          headers: { authorization: 'Bearer valid' },
          rawHeaders: ['Authorization', 'Bearer valid'],
        } as Request,
        response
      )
    ).toBeUndefined();
    expect(status).toHaveBeenCalledWith(403);
    expect(validateAccessToken).toHaveBeenCalledTimes(1);
  });
});
describe('publishing receipts', () => {
  let directory: string;
  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'ngx-publishing-'));
  });
  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });
  const owner = (passed = true) => ({
    request: jest.fn().mockResolvedValue({}),
    document: jest
      .fn()
      .mockImplementation((v: { operation: string }) =>
        Promise.resolve(
          v.operation === 'create_workshop'
            ? { _id: id(1), workshopDocuments: [{ _id: id(2), kind: 'PAGE' }] }
            : { _id: id(1) }
        )
      ),
    lab: jest
      .fn()
      .mockImplementation((v: { operation: string }) =>
        Promise.resolve(
          v.operation === 'create'
            ? { _id: id(3) }
            : v.operation === 'create_version'
              ? { _id: id(4), contentHash: 'hash' }
              : v.operation === 'verify'
                ? { passed, contentHash: 'hash' }
                : { _id: id(4) }
        )
      ),
    assessment: jest.fn().mockResolvedValue({ _id: id(5) }),
  });
  it('publishes in order, reuses initial page and returns the same receipt on duplicate', async () => {
    const adapter = owner();
    const service = new PublishingRunService(
      adapter as unknown as PublishingOwnerClient,
      config(directory)
    );
    const input = { requestId: randomUUID(), draft: publishingDraft };
    const result = await service.publish(input, identity);
    expect(result.status).toBe('complete');
    expect(result.steps.map((s) => s.name)).toEqual([
      'create_workshop',
      'write_page_0',
      'name_page_0',
      'create_lab_0',
      'create_version_0',
      'verify_lab_0',
      'publish_lab_0',
      'attach_lab_0',
      'create_assessment',
      'attach_assessment',
    ]);
    const count = adapter.document.mock.calls.length;
    expect(await service.publish(input, identity)).toEqual(result);
    expect(adapter.document.mock.calls.length).toBe(count);
    await expect(
      service.get(input.requestId, { ...identity, subject: 'another' })
    ).rejects.toThrow();
    await expect(
      service.publish(
        { ...input, draft: { ...publishingDraft, name: 'Changed' } },
        identity
      )
    ).rejects.toThrow('different draft');
  });
  it('stops before lab publication on verification failure and retains resources', async () => {
    const adapter = owner(false);
    const service = new PublishingRunService(
      adapter as unknown as PublishingOwnerClient,
      config(directory)
    );
    const result = await service.publish(
      { requestId: randomUUID(), draft: publishingDraft },
      identity
    );
    expect(result.status).toBe('needs_recovery');
    expect(result.steps.some((s) => s.name === 'publish_lab_0')).toBe(false);
    expect(adapter.assessment).not.toHaveBeenCalled();
    expect(result.steps.find((s) => s.name === 'create_lab_0')?.result).toEqual(
      { _id: id(3) }
    );
  });
  it('records uncertain writes without repeating them', async () => {
    const adapter = owner();
    adapter.assessment.mockRejectedValue(new Error('timeout'));
    const service = new PublishingRunService(
      adapter as unknown as PublishingOwnerClient,
      config(directory)
    );
    const input = { requestId: randomUUID(), draft: publishingDraft };
    const result = await service.publish(input, identity);
    expect(result.steps.at(-1)).toEqual({
      name: 'create_assessment',
      status: 'pending',
    });
    await service.publish(input, identity);
    expect(adapter.assessment).toHaveBeenCalledTimes(1);
  });
});
