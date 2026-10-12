# Tasks
Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md)

- [x] T001: Add strict MCP schemas, typed adapters and safe errors (FR-002–004, AC-002–003).
- [x] T002: Wire official SDK through Nest, local configuration and security boundary; retire seed persistence (FR-001,005, AC-001,004–005). Depends T001.
- [x] T003: Add schema, adapter HTTP and protocol acceptance tests (AC-001–006). Depends T002.
- [x] T004: Regenerate OpenAPI/MCP artifacts and build package (FR-006, AC-006). Depends T002.
- [x] T005: Verify tests/build/lint, write ADRs, context docs and handoff. Depends T003–004.

External production integration, OAuth and deployment are future phases, not blockers for the approved local scope.

## Verification evidence

| Task | Evidence |
| --- | --- |
| T001 | Published-domain type checks compile; 32 unit/adapter checks pass, including real HTTP timeout/redaction/errors |
| T002 | 21 protocol tests pass against Nest and official modern/legacy clients; compiled bootstrap smoke succeeds without DB/auth |
| T003 | src/**/*spec.ts and test/app.e2e-spec.ts pass; all AC scenarios covered locally |
| T004 | OpenAPI/MCP generation and package build pass; ESM runtime import and package dry-run pass |
| T005 | Strict build, lint:check and git diff --check pass; ADRs/context and handoff complete |
