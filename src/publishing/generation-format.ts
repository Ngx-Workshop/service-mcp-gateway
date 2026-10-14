import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  labMetadataSchema,
  labVersionSchema,
  workshopDraftSchema,
} from './publishing.schemas';
const content = z.string().min(1).max(100000);
const block = <const C extends string, const A extends readonly string[]>(
  component: C,
  actions: A
) =>
  z.strictObject({
    componentInstanceName: z.literal(component),
    savedAction: z.enum(actions),
    dataClean: content,
  });
const generatedQuestion = z.strictObject({
  question: z.string().min(1).max(1000),
  choices: z.array(z.string().min(1).max(400)).min(2).max(10),
  answerIndex: z.number().int().min(0).max(9),
  correctResponse: z.string().min(1).max(1000),
  incorrectResponse: z.string().min(1).max(1000),
});
const generatedBlock = z.union([
  block('HeaderBlockComponent', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
  block('ParagraphBlockComponent', ['small', 'medium', 'large']),
  block('NgxEditorJs2PanelComponent', ['info', 'note', 'tip', 'warning']),
  z.strictObject({
    componentInstanceName: z.literal('NgxEditorJs2ImageComponent'),
    savedAction: z.enum(['stretch', 'flex-start', 'center', 'flex-end']),
    dataClean: z.strictObject({
      url: z.string().max(2048),
      title: z.string().max(2000),
    }),
  }),
  block('NgxEditorJs2BlockquotesComponent', [
    'display-large',
    'display-medium',
    'display-small',
  ]),
  block('NgxEditorJs2CodemirrorComponent', [
    'text/typescript',
    'text/javascript',
    'text/html',
    'text/css',
    'application/json',
    'text/plain',
  ]),
  block('NgxEditorJs2MermaidjsComponent', ['center', 'flex-start', 'flex-end']),
  z.strictObject({
    componentInstanceName: z.literal('NgxEditorJs2PopQuizComponent'),
    savedAction: z.enum(['display-large', 'display-medium', 'display-small']),
    dataClean: generatedQuestion,
  }),
]);
const generatedTest = z.union([
  z.strictObject({
    name: z.string().min(1),
    kind: z.literal('io'),
    inputJson: content,
    expectedJson: content,
    comparator: z.enum(['deepEqual', 'strictEqual']),
  }),
  z.strictObject({
    name: z.string().min(1),
    kind: z.literal('unit'),
    testCode: content,
    framework: z.enum(['jest', 'vitest']),
  }),
]);
const generatedVersion = z.strictObject({
  language: labVersionSchema.shape.language,
  promptMarkdown: labVersionSchema.shape.promptMarkdown,
  hints: labVersionSchema.shape.hints,
  starterCode: labVersionSchema.shape.starterCode,
  referenceSolution: labVersionSchema.shape.referenceSolution,
  runner: labVersionSchema.shape.runner,
  sampleTests: z.array(generatedTest).min(1).max(50),
  hiddenTests: z.array(generatedTest).min(1).max(50),
});
// Generation omits caller-owned identity, order and section fields. Every model
// property is required; arbitrary JSON test values travel as strings, rather
// than an unsupported open-ended object in a strict output schema.
export const generationSchema = z.strictObject({
  name: workshopDraftSchema.shape.name,
  summary: workshopDraftSchema.shape.summary,
  pages: z
    .array(
      z.strictObject({
        name: z.string().min(1).max(160),
        blocks: z.array(generatedBlock).min(1).max(200),
      })
    )
    .min(1)
    .max(20),
  labs: z
    .array(
      z.strictObject({ metadata: labMetadataSchema, version: generatedVersion })
    )
    .min(1)
    .max(10),
  assessment: z.strictObject({
    name: z.string().min(1).max(160),
    testQuestions: z.array(generatedQuestion).min(1).max(100),
  }),
});
export function formatGeneratedDraft(
  value: unknown,
  input: { sectionId: string; level: number }
) {
  const generated = generationSchema.parse(value);
  const convertTest = (test: z.infer<typeof generatedTest>) =>
    test.kind === 'unit'
      ? test
      : {
          name: test.name,
          kind: test.kind,
          input: JSON.parse(test.inputJson) as unknown,
          expected: JSON.parse(test.expectedJson) as unknown,
          comparator: { kind: test.comparator },
        };
  const convertQuestion = (q: z.infer<typeof generatedQuestion>) => ({
    question: q.question,
    choices: q.choices.map((value) => ({ value })),
    answer: q.choices[q.answerIndex],
    correctResponse: q.correctResponse,
    incorrectResponse: q.incorrectResponse,
  });
  return workshopDraftSchema.parse({
    ...generated,
    sectionId: input.sectionId,
    level: input.level,
    pages: generated.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((b, sortIndex) => ({
        ...b,
        dataClean:
          b.componentInstanceName === 'NgxEditorJs2PopQuizComponent'
            ? JSON.stringify(convertQuestion(b.dataClean))
            : b.componentInstanceName === 'NgxEditorJs2ImageComponent'
              ? JSON.stringify(b.dataClean)
              : b.dataClean,
        blockId: randomUUID(),
        sortIndex,
      })),
    })),
    labs: generated.labs.map((lab) => ({
      ...lab,
      version: {
        ...lab.version,
        sampleTests: lab.version.sampleTests.map(convertTest),
        hiddenTests: lab.version.hiddenTests.map(convertTest),
      },
    })),
    assessment: {
      ...generated.assessment,
      subject: input.sectionId,
      level: input.level,
      testQuestions: generated.assessment.testQuestions.map(convertQuestion),
    },
  });
}
