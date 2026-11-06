import { PublishingToolsService } from './publishing-tools.service';
import { PublishingRunService } from './publishing-run.service';
import { WorkshopPreparationService } from './workshop-preparation.service';
import { DraftAgentService } from './draft-agent.service';
import { PublishingOwnerClient } from './owner.client';
import { publishingDraft } from '../../test/fixtures/publishing-draft';
import { authoringSkills } from './authoring-skills';
import {
  draftHash,
  objectiveFindings,
  runnerFindings,
} from './workshop-checks';

const identity = { subject: 'admin', token: 'private-token' };
const plannedDraft = () => ({
  ...structuredClone(publishingDraft),
  learningPlan: {
    prerequisites: ['JavaScript'],
    objectives: [
      {
        objective: 'Double a number',
        pageIndexes: [0],
        labIndexes: [0],
        questionIndexes: [0],
      },
    ],
  },
});
const verification = (passed: boolean) => ({
  passed,
  totalTests: 2,
  passedTests: passed ? 2 : 1,
  results: [
    { name: 'sample', status: 'passed' },
    { name: 'hidden', status: passed ? 'passed' : 'failed' },
  ],
});

describe('private workshop preparation', () => {
  function setup() {
    const request = jest
      .fn()
      .mockImplementation(
        (
          _owner,
          _method,
          _path,
          _identity,
          version: { referenceSolution: { code: string } }
        ) =>
          Promise.resolve(
            verification(
              version.referenceSolution.code ===
                publishingDraft.labs[0].version.referenceSolution.code
            )
          )
      );
    const generate = jest.fn().mockImplementation(
      (
        _input,
        _identity,
        context: {
          onSkills?: (skills: ReturnType<typeof authoringSkills>) => void;
        }
      ) => {
        context?.onSkills?.(authoringSkills());
        return Promise.resolve(plannedDraft());
      }
    );
    const review = jest.fn().mockResolvedValue({
      findings: [],
      summary: 'Objectives and materials align.',
    });
    const service = new WorkshopPreparationService(
      {
        generate,
        review,
        models: () => ({ defaultModel: 'allowed' }),
      } as unknown as DraftAgentService,
      { request } as unknown as PublishingOwnerClient
    );
    return { service, request, generate, review };
  }
  async function terminal(service: WorkshopPreparationService, id: string) {
    for (let i = 0; i < 100; i++) {
      const report = service.get(id, identity);
      if (report.status !== 'running') return report;
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
    throw new Error('Preparation never completed');
  }
  it('reports live skill versions, isolated checks and no owner writes', async () => {
    const { service, request } = setup();
    const started = service.start(
      {
        operation: 'generate',
        input: { brief: 'Double numbers', sectionId: 'angular', level: 1 },
      },
      identity
    );
    expect(started.status).toBe('running');
    expect(
      started.activities.some(
        (row) => row.kind === 'generation' && row.status === 'running'
      )
    ).toBe(true);
    const report = await terminal(service, started.preparationId);
    expect(report.ready).toBe(true);
    expect(
      report.activities.filter((row) => row.kind === 'skill')
    ).toHaveLength(4);
    expect(
      report.activities.find((row) => row.kind === 'skill')?.skillHash
    ).toMatch(/^[a-f0-9]{64}$/);
    expect(
      report.activities.find((row) => row.id === 'lab-0-baseline')?.status
    ).toBe('passed');
    expect(request).toHaveBeenCalledTimes(3);
    expect(
      request.mock.calls.every(
        (call: unknown[]) => call[2] === '/lab-preflight'
      )
    ).toBe(true);
    expect(report.draftHash).toBe(draftHash(report.draft!));
    service.assertReady(report.preparationId, report.draft!, identity);
    expect(() =>
      service.assertReady(
        report.preparationId,
        { ...report.draft!, name: 'Changed' },
        identity
      )
    ).toThrow('draft changed');
    expect(() =>
      service.get(report.preparationId, { ...identity, subject: 'foreign' })
    ).toThrow('unavailable');
  });
  it('checks imports without claiming skills or model review and invalidates bad objective mappings', async () => {
    const { service, review } = setup();
    const draft = plannedDraft();
    draft.learningPlan.objectives[0].pageIndexes = [42];
    const run = service.start({ operation: 'check', draft }, identity);
    const report = await terminal(service, run.preparationId);
    expect(report.ready).toBe(false);
    expect(report.activities.find((row) => row.id === 'coverage')?.status).toBe(
      'failed'
    );
    expect(report.activities.find((row) => row.id === 'import')?.status).toBe(
      'skipped'
    );
    expect(review).not.toHaveBeenCalled();
  });
  it('never passes malformed drafts and never calls execution for incompatible tests', async () => {
    const { service, request } = setup();
    const bad = service.start({ operation: 'check', draft: {} }, identity);
    expect((await terminal(service, bad.preparationId)).ready).toBe(false);
    const draft = plannedDraft();
    draft.labs[0].version.hiddenTests[0].name = 'positive';
    const run = service.start({ operation: 'check', draft }, identity);
    const report = await terminal(service, run.preparationId);
    expect(
      report.activities.find((row) => row.id === 'runner-contract')?.status
    ).toBe('failed');
    expect(request).not.toHaveBeenCalled();
  });
  it('repairs once, reruns checks and retains failed attempt evidence', async () => {
    const { service, review, generate } = setup();
    review.mockResolvedValueOnce({
      findings: ['Question wording is ambiguous.'],
      summary: 'Revise assessment.',
    });
    const run = service.start(
      {
        operation: 'generate',
        input: { brief: 'Functions', sectionId: 'angular', level: 1 },
      },
      identity
    );
    const report = await terminal(service, run.preparationId);
    expect(report.ready).toBe(true);
    expect(report.repairCount).toBe(1);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(
      report.activities.find((row) => row.id === 'teaching-review')?.status
    ).toBe('failed');
    expect(
      report.activities.find((row) => row.id === 'recheck-teaching-review')
        ?.status
    ).toBe('passed');
  });
  it('stops after the repair budget and does not mark an already solved starter ready', async () => {
    const { service, generate } = setup();
    const solved = plannedDraft();
    solved.labs[0].version.starterCode =
      solved.labs[0].version.referenceSolution.code;
    generate.mockResolvedValue(solved);
    const run = service.start(
      {
        operation: 'generate',
        input: { brief: 'Functions', sectionId: 'angular', level: 1 },
      },
      identity
    );
    const report = await terminal(service, run.preparationId);
    expect(report.ready).toBe(false);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(
      report.activities.find((row) => row.id === 'recheck-lab-0-starter')
        ?.status
    ).toBe('failed');
  });
  it('does not spend a repair on unavailable execution and preserves safe failure evidence', async () => {
    const { service, request, generate } = setup();
    request.mockRejectedValue(new Error('private upstream body/token'));
    const run = service.start(
      {
        operation: 'generate',
        input: { brief: 'Functions', sectionId: 'angular', level: 1 },
      },
      identity
    );
    const report = await terminal(service, run.preparationId);
    expect(report.ready).toBe(false);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(report)).not.toContain('private upstream');
  });
  it('bounds concurrent jobs and expires finished reports', async () => {
    const { service, generate } = setup();
    let finish!: (value: ReturnType<typeof plannedDraft>) => void;
    generate.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const run = service.start(
      {
        operation: 'generate',
        input: { brief: 'Functions', sectionId: 'angular', level: 1 },
      },
      identity
    );
    expect(() =>
      service.start({ operation: 'check', draft: plannedDraft() }, identity)
    ).toThrow('already running');
    finish(plannedDraft());
    await terminal(service, run.preparationId);
    const now = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 3600001);
    expect(() => service.get(run.preparationId, identity)).toThrow('expired');
    now.mockRestore();
  });
  it('enforces readiness on new publication but preserves recorded-request recovery after expiry', async () => {
    const { service } = setup();
    const job = service.start(
      { operation: 'check', draft: plannedDraft() },
      identity
    );
    const report = await terminal(service, job.preparationId);
    const find = jest.fn().mockResolvedValue(undefined);
    const publish = jest.fn().mockResolvedValue({ status: 'complete' });
    const tools = new PublishingToolsService(
      {} as PublishingOwnerClient,
      {} as DraftAgentService,
      { find, publish } as unknown as PublishingRunService,
      service
    );
    const request = {
      requestId: '11111111-1111-4111-8111-111111111111',
      draft: report.draft!,
      preparationId: report.preparationId,
    };
    const ok = await tools.invoke('publish_workshop', request, identity);
    expect(ok.isError).not.toBe(true);
    expect((publish.mock.calls[0] as unknown[])[2]).toEqual(
      expect.objectContaining({ draftHash: report.draftHash })
    );
    expect((publish.mock.calls[0] as unknown[])[2]).not.toHaveProperty('draft');
    publish.mockClear();
    const stale = await tools.invoke(
      'publish_workshop',
      { ...request, draft: { ...request.draft, name: 'Changed' } },
      identity
    );
    expect(stale.isError).toBe(true);
    expect(publish).not.toHaveBeenCalled();
    find.mockResolvedValue({ status: 'complete' });
    const expired = jest.spyOn(service, 'get').mockImplementation(() => {
      throw new Error('expired');
    });
    const recorded = await tools.invoke('publish_workshop', request, identity);
    expect(recorded.isError).not.toBe(true);
    expect(publish).toHaveBeenCalledTimes(1);
    expired.mockRestore();
  });
  it('requires human review when a constant baseline cannot distinguish a legitimate constant-output task', async () => {
    const { service, request } = setup();
    const draft = plannedDraft();
    draft.labs[0].version.hiddenTests[0].expected =
      draft.labs[0].version.sampleTests[0].expected;
    const run = service.start({ operation: 'check', draft }, identity);
    const report = await terminal(service, run.preparationId);
    expect(
      report.activities.find((row) => row.id === 'lab-0-baseline')?.status
    ).toBe('review_required');
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('returns an existing preparation for the same ID and rejects changed inputs without another model call', async () => {
    const { service, generate } = setup();
    const input = {
      operation: 'generate',
      preparationId: '11111111-1111-4111-8111-111111111111',
      input: { brief: 'Functions', sectionId: 'angular', level: 1 },
    };
    const run = service.start(input, identity);
    expect(service.start(input, identity).preparationId).toBe(
      run.preparationId
    );
    expect(() =>
      service.start(
        { ...input, input: { ...input.input, brief: 'Different' } },
        identity
      )
    ).toThrow('different inputs');
    expect(() =>
      service.start(input, { ...identity, subject: 'foreign' })
    ).toThrow('unavailable');
    await terminal(service, run.preparationId);
    expect(generate).toHaveBeenCalledTimes(1);
  });
  it('detects empty plans and runner limits before publication', () => {
    expect(objectiveFindings(publishingDraft)).toHaveLength(1);
    const draft = plannedDraft();
    draft.labs[0].version.sampleTests = Array.from(
      { length: 50 },
      (_, index) => ({
        ...draft.labs[0].version.sampleTests[0],
        name: `test-${index}`,
      })
    );
    expect(runnerFindings(draft)).toContain(
      'Lab 1: At most 50 total tests execute.'
    );
  });
});
