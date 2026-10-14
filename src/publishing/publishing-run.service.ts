import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  readdir,
  stat,
} from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { CATALOG_CONFIG, CatalogConfig } from '../mcp/catalog.config';
import { PublisherIdentity, PublishingOwnerClient } from './owner.client';
import {
  publishInputSchema,
  publishingReceiptSchema,
} from './publishing.schemas';
const resource = z
  .object({ _id: z.string().regex(/^[a-f\d]{24}$/i) })
  .passthrough();
const workshop = resource.extend({
  workshopDocuments: z.array(z.object({ _id: z.string(), kind: z.string() })),
});
export type PublishingRun = z.infer<typeof publishingReceiptSchema>;
@Injectable()
export class PublishingRunService {
  private readonly active = new Set<string>();
  constructor(
    private readonly owner: PublishingOwnerClient,
    @Inject(CATALOG_CONFIG) private readonly config: CatalogConfig
  ) {}
  private file(id: string) {
    z.string().uuid().parse(id);
    if (!this.config.publishing) throw new Error('Publishing disabled');
    return join(this.config.publishing.journalDirectory, `${id}.json`);
  }
  async get(id: string, identity: PublisherIdentity): Promise<PublishingRun> {
    const run = publishingReceiptSchema.parse(
      JSON.parse(await readFile(this.file(id), 'utf8'))
    );
    if (run.subject !== identity.subject)
      throw new Error('Receipt is owned by another administrator');
    return run;
  }
  async list(identity: PublisherIdentity) {
    if (!this.config.publishing) throw new Error('Publishing disabled');
    const directory = this.config.publishing.journalDirectory;
    const files = await readdir(directory).catch(
      (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      }
    );
    const receipts = [];
    for (const file of files) {
      if (!/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}\.json$/i.test(file))
        continue;
      try {
        const receipt = await this.get(file.slice(0, -5), identity);
        const info = await stat(join(directory, file));
        receipts.push({ receipt, modified: info.mtimeMs });
      } catch {
        /* Ignore foreign or unreadable receipts without disclosing them. */
      }
    }
    return receipts
      .sort((a, b) => b.modified - a.modified)
      .slice(0, 100)
      .map((row) => row.receipt);
  }
  private async save(run: PublishingRun) {
    const file = this.file(run.requestId);
    await writeFile(`${file}.tmp`, JSON.stringify(run), { mode: 0o600 });
    await rename(`${file}.tmp`, file);
  }
  async publish(
    value: unknown,
    identity: PublisherIdentity
  ): Promise<PublishingRun> {
    const { requestId, draft } = publishInputSchema.parse(value);
    const hash = createHash('sha256')
      .update(JSON.stringify(draft))
      .digest('hex');
    if (this.active.has(requestId))
      throw new Error('Publishing run is already active');
    this.active.add(requestId);
    try {
      await mkdir(this.config.publishing!.journalDirectory, {
        recursive: true,
        mode: 0o700,
      });
      const run: PublishingRun = {
        requestId,
        subject: identity.subject,
        draftHash: hash,
        status: 'running',
        steps: [],
      };
      try {
        await writeFile(this.file(requestId), JSON.stringify(run), {
          flag: 'wx',
          mode: 0o600,
        });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
        const existing = await this.get(requestId, identity);
        if (existing.draftHash !== hash)
          throw new Error('Request ID already belongs to a different draft');
        // Never repeat a write after timeout/process interruption. Retain the receipt for reconciliation.
        if (existing.status === 'running')
          return {
            ...existing,
            status: 'needs_recovery',
            message:
              'Run interrupted or still active. Reconcile recorded owner resources before another publish.',
          };
        return existing;
      }
      const step = async (name: string, execute: () => Promise<unknown>) => {
        const record: PublishingRun['steps'][number] = {
          name,
          status: 'pending',
        };
        run.steps.push(record);
        await this.save(run);
        const result = await execute();
        record.result = result;
        record.status = 'complete';
        await this.save(run);
        return result;
      };
      try {
        await this.owner.request(
          'document',
          'GET',
          `/navigation/section/${encodeURIComponent(draft.sectionId)}`,
          identity
        );
        const created = workshop.parse(
          await step('create_workshop', () =>
            this.owner.document(
              {
                operation: 'create_workshop',
                sectionId: draft.sectionId,
                name: draft.name,
                summary: draft.summary,
                level: draft.level,
              },
              identity
            )
          )
        );
        const first = created.workshopDocuments.find((p) => p.kind === 'PAGE');
        if (!first) throw new Error('Initial workshop page missing');
        for (const [index, page] of draft.pages.entries()) {
          if (index === 0) {
            await step('write_page_0', () =>
              this.owner.document(
                {
                  operation: 'update_page',
                  id: first._id,
                  blocks: page.blocks,
                },
                identity
              )
            );
            await step('name_page_0', () =>
              this.owner.document(
                {
                  operation: 'rename_page',
                  id: first._id,
                  workshopId: created._id,
                  name: page.name,
                },
                identity
              )
            );
          } else
            await step(`create_page_${index}`, () =>
              this.owner.document(
                { operation: 'create_page', workshopId: created._id, ...page },
                identity
              )
            );
        }
        for (const [index, lab] of draft.labs.entries()) {
          const id = resource.parse(
            await step(`create_lab_${index}`, () =>
              this.owner.lab(
                {
                  operation: 'create',
                  workshopId: created._id,
                  metadata: lab.metadata,
                },
                identity
              )
            )
          )._id;
          const version = resource
            .extend({ contentHash: z.string().min(1) })
            .parse(
              await step(`create_version_${index}`, () =>
                this.owner.lab(
                  { operation: 'create_version', id, version: lab.version },
                  identity
                )
              )
            );
          const verification = z
            .object({ passed: z.boolean(), contentHash: z.string().min(1) })
            .parse(
              await step(`verify_lab_${index}`, () =>
                this.owner.lab(
                  { operation: 'verify', id, versionId: version._id },
                  identity
                )
              )
            );
          if (
            !verification.passed ||
            verification.contentHash !== version.contentHash
          )
            throw new Error('Lab verification failed');
          await step(`publish_lab_${index}`, () =>
            this.owner.lab(
              {
                operation: 'publish',
                id,
                versionId: version._id,
                expectedContentHash: verification.contentHash,
              },
              identity
            )
          );
          await step(`attach_lab_${index}`, () =>
            this.owner.document(
              {
                operation: 'add_reference',
                workshopId: created._id,
                kind: 'CODING_LAB',
                resourceId: id,
                name: lab.metadata.title,
              },
              identity
            )
          );
        }
        const assessmentId = resource.parse(
          await step('create_assessment', () =>
            this.owner.assessment(
              { operation: 'create', assessment: draft.assessment },
              identity
            )
          )
        )._id;
        await step('attach_assessment', () =>
          this.owner.document(
            {
              operation: 'add_reference',
              workshopId: created._id,
              kind: 'ASSESSMENT_TEST',
              resourceId: assessmentId,
              name: draft.assessment.name,
            },
            identity
          )
        );
        run.status = 'complete';
      } catch {
        run.status = 'needs_recovery';
        run.message =
          'Publishing stopped. Inspect completed resources and reconcile the last pending step before retrying. No automatic rollback or replay occurred.';
      }
      await this.save(run);
      return run;
    } finally {
      this.active.delete(requestId);
    }
  }
}
