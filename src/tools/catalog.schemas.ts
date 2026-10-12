import { z } from 'zod';

export const sectionIdSchema = z.string().trim().min(1).max(120);
export const workshopIdSchema = z.string().trim().min(1).max(120);
export const mongoIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
const label = z.string().max(2000);
const summary = z.string().max(20000);
export const workshopSummarySchema = z.strictObject({
  id: workshopIdSchema,
  sectionId: sectionIdSchema,
  title: label,
  summary,
  level: z.number().int().min(1).max(20),
});
export const outlineEntrySchema = z.discriminatedUnion('kind', [
  z.strictObject({
    id: workshopIdSchema,
    title: label,
    kind: z.literal('PAGE'),
    resourceId: workshopIdSchema,
  }),
  z.strictObject({
    id: workshopIdSchema,
    title: label,
    kind: z.literal('CODING_LAB'),
    resourceId: workshopIdSchema,
  }),
  z.strictObject({
    id: workshopIdSchema,
    title: label,
    kind: z.literal('ASSESSMENT_TEST'),
    resourceId: workshopIdSchema,
  }),
]);
export const workshopDetailSchema = workshopSummarySchema.extend({
  outline: z.array(outlineEntrySchema).max(500),
});
const comparatorSchema = z.strictObject({
  kind: z.enum([
    'deepEqual',
    'strictEqual',
    'numberTolerance',
    'stringNormalized',
    'custom',
  ]),
  tolerance: z.number().optional(),
  normalizeWhitespace: z.boolean().optional(),
  ignoreCase: z.boolean().optional(),
  customComparatorId: z.string().optional(),
});
// HTTP JSON is already parsed; unknown values here preserve service-owned test data.
export const sampleTestSchema = z.strictObject({
  name: label,
  kind: z.enum(['io', 'unit']),
  input: z.unknown().optional(),
  expected: z.unknown().optional(),
  comparator: comparatorSchema.optional(),
  testCode: z.string().max(50000).optional(),
  framework: z.enum(['jest', 'vitest']).optional(),
});
export const publishedLabSchema = z.strictObject({
  id: mongoIdSchema,
  versionId: mongoIdSchema,
  versionNumber: z.number().int().positive(),
  title: label,
  difficulty: z.enum(['intro', 'easy', 'medium', 'hard']).optional(),
  language: z.enum(['javascript', 'typescript']),
  promptMarkdown: z.string().max(100000),
  hints: z.array(z.string().max(20000)).max(100),
  starterCode: z.string().max(100000),
  sampleTests: z.array(sampleTestSchema).max(100),
  entryFnName: z.string().max(200).optional(),
});
export const listWorkshopsInputSchema = z.strictObject({
  sectionId: sectionIdSchema,
});
export const getWorkshopInputSchema = listWorkshopsInputSchema.extend({
  workshopId: workshopIdSchema,
});
export const getCodingLabInputSchema = z.strictObject({
  labId: mongoIdSchema,
  versionId: mongoIdSchema.optional(),
});
export const listWorkshopsOutputSchema = z.strictObject({
  workshops: z.array(workshopSummarySchema).max(500),
});
export const getWorkshopOutputSchema = z.strictObject({
  workshop: workshopDetailSchema,
});
export const getCodingLabOutputSchema = z.strictObject({
  lab: publishedLabSchema,
});
export const toolErrorSchema = z.strictObject({
  error: z.strictObject({
    code: z.enum([
      'NOT_FOUND',
      'FORBIDDEN',
      'UPSTREAM_TIMEOUT',
      'UPSTREAM_UNAVAILABLE',
      'UPSTREAM_INVALID_RESPONSE',
      'INTERNAL_ERROR',
    ]),
    message: z.string(),
  }),
});
export const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;
export const catalogDefinitions = {
  list_workshops: {
    description:
      'List public workshop summaries in a section. This catalog does not determine learner eligibility.',
    inputSchema: listWorkshopsInputSchema,
    outputSchema: listWorkshopsOutputSchema,
    annotations: readOnlyAnnotations,
  },
  get_workshop: {
    description:
      'Get public workshop metadata and its ordered learning outline within a section. Does not return document bodies or learner progress.',
    inputSchema: getWorkshopInputSchema,
    outputSchema: getWorkshopOutputSchema,
    annotations: readOnlyAnnotations,
  },
  get_coding_lab: {
    description:
      'Get a published coding challenge, starter code, hints and public sample tests. Optionally select a published version; no solutions or hidden tests.',
    inputSchema: getCodingLabInputSchema,
    outputSchema: getCodingLabOutputSchema,
    annotations: readOnlyAnnotations,
  },
} as const;
export const contractSchemas = {
  ListWorkshopsInput: listWorkshopsInputSchema,
  GetWorkshopInput: getWorkshopInputSchema,
  GetCodingLabInput: getCodingLabInputSchema,
  ListWorkshopsOutput: listWorkshopsOutputSchema,
  GetWorkshopOutput: getWorkshopOutputSchema,
  GetCodingLabOutput: getCodingLabOutputSchema,
  ToolError: toolErrorSchema,
};
