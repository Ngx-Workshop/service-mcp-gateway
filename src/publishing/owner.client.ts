import type {
  CreateWorkshopDto,
  CreateWorkshopPageDto,
  AddWorkshopReferenceDto,
} from '@tmdjr/document-contracts';
import type {
  CreateLabDto,
  CreateDraftVersionDto,
  PublishVersionDto,
} from '@tmdjr/coding-labs-contracts';
import type {
  CreateAssessmentTestDto,
  UpdateAssessmentTestDto,
} from '@tmdjr/service-nestjs-assessment-test-contracts';
import type { AssetDto } from '@tmdjr/service-uploader-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import {
  CATALOG_CONFIG,
  CatalogConfig,
  RESPONSE_BYTES,
} from '../mcp/catalog.config';
import {
  assessmentCrudSchema,
  documentCrudSchema,
  imageInputSchema,
  labCrudSchema,
} from './publishing.schemas';
export interface PublisherIdentity {
  token: string;
  subject: string;
}
export type Owner = 'document' | 'codingLabs' | 'assessment' | 'uploader';
@Injectable()
export class PublishingOwnerClient {
  constructor(
    private readonly http: HttpService,
    @Inject(CATALOG_CONFIG) private readonly config: CatalogConfig
  ) {}
  async request(
    owner: Owner,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    identity: PublisherIdentity,
    data?: unknown
  ): Promise<unknown> {
    const base =
      owner === 'document'
        ? this.config.documentBaseUrl
        : owner === 'codingLabs'
          ? this.config.codingLabsBaseUrl
          : this.config.publishing?.[`${owner}BaseUrl`];
    if (!base) throw new Error('Publishing owner not configured');
    const result = await firstValueFrom(
      this.http.request<unknown>({
        method,
        url: `${base}${path}`,
        data,
        headers: { Authorization: `Bearer ${identity.token}` },
        timeout: 30000,
        maxRedirects: 0,
        maxContentLength: RESPONSE_BYTES,
        maxBodyLength: 8 * 1024 * 1024,
        proxy: false,
      })
    );
    return result.data ?? null;
  }
  async document(value: unknown, identity: PublisherIdentity) {
    const v = documentCrudSchema.parse(value);
    switch (v.operation) {
      case 'sections':
        return this.request(
          'document',
          'GET',
          '/navigation/sections',
          identity
        );
      case 'workshops':
        return this.request(
          'document',
          'GET',
          `/navigation/workshops?section=${encodeURIComponent(v.sectionId)}`,
          identity
        );
      case 'read_page':
        return this.request('document', 'GET', `/workshop/${v.id}`, identity);
      case 'create_workshop': {
        const body = {
          sectionId: v.sectionId,
          name: v.name,
          summary: v.summary,
          level: v.level,
        };
        return this.request(
          'document',
          'POST',
          '/navigation/workshop/create-workshop',
          identity,
          body satisfies Omit<CreateWorkshopDto, '_id'>
        );
      }
      case 'update_workshop':
        return this.request(
          'document',
          'POST',
          '/navigation/workshop/edit-workshop-name-and-summary',
          identity,
          { _id: v.id, name: v.name, summary: v.summary, level: v.level }
        );
      case 'delete_workshop':
        return this.request(
          'document',
          'POST',
          '/navigation/workshop/delete-workshop-and-workshop-documents',
          identity,
          { _id: v.id }
        );
      case 'create_page':
        return this.request(
          'document',
          'POST',
          '/navigation/page/create-page',
          identity,
          {
            workshopId: v.workshopId,
            name: v.name,
            html: JSON.stringify(v.blocks),
          } satisfies CreateWorkshopPageDto
        );
      case 'update_page':
        return this.request(
          'document',
          'POST',
          '/workshop/update-workshop-html',
          identity,
          { _id: v.id, html: JSON.stringify(v.blocks) }
        );
      case 'rename_page':
        return this.request(
          'document',
          'POST',
          '/navigation/page/edit-page-name-update-workshop',
          identity,
          { _id: v.id, workshopId: v.workshopId, name: v.name }
        );
      case 'delete_page':
        return this.request(
          'document',
          'POST',
          '/navigation/page/delete-page-and-update-workshop',
          identity,
          { _id: v.id, workshopId: v.workshopId, name: v.name }
        );
      case 'add_reference':
        return this.request(
          'document',
          'POST',
          '/navigation/page/add-reference',
          identity,
          {
            workshopId: v.workshopId,
            kind: v.kind,
            resourceId: v.resourceId,
            name: v.name,
          } satisfies AddWorkshopReferenceDto
        );
    }
  }
  async assessment(value: unknown, identity: PublisherIdentity) {
    const v = assessmentCrudSchema.parse(value);
    switch (v.operation) {
      case 'list':
        return this.request('assessment', 'GET', '/assessment-test', identity);
      case 'read':
        return this.request(
          'assessment',
          'GET',
          `/assessment-test/${v.id}`,
          identity
        );
      case 'create':
        return this.request(
          'assessment',
          'POST',
          '/assessment-test',
          identity,
          v.assessment satisfies CreateAssessmentTestDto
        );
      case 'update':
        return this.request(
          'assessment',
          'PATCH',
          '/assessment-test',
          identity,
          {
            ...v.assessment,
            _id: v.id,
            __v: v.version,
          } satisfies UpdateAssessmentTestDto
        );
      case 'delete':
        return this.request(
          'assessment',
          'DELETE',
          `/assessment-test/${v.id}`,
          identity
        );
    }
  }
  async lab(value: unknown, identity: PublisherIdentity) {
    const v = labCrudSchema.parse(value);
    switch (v.operation) {
      case 'list':
        return this.request('codingLabs', 'GET', '/labs', identity);
      case 'read':
        return this.request('codingLabs', 'GET', `/labs/${v.id}`, identity);
      case 'create':
        return this.request('codingLabs', 'POST', '/labs', identity, {
          ...v.metadata,
          workshopId: v.workshopId,
          createdBy: identity.subject,
        } satisfies CreateLabDto);
      case 'update':
        return this.request(
          'codingLabs',
          'PATCH',
          `/labs/${v.id}`,
          identity,
          v.metadata
        );
      case 'delete':
        return this.request('codingLabs', 'DELETE', `/labs/${v.id}`, identity);
      case 'versions':
        return this.request(
          'codingLabs',
          'GET',
          `/labs/${v.id}/versions`,
          identity
        );
      case 'read_version':
        return this.request(
          'codingLabs',
          'GET',
          `/labs/${v.id}/versions/${v.versionId}`,
          identity
        );
      case 'create_version':
        return this.request(
          'codingLabs',
          'POST',
          `/labs/${v.id}/versions/draft`,
          identity,
          {
            ...v.version,
            createdBy: identity.subject,
          } satisfies Omit<CreateDraftVersionDto, 'sampleTests' | 'hiddenTests'>
        );
      case 'update_version':
        return this.request(
          'codingLabs',
          'PATCH',
          `/labs/${v.id}/versions/${v.versionId}`,
          identity,
          {
            ...v.version,
            expectedContentHash: v.expectedContentHash,
            createdBy: identity.subject,
          }
        );
      case 'verify':
        return this.request(
          'codingLabs',
          'POST',
          `/labs/${v.id}/versions/${v.versionId}/verify`,
          identity,
          {}
        );
      case 'publish':
        return this.request(
          'codingLabs',
          'POST',
          `/labs/${v.id}/versions/${v.versionId}/publish`,
          identity,
          {
            expectedContentHash: v.expectedContentHash,
            publishedBy: identity.subject,
          } satisfies PublishVersionDto
        );
    }
  }
  async image(value: unknown, identity: PublisherIdentity) {
    const v = imageInputSchema.parse(value);
    if (v.operation === 'find') {
      const assets = z
        .array(
          z
            .object({
              name: z.string(),
              archived: z.boolean(),
              storageStatus: z.string(),
              mediaType: z.string().optional(),
              storageUrl: z.string().optional(),
            })
            .passthrough()
        )
        .parse(
          await this.request(
            'uploader',
            'GET',
            '/uploader?archived=false',
            identity
          )
        );
      const readyImages: Pick<
        AssetDto,
        'name' | 'archived' | 'storageStatus' | 'mediaType' | 'storageUrl'
      >[] = assets.map((a) => ({
        ...a,
        storageStatus:
          a.storageStatus === 'READY' ? 'READY' : 'PENDING_STORAGE',
      }));
      return readyImages.filter(
        (a) =>
          !a.archived &&
          a.storageStatus === 'READY' &&
          a.mediaType?.startsWith('image/') &&
          a.storageUrl &&
          a.name.toLowerCase().includes(v.query.toLowerCase())
      );
    }
    const bytes = Buffer.from(v.base64, 'base64');
    const form = new FormData();
    form.append('name', v.name);
    form.append(
      'file',
      new Blob([new Uint8Array(bytes)], { type: v.mediaType }),
      v.name
    );
    return this.request('uploader', 'POST', '/uploader/upload', identity, form);
  }
}
