import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { DraftAgentService } from './draft-agent.service';
import { GenerationError } from './generation-error';
import { PublisherIdentity, PublishingOwnerClient } from './owner.client';
import {
  PreparationActivity,
  PreparationReport,
  startPreparationSchema,
  WorkshopDraft,
  workshopDraftSchema,
} from './publishing.schemas';
import {
  draftHash,
  objectiveFindings,
  runnerFindings,
} from './workshop-checks';

const verificationSchema = z
  .object({
    passed: z.boolean(),
    totalTests: z.number().int().positive(),
    passedTests: z.number().int().nonnegative(),
    results: z.array(
      z.object({
        name: z.string(),
        status: z.enum(['passed', 'failed', 'error', 'timeout']),
      })
    ),
  })
  .refine(
    (v) =>
      v.results.length === v.totalTests &&
      v.passedTests ===
        v.results.filter((test) => test.status === 'passed').length &&
      v.passed === (v.passedTests === v.totalTests),
    'Inconsistent verification totals'
  );

type Job = {
  inputHash: string;
  subject: string;
  report: PreparationReport;
  finished?: number;
};
@Injectable()
export class WorkshopPreparationService {
  private readonly jobs = new Map<string, Job>();
  constructor(
    private readonly agent: DraftAgentService,
    private readonly owner: PublishingOwnerClient
  ) {}

  start(value: unknown, identity: PublisherIdentity): PreparationReport {
    const input = startPreparationSchema.parse(value);
    for (const [id, job] of this.jobs) {
      if (job.finished && Date.now() - job.finished > 3600000)
        this.jobs.delete(id);
    }
    const preparationId = input.preparationId ?? randomUUID();
    const inputHash = createHash('sha256')
      .update(JSON.stringify(input))
      .digest('hex');
    const existing = this.jobs.get(preparationId);
    if (existing) {
      if (existing.subject !== identity.subject)
        throw new GenerationError('PREPARATION_UNAVAILABLE');
      if (existing.inputHash !== inputHash)
        throw new GenerationError('PREPARATION_CONFLICT');
      return structuredClone(existing.report);
    }
    const running = [...this.jobs.values()].filter((job) => !job.finished);
    if (
      running.length >= 2 ||
      running.some((job) => job.subject === identity.subject)
    )
      throw new GenerationError('PREPARATION_BUSY');
    if (this.jobs.size >= 100) {
      const oldest = [...this.jobs.entries()].find(([, job]) => job.finished);
      if (oldest) this.jobs.delete(oldest[0]);
    }
    const now = new Date().toISOString();
    const report: PreparationReport = {
      preparationId,
      status: 'running',
      ready: false,
      createdAt: now,
      updatedAt: now,
      activities: [],
      repairCount: 0,
    };
    const job = { inputHash, subject: identity.subject, report };
    this.jobs.set(report.preparationId, job);
    // Detached work has a terminal catch; no owner resource writes or publication.
    void this.prepare(job, input, identity).catch(() => {
      report.status = 'failed';
      report.ready = false;
      report.message =
        'Preparation stopped. Start fresh checks before publication.';
      this.finish(job);
    });
    return structuredClone(report);
  }

  get(id: string, identity: PublisherIdentity): PreparationReport {
    const job = this.jobs.get(id);
    if (
      !job ||
      job.subject !== identity.subject ||
      (job.finished && Date.now() - job.finished > 3600000)
    )
      throw new GenerationError('PREPARATION_UNAVAILABLE');
    return structuredClone(job.report);
  }

  assertReady(
    id: string,
    draft: WorkshopDraft,
    identity: PublisherIdentity
  ): void {
    const report = this.get(id, identity);
    if (
      report.status !== 'complete' ||
      !report.ready ||
      report.draftHash !== draftHash(draft)
    )
      throw new GenerationError('PREPARATION_STALE');
  }

