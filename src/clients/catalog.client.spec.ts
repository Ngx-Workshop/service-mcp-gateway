import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CatalogClient } from './catalog.client';
import { safeCatalogError } from './catalog-error';
import { CATALOG_CONFIG } from '../mcp/catalog.config';
import {
  CatalogUpstreamFixture,
  LAB_ID,
  VERSION_ID,
  labFixture,
  workshopFixture,
} from '../../test/catalog.fixture';

describe('Catalog adapters over HTTP', () => {
  const upstream = new CatalogUpstreamFixture();
  let module: TestingModule;
  let client: CatalogClient;
  beforeAll(async () => {
    await upstream.start();
    module = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        CatalogClient,
        {
          provide: CATALOG_CONFIG,
          useValue: {
            documentBaseUrl: upstream.url,
            codingLabsBaseUrl: upstream.url,
            port: 3011,
          },
        },
      ],
    }).compile();
    client = module.get(CatalogClient);
  });
  beforeEach(() => upstream.reset());
  afterAll(async () => {
    await module.close();
    await upstream.close();
  });
  it('encodes the section as a query value and projects catalog summaries', async () => {
    const result = await firstValueFrom(
      client.listWorkshops('angular & security')
    );
    expect(
      new URL(upstream.requests[0].url, upstream.url).searchParams.get(
        'section'
      )
    ).toBe('angular & security');
    expect(result.workshops[0]).toEqual({
      id: 'workshop-one',
      sectionId: 'angular & security',
      title: 'Angular basics',
      summary: 'Learn Angular',
      level: 1,
    });
    expect(upstream.requests[0].method).toBe('GET');
  });
  it('sorts all outline variants without changing the upstream array', async () => {
    const result = await firstValueFrom(
      client.getWorkshop('angular', 'workshop-one')
    );
    expect(result.workshop.outline.map((entry) => entry.resourceId)).toEqual([
      'page-one',
      LAB_ID,
      'test-one',
    ]);
    expect(workshopFixture.workshopDocuments[0]._id).toBe('lab-entry');
  });
  it('returns an empty list without inventing records', async () => {
    upstream.body = [];
    expect(await firstValueFrom(client.listWorkshops('angular'))).toEqual({
      workshops: [],
    });
  });
  it('gets only the public lab route with the requested published version', async () => {
    const result = await firstValueFrom(
      client.getCodingLab(LAB_ID, VERSION_ID)
    );
    expect(upstream.requests[0].url).toBe(
      `/published-labs/${LAB_ID}?versionId=${VERSION_ID}`
    );
    expect(result.lab.sampleTests).toEqual(labFixture.sampleTests);
    expect(JSON.stringify(result)).not.toContain('must-not-escape');
  });
  it('rejects a record from another section and mismatched lab/version IDs', async () => {
    upstream.body = [{ ...workshopFixture, sectionId: 'private' }];
    await expect(
      firstValueFrom(client.listWorkshops('angular'))
    ).rejects.toThrow('invalid data');
    upstream.body = { ...labFixture, labId: 'f'.repeat(24) };
    await expect(firstValueFrom(client.getCodingLab(LAB_ID))).rejects.toThrow(
      'invalid data'
    );
    upstream.body = labFixture;
    await expect(
      firstValueFrom(client.getCodingLab(LAB_ID, 'f'.repeat(24)))
    ).rejects.toThrow('invalid data');
  });
  it.each([404, 401, 403, 500, 302])(
    'maps upstream HTTP %i without exposing response secrets or following redirects',
    async (status) => {
      upstream.status = status;
      upstream.body = { secret: 'must-not-escape' };
      try {
        await firstValueFrom(client.getCodingLab(LAB_ID));
        throw new Error('Expected failure');
      } catch (error: unknown) {
        const safe = safeCatalogError(error);
        expect(safe.code).toBe(
          status === 404
            ? 'NOT_FOUND'
            : status === 401 || status === 403
              ? 'FORBIDDEN'
              : 'UPSTREAM_UNAVAILABLE'
        );
        expect(safe.message).not.toContain('must-not-escape');
        expect(upstream.requests).toHaveLength(1);
      }
    }
  );
  it('fails closed for malformed and oversized responses', async () => {
    upstream.body = { labId: LAB_ID };
    await expect(firstValueFrom(client.getCodingLab(LAB_ID))).rejects.toThrow();
    upstream.body = { ...labFixture, oversized: 'x'.repeat(2 * 1024 * 1024) };
    await expect(firstValueFrom(client.getCodingLab(LAB_ID))).rejects.toThrow();
  });
  it('bounds a stalled upstream request', async () => {
    upstream.delayMs = 6000;
    try {
      await firstValueFrom(client.getCodingLab(LAB_ID));
      throw new Error('Expected timeout');
    } catch (error: unknown) {
      expect(safeCatalogError(error).code).toBe('UPSTREAM_TIMEOUT');
    }
  }, 10000);
});
