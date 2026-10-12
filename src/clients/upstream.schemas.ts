import { z } from 'zod';
import type { WorkshopDto } from '@tmdjr/document-contracts';
import type {
  PublishedLabDto,
  LabTestCaseDto,
  ComparatorDto,
} from '@tmdjr/coding-labs-contracts';
import {
  publishedLabSchema,
  sampleTestSchema,
  sectionIdSchema,
  workshopIdSchema,
} from '../tools/catalog.schemas';

// Validate consumed fields; strip extras instead of leaking internal models.
const commonEntry = {
  _id: workshopIdSchema,
  name: z.string().max(2000),
  sortId: z.number().finite(),
};
export const journeySchema = z.discriminatedUnion('kind', [
  z.object({ ...commonEntry, kind: z.literal('PAGE') }),
  z.object({
    ...commonEntry,
    kind: z.literal('CODING_LAB'),
    resourceId: workshopIdSchema,
  }),
  z.object({
    ...commonEntry,
    kind: z.literal('ASSESSMENT_TEST'),
    resourceId: workshopIdSchema,
  }),
]) satisfies z.ZodType<WorkshopDto['workshopDocuments'][number]>;
export const workshopSourceSchema = z.object({
  _id: workshopIdSchema,
  sectionId: sectionIdSchema,
  name: z.string().max(2000),
  summary: z.string().max(20000),
  level: z.number().int().min(1).max(20),
  workshopDocuments: z.array(journeySchema).max(500),
}) satisfies z.ZodType<
  Pick<
    WorkshopDto,
    '_id' | 'sectionId' | 'name' | 'summary' | 'level' | 'workshopDocuments'
  >
>;
// Check typed fields while input/expected remain opaque service-owned JSON.
const sampleSource = sampleTestSchema.strip() satisfies z.ZodType<
  Pick<LabTestCaseDto, 'name' | 'kind' | 'testCode' | 'framework'> & {
    comparator?: ComparatorDto;
  }
>;
export const publishedLabSourceSchema = publishedLabSchema
  .omit({ id: true, sampleTests: true })
  .strip()
  .extend({
    labId: publishedLabSchema.shape.id,
    sampleTests: z.array(sampleSource).max(100),
  }) satisfies z.ZodType<
  Omit<PublishedLabDto, 'sampleTests'> & {
    sampleTests: z.output<typeof sampleSource>[];
  }
>;
