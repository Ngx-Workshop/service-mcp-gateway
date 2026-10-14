import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import {
  mongoIdSchema,
  sectionIdSchema,
  sampleTestSchema,
} from '../tools/catalog.schemas';
const text = z.string().trim().min(1).max(20000);
const title = z.string().trim().min(1).max(160);
const httpsUrl = z
  .string()
  .url()
  .max(2048)
  .refine((v) => {
    const u = new URL(v);
    return u.protocol === 'https:' && !u.username && !u.password;
  }, 'Use an HTTPS URL without credentials');
const questionShape = z.strictObject({
  question: z.string().trim().min(1).max(1000),
  choices: z
    .array(z.strictObject({ value: z.string().trim().min(1).max(400) }))
    .min(2)
    .max(10),
  answer: z.string().trim().min(1).max(400),
  correctResponse: z.string().trim().min(1).max(1000),
  incorrectResponse: z.string().trim().min(1).max(1000),
});
export const questionSchema = questionShape.refine(
  (q) =>
    q.choices.some((c) => c.value === q.answer) &&
    new Set(q.choices.map((c) => c.value)).size === q.choices.length,
  'Answer must match a choice; choices must be unique'
);
export const editorBlockSchema = z
  .strictObject({
    blockId: z.string().min(1).max(120),
    sortIndex: z.number().int().nonnegative(),
    componentInstanceName: z.enum([
      'HeaderBlockComponent',
      'ParagraphBlockComponent',
      'NgxEditorJs2BlockquotesComponent',
      'NgxEditorJs2PanelComponent',
      'NgxEditorJs2ImageComponent',
      'NgxEditorJs2CodemirrorComponent',
      'NgxEditorJs2MermaidjsComponent',
      'NgxEditorJs2PopQuizComponent',
    ]),
    savedAction: z.string().max(120),
    dataClean: z.string().max(100000),
  })
  .superRefine((b, ctx) => {
    const actions: Partial<Record<typeof b.componentInstanceName, string[]>> = {
      HeaderBlockComponent: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ParagraphBlockComponent: ['small', 'medium', 'large'],
      NgxEditorJs2PanelComponent: ['info', 'note', 'tip', 'warning'],
      NgxEditorJs2ImageComponent: [
        'stretch',
        'flex-start',
        'center',
        'flex-end',
      ],
    };
    if (
      actions[b.componentInstanceName] &&
      !actions[b.componentInstanceName]!.includes(b.savedAction)
    )
      ctx.addIssue({ code: 'custom', message: 'Unsupported block action' });
    if (
      b.componentInstanceName === 'NgxEditorJs2ImageComponent' ||
      b.componentInstanceName === 'NgxEditorJs2PopQuizComponent'
    ) {
      try {
        const value: unknown = JSON.parse(b.dataClean);
        (b.componentInstanceName === 'NgxEditorJs2ImageComponent'
          ? z.strictObject({ url: httpsUrl, title: z.string().max(2000) })
          : questionSchema
        ).parse(value);
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Invalid serialized image or quiz data',
        });
      }
    }
    if (
      [
        'HeaderBlockComponent',
        'ParagraphBlockComponent',
        'NgxEditorJs2BlockquotesComponent',
        'NgxEditorJs2PanelComponent',
      ].includes(b.componentInstanceName) &&
      /<\s*(script|iframe|object|embed|svg|math|style)|\bon\w+\s*=|(?:javascript|data|vbscript)\s*:/i.test(
        b.dataClean
      )
    )
      ctx.addIssue({ code: 'custom', message: 'Unsafe document HTML' });
  })
  .transform((b) => ({
    ...b,
    dataClean: [
      'HeaderBlockComponent',
      'ParagraphBlockComponent',
      'NgxEditorJs2BlockquotesComponent',
      'NgxEditorJs2PanelComponent',
    ].includes(b.componentInstanceName)
      ? sanitizeHtml(b.dataClean, {
          allowedTags: [
            'div',
            'p',
            'br',
            'b',
            'strong',
            'i',
            'em',
            'u',
            's',
            'ul',
            'ol',
            'li',
            'a',
            'span',
            'code',
            'blockquote',
          ],
          allowedAttributes: { a: ['href', 'title'] },
          allowedSchemes: ['https', 'http'],
          allowProtocolRelative: false,
        })
      : b.dataClean,
  }));
export const blocksSchema = z
  .array(editorBlockSchema)
  .min(1)
  .max(200)
  .refine(
    (blocks) =>
      new Set(blocks.map((b) => b.blockId)).size === blocks.length &&
      blocks.every((b, i) => b.sortIndex === i),
    'Block IDs must be unique and sortIndex must be contiguous from zero'
  );
