# Publisher migration handoff

Implemented locally, 2026-11-06; production integration/cutover pending.

## Result

service-ai-publisher owns the complete former gateway publishing subtree, all four
skills, generation/image APIs, preparation checks, owner adapters and receipt/recovery
logic. The working-tree preflight diagnostics and no-paid-repair fixes were copied
before removing gateway implementation. Domain resources remain behind owner APIs.
The publisher seed CRUD, database dependency and stale e2e test were removed.

service-mcp-gateway now has only a fixed-destination compatibility forwarding adapter
for /publisher/tools and /mcp/publishing. Its catalog implementation/auth/ingress and
three read-only tools remain unchanged. Both legacy browser path and MCP tool shapes
are preserved. Gateway generated OpenAPI, discovery and contracts have no changes
against HEAD after regeneration. Independent publisher contracts 1.0.0 are generated;
the vendored tarball exactly matches their files. No registry publication occurred.

## Verification on Node 22.23.3

- Publisher clean npm ci --ignore-scripts: pass, using migrated gateway dependency pins.
  Initial seed-lock audit failed; replacing it with the existing gateway dependency
  graph removed those old high/critical findings without a broad package upgrade.
- Publisher strict build/OpenAPI/assets: pass; 57 unit tests and 5 MCP/HTTP tests pass.
- Gateway strict build: pass; 50 unit tests and 50 protocol/forwarding tests pass.
- Both non-mutating lint checks: pass; both generated contract builds: pass.
- Publisher package snapshot byte comparison: pass. Gateway generated-artifact
  no-diff gate: pass. Both git diff --check: pass.
- Publication workflow tests: 5 per service pass. Deployment tests: 6 publisher and
  5 gateway pass, including active legacy-writer rejection and rollback failures.
- Publisher production npm audit --audit-level=high: pass, with one inherited moderate
  @hono/node-server advisory remaining. No major dependency upgrade was attempted.

Tests use disposable auth/owner HTTP doubles, temporary private receipt directories
and official MCP clients. They make no paid provider calls. No live production,
real owner/model/storage, Docker-image build or SSH deployment was performed.

## Production handoff

Follow service-ai-publisher/docs/migration.md: drain preparation/publication, back up
the existing journal, provision root-owned 0600 publisher runtime.env, move server-only
model/authoring settings, configure gateway AI_PUBLISHER_BASE_URL, deploy gateway
without the journal mount, then publisher with the same ngx-publisher-runs volume.
Both services use ngx-net; publisher listens on private port 3014 without production
host port publication. Preparation jobs do not survive restart; receipt formats and
request ownership do. Never run two journal writers, including during rollback.

Existing frontend need not change paths or contract imports. A future frontend can
adopt @tmdjr/service-ai-publisher-contracts with mcpPublisherContract; gateway keeps
its historical mcpCatalogContract.publishing export. Npm OIDC for the new package,
host environment provisioning, live administrator/receipt checks and real runner/model
acceptance remain operational rollout work. No commit, push, publication or deployment
was performed by this migration task.
