// Test fixture only; runtime never imports this module.
import type { WorkshopDraft } from '../../src/publishing/publishing.schemas';
export const publishingDraft: WorkshopDraft = {
  sectionId: 'angular',
  name: 'Functions',
  summary: 'Learn pure functions',
  level: 1,
  pages: [
    {
      name: 'Introduction',
      blocks: [
        {
          blockId: 'intro',
          sortIndex: 0,
          componentInstanceName: 'ParagraphBlockComponent',
          savedAction: 'large',
          dataClean: 'Learn functions.',
        },
      ],
    },
  ],
  labs: [
    {
      metadata: {
        title: 'Double',
        slug: 'double',
        summary: 'Double a number',
        difficulty: 'easy',
      },
      version: {
        language: 'javascript',
        promptMarkdown: 'Write double(x)',
        hints: ['Multiply by 2'],
        starterCode: 'function double(x) {}',
        referenceSolution: { code: 'function double(x) { return x * 2; }' },
        sampleTests: [
          {
            name: 'positive',
            kind: 'io',
            input: [2],
            expected: 4,
            comparator: { kind: 'deepEqual' },
          },
        ],
        hiddenTests: [
          {
            name: 'zero',
            kind: 'io',
            input: [0],
            expected: 0,
            comparator: { kind: 'deepEqual' },
          },
        ],
        runner: { timeoutMs: 1000, entryFnName: 'double' },
      },
    },
  ],
  assessment: {
    name: 'Functions assessment',
    subject: 'angular',
    level: 1,
    testQuestions: [
      {
        question: 'Double two?',
        choices: [{ value: '4' }, { value: '2' }],
        answer: '4',
        correctResponse: 'Correct.',
        incorrectResponse: 'Multiply two by two.',
      },
    ],
  },
};