export const assessmentSchema = z.strictObject({
  name: title,
  subject: sectionIdSchema,
  sectionTitle: z.string().min(1).max(120).optional(),
  level: z.number().int().min(1).max(20),
  testQuestions: z.array(questionSchema).min(1).max(100),
});
export const labMetadataSchema = z.strictObject({
  title,
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: text,
  difficulty: z.enum(['intro', 'easy', 'medium', 'hard']),
});
export const labVersionSchema = z
  .strictObject({
    language: z.enum(['javascript', 'typescript']),
    promptMarkdown: text,
    hints: z.array(text).max(30),
    starterCode: z.string().max(50000),
    referenceSolution: z.strictObject({ code: z.string().min(1).max(50000) }),
    sampleTests: z.array(sampleTestSchema).min(1).max(50),
    hiddenTests: z.array(sampleTestSchema).min(1).max(50),
    runner: z.strictObject({
      timeoutMs: z.number().int().min(100).max(10000),
      entryFnName: z.string().regex(/^[a-zA-Z_$][\w$]*$/),
    }),
  })
  .superRefine((v, ctx) => {
    for (const t of [...v.sampleTests, ...v.hiddenTests]) {
      if (
        t.kind === 'io' &&
        (t.input === undefined || t.expected === undefined || !t.comparator)
      )
        ctx.addIssue({
          code: 'custom',
          message: 'IO tests require input, expected and comparator',
        });
      if (t.kind === 'unit' && !t.testCode?.trim())
        ctx.addIssue({
          code: 'custom',
          message: 'Unit tests require testCode',
        });
    }
  });
export const workshopDraftSchema = z
  .strictObject({
    sectionId: sectionIdSchema,
    name: title,
    summary: text,
    level: z.number().int().min(1).max(20),
    pages: z
      .array(z.strictObject({ name: title, blocks: blocksSchema }))
      .min(1)
      .max(20),
    labs: z
      .array(
        z.strictObject({
          metadata: labMetadataSchema,
          version: labVersionSchema,
        })
      )
      .min(1)
      .max(10),
    assessment: assessmentSchema,
  })
  .refine(
    (v) =>
      v.assessment.subject === v.sectionId && v.assessment.level === v.level,
    'Assessment subject and level must match workshop'
  );