  private activity(
    report: PreparationReport,
    id: string,
    label: string,
    kind: PreparationActivity['kind'],
    work: () => Promise<{
      status: PreparationActivity['status'];
      detail: string;
    }>
  ) {
    const row: PreparationActivity = {
      id,
      label,
      kind,
      status: 'running',
      detail: '',
      startedAt: new Date().toISOString(),
    };
    report.activities.push(row);
    report.updatedAt = row.startedAt!;
    return work()
      .then((result) => {
        Object.assign(row, result, {
          detail: result.detail.slice(0, 4000),
          finishedAt: new Date().toISOString(),
        });
        report.updatedAt = row.finishedAt!;
        return row;
      })
      .catch((error: unknown) => {
        row.status = 'failed';
        row.finishedAt = new Date().toISOString();
        row.detail =
          error instanceof GenerationError
            ? error.message
            : 'Check unavailable or rejected. Correct the content or check the owning service, then run checks again.';
        report.updatedAt = row.finishedAt;
        return row;
      });
  }

  private async prepare(
    job: Job,
    input: z.infer<typeof startPreparationSchema>,
    identity: PublisherIdentity
  ) {
    const report = job.report;
    let raw: unknown = input.operation === 'check' ? input.draft : undefined;
    if (input.operation === 'generate') {
      report.model =
        input.input.model ?? this.agent.models().defaultModel ?? undefined;
      const generate = await this.activity(
        report,
        'generate',
        'Author workshop with skills',
        'generation',
        async () => {
          raw = await this.agent.generate(input.input, identity, {
            onSkills: (skills) => {
              for (const skill of skills)
                report.activities.push({
                  id: skill.name,
                  label: skill.name.replaceAll('-', ' '),
                  kind: 'skill',
                  status: 'passed',
                  detail:
                    'Loaded and supplied to the authoring model. Following the guidance is evaluated by subsequent checks and review.',
                  skillVersion: skill.version,
                  skillHash: skill.hash,
                  startedAt: new Date().toISOString(),
                  finishedAt: new Date().toISOString(),
                });
            },
          });
          return {
            status: 'passed',
            detail:
              'Structured draft returned and normalized. No workshop resources created.',
          };
        }
      );
      if (generate.status === 'failed') {
        report.status = 'failed';
        report.message = generate.detail;
        this.finish(job);
        return;
      }
    } else {
      report.activities.push({
        id: 'import',
        label: 'Imported or edited draft',
        kind: 'skill',
        status: 'skipped',
        detail:
          'This check run did not apply authoring skills or call the AI reviewer.',
      });
    }
    for (let attempt = 0; attempt < 2; attempt++) {
      const prefix = attempt ? 'recheck-' : '';
      const parsed = workshopDraftSchema.safeParse(raw);
      await this.activity(
        report,
        prefix + 'structure',
        'Workshop structure and assessment answers',
        'check',
        () =>
          Promise.resolve({
            status: parsed.success ? 'passed' : 'failed',
            detail: parsed.success
              ? 'Required resources, unique block IDs, contiguous order, question choices, answers and workshop subject/level are consistent.'
              : 'Correct fields: ' +
                parsed.error.issues
                  .slice(0, 12)
                  .map((issue) => issue.path.join('.'))
                  .join(', '),
          })
      );
      if (!parsed.success) break;
      const draft = parsed.data;
      report.draft = draft;
      report.draftHash = draftHash(draft);
      const rows: PreparationActivity[] = [];
      const check = async (id: string, label: string, findings: string[]) =>
        rows.push(
          await this.activity(report, prefix + id, label, 'check', () =>
            Promise.resolve({
              status: findings.length ? 'failed' : 'passed',
              detail: findings.join('\n') || 'No contract issues found.',
            })
          )
        );
      await check(
        'serialization',
        'Editor serialization round trip',
        JSON.stringify(JSON.parse(JSON.stringify(draft.pages))) ===
          JSON.stringify(draft.pages)
          ? []
          : ['Editor data did not survive serialization.']
      );
      await check('coverage', 'Objective coverage', objectiveFindings(draft));
      const runnerIssues = runnerFindings(draft);
      await check('runner-contract', 'Lab runner compatibility', runnerIssues);
      if (!runnerIssues.length)
        for (const [index, lab] of draft.labs.entries()) {
          for (const mode of ['reference', 'starter', 'baseline'] as const) {
            rows.push(
              await this.activity(
                report,
                `${prefix}lab-${index}-${mode}`,
                `Lab ${index + 1}: ${mode === 'reference' ? 'reference solution passes' : mode === 'starter' ? 'starter leaves work to do' : 'tests reject a constant answer'}`,
                'check',
                async () => {
                  if (
                    mode === 'baseline' &&
                    new Set(
                      [
                        ...lab.version.sampleTests,
                        ...lab.version.hiddenTests,
                      ].map((test) => JSON.stringify(test.expected))
                    ).size < 2
                  )
                    return {
                      status: 'review_required',
                      detail:
                        'All expected outputs are identical. A constant-answer baseline cannot distinguish a wrong solution here. Review whether the task legitimately returns a constant, or add cases with different expected outputs.',
                    };
                  const code =
                    mode === 'starter'
                      ? lab.version.starterCode
                      : `function ${lab.version.runner.entryFnName}(input) { return ${JSON.stringify(lab.version.sampleTests[0].expected)}; }`;
                  const version =
                    mode === 'reference'
                      ? lab.version
                      : { ...lab.version, referenceSolution: { code } };
                  const result = verificationSchema.parse(
                    await this.owner.request(
                      'codingLabs',
                      'POST',
                      '/lab-preflight',
                      identity,
                      version
                    )
                  );
                  const passed =
                    mode === 'reference'
                      ? result.passed
                      : mode === 'baseline'
                        ? result.results.some(
                            (test) => test.status === 'failed'
                          ) &&
                          result.results.every(
                            (test) =>
                              test.status !== 'error' &&
                              test.status !== 'timeout'
                          )
                        : !result.passed &&
                          result.results.every(
                            (test) => test.status !== 'timeout'
                          );
                  return {
                    status: passed ? 'passed' : 'failed',
                    detail:
                      `${result.passedTests}/${result.totalTests} tests passed. ` +
                      (mode === 'starter' && result.passed
                        ? 'Starter already solves every test. '
                        : '') +
                      result.results
                        .map((test) => `${test.name}: ${test.status}`)
                        .join('; '),
                  };
                }
              )
            );
          }
        }
      if (input.operation === 'generate')
        rows.push(
          await this.activity(
            report,
            prefix + 'teaching-review',
            'AI review of teaching and alignment',
            'review',
            async () => {
              const result = await this.agent.review(draft, report.model);
              return {
                status: result.findings.length ? 'failed' : 'passed',
                detail: [
                  result.summary,
                  ...result.findings,
                  'Model judgment only; factual accuracy and teaching quality still require administrator review.',
                ].join('\n'),
              };
            }
          )
        );
      const failed = rows.filter((row) => row.status === 'failed');
      if (!failed.length) {
        report.ready = true;
        break;
      }
      if (
        attempt ||
        input.operation === 'check' ||
        failed.some(
          (row) =>
            row.detail.startsWith('Check unavailable') ||
            (row.kind === 'review' && row.detail.includes('AI provider'))
        )
      )
        break;
      report.repairCount = 1;
      const repair = await this.activity(
        report,
        'repair',
        'Revise draft from check findings (1 of 1)',
        'repair',
        async () => {
          raw = await this.agent.generate(input.input, identity, {
            repair: {
              draft,
              findings: failed.map((row) => `${row.label}: ${row.detail}`),
            },
            onSkills: (skills) => {
              for (const skill of skills)
                report.activities.push({
                  id: 'repair-' + skill.name,
                  label: 'Revision: ' + skill.name.replaceAll('-', ' '),
                  kind: 'skill',
                  status: 'passed',
                  detail: 'Loaded and supplied to the revision request.',
                  skillVersion: skill.version,
                  skillHash: skill.hash,
                  startedAt: new Date().toISOString(),
                  finishedAt: new Date().toISOString(),
                });
            },
          });
          return {
            status: 'passed',
            detail:
              'Revision returned. All automated checks will run again on the revised content.',
          };
        }
      );
      if (repair.status === 'failed') break;
    }
    report.activities.push({
      id: 'human-review',
      label: 'Administrator content and visual review',
      kind: 'review',
      status: 'review_required',
      detail:
        'Inspect the preview, code, diagram source and question feedback. Confirm factual accuracy, rendering and teaching quality. Check-only runs do not include AI teaching review. A constant-answer baseline is checked; arbitrary wrong-solution mutation testing is not performed.',
    });
    report.status = 'complete';
    report.message = report.ready
      ? 'Automated checks passed. Review the materials before approving publication.'
      : 'Resolve failed checks and run preparation again before publishing.';
    this.finish(job);
  }

  private finish(job: Job) {
    job.finished = Date.now();
    job.report.updatedAt = new Date().toISOString();
  }
}
