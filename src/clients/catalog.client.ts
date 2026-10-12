import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { z } from 'zod';
import {
  CATALOG_CONFIG,
  CatalogConfig,
  RESPONSE_BYTES,
  UPSTREAM_TIMEOUT_MS,
} from '../mcp/catalog.config';
import { CatalogError } from './catalog-error';
import {
  publishedLabSourceSchema,
  workshopSourceSchema,
} from './upstream.schemas';
import {
  getCodingLabOutputSchema,
  getWorkshopOutputSchema,
  listWorkshopsOutputSchema,
} from '../tools/catalog.schemas';

const httpOptions = {
  timeout: UPSTREAM_TIMEOUT_MS,
  maxContentLength: RESPONSE_BYTES,
  maxRedirects: 0,
  proxy: false,
} as const;
@Injectable()
export class CatalogClient {
  constructor(
    private readonly http: HttpService,
    @Inject(CATALOG_CONFIG) private readonly config: CatalogConfig
  ) {}

  private workshops(sectionId: string) {
    return this.http
      .get<unknown>(`${this.config.documentBaseUrl}/navigation/workshops`, {
        ...httpOptions,
        params: { section: sectionId },
      })
      .pipe(
        map(({ data }) => z.array(workshopSourceSchema).max(500).parse(data)),
        map((workshops) => {
          if (workshops.some((workshop) => workshop.sectionId !== sectionId))
            throw new CatalogError(
              'UPSTREAM_INVALID_RESPONSE',
              'The catalog service returned invalid data.'
            );
          return workshops;
        })
      );
  }
  listWorkshops(
    sectionId: string
  ): Observable<z.infer<typeof listWorkshopsOutputSchema>> {
    return this.workshops(sectionId).pipe(
      map((workshops) => ({
        workshops: workshops.map((workshop) => ({
          id: workshop._id,
          sectionId: workshop.sectionId,
          title: workshop.name,
          summary: workshop.summary,
          level: workshop.level,
        })),
      }))
    );
  }
  getWorkshop(
    sectionId: string,
    workshopId: string
  ): Observable<z.infer<typeof getWorkshopOutputSchema>> {
    return this.workshops(sectionId).pipe(
      map((workshops) => {
        const workshop = workshops.find((item) => item._id === workshopId);
        if (!workshop)
          throw new CatalogError(
            'NOT_FOUND',
            'The requested workshop was not found in this section.'
          );
        return {
          workshop: {
            id: workshop._id,
            sectionId: workshop.sectionId,
            title: workshop.name,
            summary: workshop.summary,
            level: workshop.level,
            outline: [...workshop.workshopDocuments]
              .sort((a, b) => a.sortId - b.sortId)
              .map((entry) => ({
                id: entry._id,
                title: entry.name,
                kind: entry.kind,
                resourceId:
                  entry.kind === 'PAGE' ? entry._id : entry.resourceId,
              })),
          },
        };
      })
    );
  }
  getCodingLab(
    labId: string,
    versionId?: string
  ): Observable<z.infer<typeof getCodingLabOutputSchema>> {
    return this.http
      .get<unknown>(
        `${this.config.codingLabsBaseUrl}/published-labs/${encodeURIComponent(labId)}`,
        { ...httpOptions, params: versionId === undefined ? {} : { versionId } }
      )
      .pipe(
        map(({ data }) => {
          const { labId: id, ...lab } = publishedLabSourceSchema.parse(data);
          if (
            id.toLowerCase() !== labId.toLowerCase() ||
            (versionId &&
              lab.versionId.toLowerCase() !== versionId.toLowerCase())
          )
            throw new CatalogError(
              'UPSTREAM_INVALID_RESPONSE',
              'The catalog service returned invalid data.'
            );
          return { lab: { id, ...lab } };
        })
      );
  }
}