const read = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};
const write = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: true,
};
export const publishingResultSchema = z.strictObject({ data: z.unknown() });
export const generateDraftInputSchema = z.strictObject({
  brief: text,
  model: z.string().trim().min(1).max(120).optional(),
  sectionId: sectionIdSchema,
  level: z.number().int().min(1).max(20),
});
export const publishInputSchema = z.strictObject({
  requestId: z.string().uuid(),
  draft: workshopDraftSchema,
});
const operation = <const O extends string, T extends z.ZodRawShape>(
  op: O,
  shape: T
) => z.strictObject({ operation: z.literal(op), ...shape });
export const assessmentCrudSchema = z.discriminatedUnion('operation', [
  operation('list', {}),
  operation('read', { id: mongoIdSchema }),
  operation('create', { assessment: assessmentSchema }),
  operation('update', {
    id: mongoIdSchema,
    version: z.number().int().nonnegative(),
    assessment: assessmentSchema,
  }),
  operation('delete', { id: mongoIdSchema }),
]);
export const labCrudSchema = z.discriminatedUnion('operation', [
  operation('list', {}),
  operation('read', { id: mongoIdSchema }),
  operation('create', {
    workshopId: mongoIdSchema,
    metadata: labMetadataSchema,
  }),
  operation('update', { id: mongoIdSchema, metadata: labMetadataSchema }),
  operation('delete', { id: mongoIdSchema }),
  operation('versions', { id: mongoIdSchema }),
  operation('read_version', { id: mongoIdSchema, versionId: mongoIdSchema }),
  operation('create_version', { id: mongoIdSchema, version: labVersionSchema }),
  operation('update_version', {
    id: mongoIdSchema,
    versionId: mongoIdSchema,
    expectedContentHash: text,
    version: labVersionSchema,
  }),
  operation('verify', { id: mongoIdSchema, versionId: mongoIdSchema }),
  operation('publish', {
    id: mongoIdSchema,
    versionId: mongoIdSchema,
    expectedContentHash: text,
  }),
]);
export const documentCrudSchema = z.discriminatedUnion('operation', [
  operation('sections', {}),
  operation('workshops', { sectionId: sectionIdSchema }),
  operation('read_page', { id: mongoIdSchema }),
  operation('create_workshop', {
    sectionId: sectionIdSchema,
    name: title,
    summary: text,
    level: z.number().int().min(1).max(20),
  }),
  operation('update_workshop', {
    id: mongoIdSchema,
    name: title,
    summary: text,
    level: z.number().int().min(1).max(20),
  }),
  operation('delete_workshop', { id: mongoIdSchema }),
  operation('create_page', {
    workshopId: mongoIdSchema,
    name: title,
    blocks: blocksSchema,
  }),
  operation('update_page', { id: mongoIdSchema, blocks: blocksSchema }),
  operation('rename_page', {
    id: mongoIdSchema,
    workshopId: mongoIdSchema,
    name: title,
  }),
  operation('delete_page', {
    id: mongoIdSchema,
    workshopId: mongoIdSchema,
    name: title,
  }),
  operation('add_reference', {
    workshopId: mongoIdSchema,
    kind: z.enum(['CODING_LAB', 'ASSESSMENT_TEST']),
    resourceId: mongoIdSchema,
    name: title,
  }),
]);
export const imageInputSchema = z.discriminatedUnion('operation', [
  operation('find', { query: z.string().max(120) }),
  operation('generate', {
    prompt: z.string().trim().min(1).max(4000),
    name: z.string().trim().min(1).max(120),
  }),
  operation('upload', {
    name: z.string().min(1).max(120),
    mediaType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
    base64: z
      .string()
      .min(4)
      .max(6 * 1024 * 1024)
      .regex(
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
      ),
  }),
]);
const definition = (
  description: string,
  inputSchema: z.ZodType,
  annotations = write
) => ({
  description,
  inputSchema,
  outputSchema: publishingResultSchema,
  annotations,
});
export const publishingModelSchema = z.strictObject({
  id: z.string().trim().min(1).max(120),
  inputUsdPerMillion: z.number().nonnegative().nullable(),
  outputUsdPerMillion: z.number().nonnegative().nullable(),
});
export const publishingModelCatalogSchema = z.strictObject({
  models: z.array(publishingModelSchema).max(50),
  defaultModel: z.string().nullable(),
  imageModel: z.string(),
});
export const publishingDefinitions = {
  list_publishing_models: definition(
    'List server-approved draft models and reference USD token pricing.',
    z.strictObject({}),
    read
  ),
  list_publishing_runs: definition(
    'List durable publishing receipts for the authenticated administrator, newest first.',
    z.strictObject({}),
    read
  ),
  generate_workshop_draft: definition(
    'Generate documentation, labs and assessment from a brief; no owner writes. Review before publish.',
    generateDraftInputSchema,
    read
  ),
  validate_workshop_draft: definition(
    'Validate and normalize Ngx-EditorJs2 workshop draft without writing.',
    z.strictObject({ draft: workshopDraftSchema }),
    read
  ),
  publish_workshop: definition(
    'Publish reviewed workshop. Keep requestId for duplicate protection and recovery. Returns completed resource steps on failure.',
    publishInputSchema
  ),
  get_publishing_run: definition(
    'Inspect a publishing receipt owned by the authenticated administrator.',
    z.strictObject({ requestId: z.string().uuid() }),
    read
  ),
  manage_document: definition(
    'Admin document/workshop CRUD through service-document.',
    documentCrudSchema
  ),
  manage_assessment: definition(
    'Admin assessment CRUD including answers; never expose through catalog endpoint.',
    assessmentCrudSchema
  ),
  manage_coding_lab: definition(
    'Admin lab CRUD/version verification/publication. Delete archives a lab.',
    labCrudSchema
  ),
  workshop_image: definition(
    'Find ready image assets, generate and upload a workshop image using server model credentials, or upload base64 bytes. Use returned storageUrl in image dataClean JSON.',
    imageInputSchema
  ),
};
export const publishingReceiptSchema = z.strictObject({
  requestId: z.string().uuid(),
  subject: z.string(),
  draftHash: z.string(),
  status: z.enum(['running', 'complete', 'needs_recovery']),
  steps: z.array(
    z.strictObject({
      name: z.string(),
      status: z.enum(['pending', 'complete']),
      result: z.unknown().optional(),
    })
  ),
  message: z.string().optional(),
});
export const publishingContractSchemas = {
  PublishingModelCatalog: publishingModelCatalogSchema,
  PublishingModel: publishingModelSchema,
  WorkshopDraft: workshopDraftSchema,
  PublishingReceipt: publishingReceiptSchema,
  ManageDocumentInput: documentCrudSchema,
  ManageAssessmentInput: assessmentCrudSchema,
  ManageCodingLabInput: labCrudSchema,
  WorkshopImageInput: imageInputSchema,
  EditorBlock: editorBlockSchema,
  PublishingResult: publishingResultSchema,
  GenerateWorkshopDraftInput: generateDraftInputSchema,
  PublishWorkshopInput: publishInputSchema,
};
export type WorkshopDraft = z.infer<typeof workshopDraftSchema>;
