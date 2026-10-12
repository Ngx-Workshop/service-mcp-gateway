import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import { z } from 'zod';
import {
  getCodingLabOutputSchema,
  getWorkshopOutputSchema,
  listWorkshopsOutputSchema,
  toolErrorSchema,
} from '../src/tools/catalog.schemas';
import {
  publishedLabSourceSchema,
  workshopSourceSchema,
} from '../src/clients/upstream.schemas';

// Opt-in real-service verification. Only public GETs and read-only MCP calls.
// Never seeds data, touches databases, starts services or sends credentials.
function localUrl(value: string): URL {
  const url = new URL(value);
  const production = process.env.MCP_VERIFY_PRODUCTION === 'true';
  const approved = [
    'https://mcp.ngx-workshop.io/mcp',
    'https://beta.ngx-workshop.io/api/documents',
    'https://beta.ngx-workshop.io/api/coding-labs',
  ];
  if (production) {
    assert(
      approved.includes(value),
      'Production checks require exact approved HTTPS URLs'
    );
    return url;
  }
  assert(
    ['http:', 'https:'].includes(url.protocol) &&
      ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash,
    'Real-service verification requires loopback HTTP(S) URLs without credentials, query or fragment'
  );
  return url;
}

async function readJson(base: URL, path: string): Promise<unknown> {
  const response = await fetch(base.href.replace(/\/$/, '') + path, {
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
  });
  assert.equal(response.status, 200, `Real owner GET ${path} must succeed`);
  const data: unknown = await response.json();
  return data;
}
async function call<T>(
  client: Client,
  name: string,
  args: Record<string, unknown>,
  schema: z.ZodType<T>
): Promise<T> {
  const result = await client.callTool(
    { name, arguments: args },
    {
      timeout: 10000,
    }
  );
  assert.notEqual(
    result.isError,
    true,
    `${name} must succeed against the real local service`
  );
  const data = schema.parse(result.structuredContent);
  assert.deepEqual(
    result.content,
    [{ type: 'text', text: JSON.stringify(result.structuredContent) }],
    `${name} text and structured outputs must agree`
  );
  return data;
}
async function expectMissing(
  client: Client,
  name: string,
  args: Record<string, unknown>
) {
  const result = await client.callTool({ name, arguments: args });
  assert.equal(
    result.isError,
    true,
    `${name} missing resource must be a tool execution error`
  );
  const content = result.content[0];
  assert(content?.type === 'text', 'Tool error must contain JSON text');
  const data: unknown = JSON.parse(content.text);
  assert.equal(
    toolErrorSchema.parse(data).error.code,
    'NOT_FOUND',
    `${name} must preserve not-found semantics`
  );
}
async function main() {
  const gatewayUrl = localUrl(
    process.env.MCP_GATEWAY_URL ?? 'http://127.0.0.1:3011/mcp'
  );
  const documentUrl = localUrl(
    process.env.DOCUMENT_BASE_URL ?? 'http://127.0.0.1:3007'
  );
  const labsUrl = localUrl(
    process.env.CODING_LABS_BASE_URL ?? 'http://127.0.0.1:3009'
  );
  const sections = z
    .object({ sections: z.record(z.string(), z.object({ _id: z.string() })) })
    .parse(await readJson(documentUrl, '/navigation/sections'));
  const workshopGroups: {
    sectionId: string;
    workshops: z.infer<typeof workshopSourceSchema>[];
  }[] = [];
  for (const sectionId of Object.keys(sections.sections)) {
    const workshops = z
      .array(workshopSourceSchema)
      .parse(
        await readJson(
          documentUrl,
          `/navigation/workshops?section=${encodeURIComponent(sectionId)}`
        )
      );
    workshopGroups.push({ sectionId, workshops });
  }
  const catalog = z
    .array(z.object({ labId: z.string() }))
    .parse(await readJson(labsUrl, '/published-labs'));
  const labContents: z.infer<typeof publishedLabSourceSchema>[] = [];
  for (const { labId } of catalog)
    labContents.push(
      publishedLabSourceSchema.parse(
        await readJson(labsUrl, `/published-labs/${encodeURIComponent(labId)}`)
      )
    );
  const workshopCount = workshopGroups.reduce(
    (count, group) => count + group.workshops.length,
    0
  );
  assert(
    workshopCount > 0 && labContents.length > 0,
    'Need at least one real workshop and published lab; empty catalogs do not verify all tools. Publish local content through the owning application first.'
  );

  for (const mode of ['modern', 'legacy'] as const) {
    const client = new Client(
      { name: 'ngx-real-local-integration', version: '1.0.0' },
      mode === 'modern'
        ? { versionNegotiation: { mode: { pin: '2026-07-28' } } }
        : {}
    );
    try {
      await client.connect(
        new StreamableHTTPClientTransport(gatewayUrl, {
          requestInit: {
            headers: process.env.MCP_BEARER_TOKEN
              ? { Authorization: `Bearer ${process.env.MCP_BEARER_TOKEN}` }
              : {},
          },
        })
      );
      const { tools } = await client.listTools();
      assert.deepEqual(
        tools.map((tool) => tool.name).sort(),
        ['get_coding_lab', 'get_workshop', 'list_workshops'],
        'Discover exactly three catalog tools'
      );
      for (const tool of tools)
        assert.equal(
          tool.annotations?.readOnlyHint,
          true,
          'Every discovered tool is read-only'
        );
      const observedKinds = new Set<string>();
      for (const { sectionId, workshops } of workshopGroups) {
        const listed = await call(
          client,
          'list_workshops',
          { sectionId },
          listWorkshopsOutputSchema
        );
        assert.deepEqual(
          listed.workshops,
          workshops.map((workshop) => ({
            id: workshop._id,
            sectionId: workshop.sectionId,
            title: workshop.name,
            summary: workshop.summary,
            level: workshop.level,
          })),
          'MCP summaries must match real document responses and omit internal metadata'
        );
        for (const workshop of workshops) {
          const detail = await call(
            client,
            'get_workshop',
            { sectionId, workshopId: workshop._id },
            getWorkshopOutputSchema
          );
          assert.equal(
            detail.workshop.id,
            workshop._id,
            'Detail must identify the requested real workshop'
          );
          assert.equal(
            detail.workshop.title,
            workshop.name,
            'Detail must preserve the real workshop title'
          );
          assert.deepEqual(
            { ...detail.workshop, outline: undefined },
            {
              id: workshop._id,
              sectionId: workshop.sectionId,
              title: workshop.name,
              summary: workshop.summary,
              level: workshop.level,
              outline: undefined,
            },
            'Detail must preserve every public workshop metadata field'
          );
          assert.deepEqual(
            detail.workshop.outline,
            [...workshop.workshopDocuments]
              .sort((a, b) => a.sortId - b.sortId)
              .map((entry) => ({
                id: entry._id,
                title: entry.name,
                kind: entry.kind,
                resourceId:
                  entry.kind === 'PAGE' ? entry._id : entry.resourceId,
              })),
            'MCP outline must preserve ordered page/lab/assessment identities'
          );
          for (const entry of detail.workshop.outline)
            observedKinds.add(entry.kind);
        }
      }
      for (const source of labContents) {
        const latest = await call(
          client,
          'get_coding_lab',
          { labId: source.labId },
          getCodingLabOutputSchema
        );
        assert.equal(
          latest.lab.id,
          source.labId,
          'Published lab identity must match real service'
        );
        for (const key of [
          'versionId',
          'versionNumber',
          'title',
          'difficulty',
          'language',
          'promptMarkdown',
          'hints',
          'starterCode',
          'sampleTests',
          'entryFnName',
        ] as const) {
          assert.deepEqual(
            latest.lab[key],
            source[key],
            `Published lab ${key} must preserve real public data`
          );
        }
        const pinned = await call(
          client,
          'get_coding_lab',
          { labId: source.labId, versionId: source.versionId },
          getCodingLabOutputSchema
        );
        assert.deepEqual(
          pinned,
          latest,
          'Pinned latest published version must return identical content'
        );
        assert(
          !('hiddenTests' in latest.lab) &&
            !('referenceSolution' in latest.lab),
          'Authoring content must not escape'
        );
        for (const test of latest.lab.sampleTests)
          assert(!('_id' in test), 'Sample-test storage IDs must not escape');
        const missingVersion = 'f'.repeat(24);
        assert.notEqual(
          source.versionId,
          missingVersion,
          'Missing-version probe must not select an existing version'
        );
        await expectMissing(client, 'get_coding_lab', {
          labId: source.labId,
          versionId: missingVersion,
        });
      }
      const missingSection = `mcp-check-${randomUUID()}`;
      const empty = await call(
        client,
        'list_workshops',
        { sectionId: missingSection },
        listWorkshopsOutputSchema
      );
      assert.deepEqual(
        empty,
        { workshops: [] },
        'Unknown section produces a genuine empty list'
      );
      const first = workshopGroups.find((group) => group.workshops.length > 0)!;
      await expectMissing(client, 'get_workshop', {
        sectionId: first.sectionId,
        workshopId: `missing-${randomUUID()}`,
      });
      await expectMissing(client, 'get_workshop', {
        sectionId: missingSection,
        workshopId: first.workshops[0]._id,
      });
      const missingLab = 'f'.repeat(24);
      assert(
        !catalog.some((lab) => lab.labId === missingLab),
        'Missing-lab probe must not select existing content'
      );
      await expectMissing(client, 'get_coding_lab', { labId: missingLab });
      for (const [name, args] of [
        ['list_workshops', { sectionId: first.sectionId, unexpected: true }],
        ['get_workshop', { workshopId: first.workshops[0]._id }],
        ['get_coding_lab', { labId: '../invalid' }],
      ] as const) {
        let rejected = false;
        try {
          rejected =
            (await client.callTool({ name, arguments: args })).isError === true;
        } catch {
          rejected = true;
        }
        assert(rejected, `${name} malformed arguments must be rejected`);
      }
      console.log(
        JSON.stringify({
          status: 'PASS',
          mode,
          sections: workshopGroups.length,
          workshops: workshopCount,
          publishedLabs: labContents.length,
          outlineKinds: [...observedKinds].sort(),
          checks: [
            'discovery',
            'all real records',
            'text/structured agreement',
            'pinned latest version',
            'public-field projection',
            'empty section',
            'missing/wrong-section workshop',
            'missing lab/version',
            'malformed inputs',
          ],
        })
      );
    } finally {
      await client.close();
    }
  }
}
void main().catch((error: unknown) => {
  console.error(
    error instanceof z.ZodError
      ? 'Real owner payload violates the consumed catalog contract; investigate adapter compatibility.'
      : error instanceof Error
        ? error.message
        : 'Real catalog integration failed'
  );
  process.exitCode = 1;
});
