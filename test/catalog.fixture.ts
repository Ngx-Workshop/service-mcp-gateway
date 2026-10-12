import { createServer, IncomingHttpHeaders, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import type { WorkshopDto } from '@tmdjr/document-contracts';
import type { PublishedLabDto } from '@tmdjr/coding-labs-contracts';

export const LAB_ID = '0123456789abcdef01234567';
export const VERSION_ID = 'abcdef0123456789abcdef01';
export const workshopFixture = {
  _id: 'workshop-one',
  sectionId: 'angular',
  name: 'Angular basics',
  summary: 'Learn Angular',
  level: 1,
  sortId: 0,
  thumbnail: '',
  workshopDocumentGroupId: 'group',
  workshopDocumentsLastUpdated: '2026-10-12T00:00:00Z',
  workshopDocuments: [
    {
      _id: 'lab-entry',
      name: 'Practice',
      sortId: 2,
      kind: 'CODING_LAB',
      resourceId: LAB_ID,
    },
    { _id: 'page-one', name: 'Introduction', sortId: 1, kind: 'PAGE' },
    {
      _id: 'test-entry',
      name: 'Assessment',
      sortId: 3,
      kind: 'ASSESSMENT_TEST',
      resourceId: 'test-one',
    },
  ],
} satisfies WorkshopDto;
export const labFixture = {
  labId: LAB_ID,
  versionId: VERSION_ID,
  versionNumber: 1,
  title: 'Sum',
  language: 'typescript',
  promptMarkdown: 'Return the sum.',
  hints: ['Add the values.'],
  starterCode: 'export function sum() {}',
  sampleTests: [
    { name: 'positive values', kind: 'io', input: { a: 1, b: 2 }, expected: 3 },
  ],
} satisfies PublishedLabDto;

export class CatalogUpstreamFixture {
  readonly requests: {
    method: string | undefined;
    url: string;
    headers: IncomingHttpHeaders;
  }[] = [];
  status = 200;
  body: unknown = undefined;
  delayMs = 0;
  url = '';
  private server?: Server;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  async start() {
    this.server = createServer((request, response) => {
      const url = new URL(request.url ?? '/', 'http://localhost');
      this.requests.push({
        method: request.method,
        url: url.pathname + url.search,
        headers: request.headers,
      });
      const send = () => {
        response.writeHead(this.status, {
          'Content-Type': 'application/json',
          ...(this.status === 302
            ? { Location: 'http://example.invalid/secret' }
            : {}),
        });
        response.end(
          JSON.stringify(
            this.body ??
              (url.pathname === '/navigation/workshops'
                ? [
                    {
                      ...workshopFixture,
                      sectionId: url.searchParams.get('section'),
                      authorSecret: 'must-not-escape',
                    },
                  ]
                : {
                    ...labFixture,
                    solution: 'must-not-escape',
                    hiddenTests: ['must-not-escape'],
                  })
          )
        );
      };
      if (this.delayMs) {
        const timer = setTimeout(() => {
          this.timers.delete(timer);
          send();
        }, this.delayMs);
        this.timers.add(timer);
      } else send();
    });
    await new Promise<void>((resolve) =>
      this.server?.listen(0, '127.0.0.1', resolve)
    );
    this.url = `http://127.0.0.1:${(this.server.address() as AddressInfo).port}`;
  }
  reset() {
    this.requests.length = 0;
    this.status = 200;
    this.body = undefined;
    this.delayMs = 0;
  }
  async close() {
    for (const timer of this.timers) clearTimeout(timer);
    this.server?.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      this.server?.close((error) => (error ? reject(error) : resolve()))
    );
  }
}
