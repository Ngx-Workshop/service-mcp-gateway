import { createHash } from 'node:crypto';
import { WorkshopDraft, workshopDraftSchema } from './publishing.schemas';

export const draftHash = (draft: WorkshopDraft) =>
  createHash('sha256')
    .update(JSON.stringify(workshopDraftSchema.parse(draft)))
    .digest('hex');

export function runnerFindings(draft: WorkshopDraft): string[] {
  return draft.labs.flatMap(({ version }, index) => {
    const tests = [...version.sampleTests, ...version.hiddenTests];
    const prefix = `Lab ${index + 1}: `;
    const findings: string[] = [];
    if (!version.starterCode.trim())
      findings.push(prefix + 'Starter code is empty.');
    if (tests.length > 50)
      findings.push(prefix + 'At most 50 total tests execute.');
    if (new Set(tests.map((test) => test.name.trim())).size !== tests.length)
      findings.push(prefix + 'Test names must be unique across both suites.');
    if (tests.some((test) => test.kind !== 'io'))
      findings.push(prefix + 'Only input/output tests execute.');
    for (const test of tests) {
      if (test.kind !== 'io') continue;
      const comparator = test.comparator;
      if (
        !comparator ||
        ![
          'deepEqual',
          'strictEqual',
          'numberTolerance',
          'stringNormalized',
        ].includes(comparator.kind)
      )
        findings.push(
          prefix + 'Use a comparator supported by the isolated runner.'
        );
      if (
        comparator?.kind === 'strictEqual' &&
        test.expected !== null &&
        typeof test.expected === 'object'
      )
        findings.push(prefix + 'Use deepEqual for object/array expectations.');
      if (
        comparator?.kind === 'numberTolerance' &&
        (typeof test.expected !== 'number' ||
          !Number.isFinite(comparator.tolerance) ||
          comparator.tolerance! < 0)
      )
        findings.push(
          prefix +
            'Numeric tolerance needs numeric expected output and a nonnegative tolerance.'
        );
      if (
        comparator?.kind === 'stringNormalized' &&
        typeof test.expected !== 'string'
      )
        findings.push(
          prefix + 'String normalization needs string expected output.'
        );
    }
    return findings;
  });
}

export function objectiveFindings(draft: WorkshopDraft): string[] {
  if (!draft.learningPlan)
    return [
      'Add a learningPlan mapping objectives to documentation, labs and assessment questions.',
    ];
  return draft.learningPlan.objectives.flatMap((objective, index) => {
    const groups: [string, number[], number][] = [
      ['documentation', objective.pageIndexes, draft.pages.length],
      ['lab', objective.labIndexes, draft.labs.length],
      [
        'assessment',
        objective.questionIndexes,
        draft.assessment.testQuestions.length,
      ],
    ];
    return groups
      .filter(
        ([, indexes, length]) =>
          indexes.some((i) => i >= length) ||
          new Set(indexes).size !== indexes.length
      )
      .map(
        ([kind]) =>
          `Objective ${index + 1}: ${kind} indexes must be distinct and reference existing materials.`
      );
  });
}
