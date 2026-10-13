import { createServer, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { loadCatalogConfig } from '../mcp/catalog.config';
import { PublishingOwnerClient } from './owner.client';
describe('Publishing owner HTTP adapters', () => {
  let server: Server;
  let client: PublishingOwnerClient;
  const seen: {
    url: string;
    authorization?: string;
    cookie?: string;
    contentType?: string;
    body: string;
  }[] = [];
  beforeAll(async () => {
    server = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        seen.push({
          url: req.url!,
          authorization: req.headers.authorization,
          cookie: req.headers.cookie,
          contentType: req.headers['content-type'],
          body: Buffer.concat(chunks).toString(),
        });
        res.setHeader('Content-Type', 'application/json');
        res.end(
          req.method === 'GET'
            ? JSON.stringify([
                {
                  _id: '000000000000000000000001',
                  name: 'Diagram',
                  archived: false,
                  storageStatus: 'READY',
                  mediaType: 'image/png',
                  storageUrl: 'https://assets.example/diagram.png',
                },
                {
                  name: 'Pending',
                  archived: false,
                  storageStatus: 'PENDING_STORAGE',
                  mediaType: 'image/png',
                },
              ])
            : JSON.stringify({
                _id: '000000000000000000000002',
                storageUrl: 'https://assets.example/uploaded.png',
              })
        );
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve)
    );
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const config = loadCatalogConfig({
      DOCUMENT_BASE_URL: url,
      CODING_LABS_BASE_URL: url,
      MCP_AUTH_MODE: 'local-public',
      MCP_LOCAL_DEV: 'true',
      PUBLISHING_ENABLED: 'true',
      ASSESSMENT_BASE_URL: url,
      UPLOADER_BASE_URL: url,
      PUBLISHING_JOURNAL_DIRECTORY: '/tmp/unused',
    });
    client = new PublishingOwnerClient(new HttpService(axios.create()), config);
  });
  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
  it('finds only ready image assets through service-uploader', async () => {
    const result = await client.image(
      { operation: 'find', query: 'Diagram' },
      { token: 'admin-token', subject: 'admin' }
    );
    expect(result).toHaveLength(1);
    expect(seen.at(-1)?.url).toBe('/uploader?archived=false');
    expect(seen.at(-1)?.authorization).toBe('Bearer admin-token');
    expect(seen.at(-1)?.cookie).toBeUndefined();
  });
  it('sends actual multipart bytes to uploader instead of creating fake URL metadata', async () => {
    const result = await client.image(
      {
        operation: 'upload',
        name: 'diagram.png',
        mediaType: 'image/png',
        base64: Buffer.from('image-bytes').toString('base64'),
      },
      { token: 'admin-token', subject: 'admin' }
    );
    expect(result).toHaveProperty('storageUrl');
    expect(seen.at(-1)?.url).toBe('/uploader/upload');
    expect(seen.at(-1)?.contentType).toContain(
      'multipart/form-data; boundary='
    );
    expect(seen.at(-1)?.body).toContain('image-bytes');
    expect(seen.at(-1)?.body).toContain('name="file"');
  });
});
