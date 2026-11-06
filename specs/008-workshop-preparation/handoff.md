# Handoff: Workshop preparation skills and checks

Status: Implemented; production acceptance pending
Updated: 2026-11-05
Spec: [spec.md](spec.md)
Plan: [plan.md](plan.md)
Tasks: [tasks.md](tasks.md)

## Delivered behavior

Implemented four versioned application skills, typed learning plans, full block-action validation, bounded private asynchronous preparation, executable preflight checks, a structured AI review and one content revision. Generated/imported content remains unpublished during preparation. Owned ready reports bind to normalized content hashes; receipts retain skill/check evidence. Prepared publication reads back and verifies saved journey references/order. Explicit rejected readiness does not begin a new publishing run; duplicate recorded requests retain recovery semantics.

Source: src/publishing/skills, authoring-skills.ts, generation-format.ts, workshop-checks.ts, workshop-preparation.service.ts, publishing.schemas.ts, publishing-tools.service.ts and publishing-run.service.ts.

## Verification evidence

- PASS: 95 unit/adapter tests across 11 suites (including same-ID preparation replay, privacy, stale hashes, repair budget, unavailable runner and prepared journey mismatch).
- PASS: 44 protocol e2e tests across 4 suites; official MCP client discovers twelve authoring tools while public catalog remains three.
- PASS: strict Nest build, copied skill assets, non-mutating lint, OpenAPI/MCP generation, contract generation/build, four skill validators and git diff whitespace checks.
- PASS: real local HTTP integration from gateway preparation through actual Nest lab-preflight controller/service and Docker runner: structure, serialization, coverage, runner contract, reference 2/2, starter 0/2 and baseline 1/2; ready=true. Auth was explicitly doubled and no MongoDB was accessed.
- Tests use doubles for provider calls, document/assessment publication and protocol owners. No paid model call, live publication, npm publication or deployment.

## Delivery and remaining acceptance

1. Release service-coding-labs with POST /lab-preflight and available isolated runner image.
2. Release service-mcp-gateway with copied skill assets and preparation tools. Its application contract is generated as 1.3.0; no npm release is implied. Keep the existing private publication volume and single-instance profile.
3. Release mfe-user-journey-admin-ai-publisher with its committed 1.3.0 contract tarball. Check authenticated shell generation, report polling, content review and publication receipt against real owners/provider.

No document/assessment schema change. Retain human review for facts, diagram rendering/source and instructional quality. No automatic visual-rendering pass or arbitrary mutation-testing claim. Preparation is bounded process-local state (two active, one per subject, 100 retained, one-hour finished TTL, capacity eviction/restart loss). Publication evidence remains durable. Legacy publication without preparationId is compatible and follows its prior owner verification path.

Context docs: architecture/development and gateway workshop-publishing guide describe exact boundaries. All local implementation tasks are complete; X001 is production rollout/acceptance.

Final quality gates: npm run lint:check passes without errors; all 95 unit tests and
44 protocol tests pass. Skill validators pass for all four packages. Archive/generated
content consistency was checked against the publisher's vendored contract. No live
provider calls or release operations were performed.

## Deployment follow-up — 2026-11-05

Failure source: https://github.com/Ngx-Workshop/service-mcp-gateway/actions/runs/42142147627/job/127644809205
The validation job stopped at the production dependency audit. Multer 2.4.0 was
resolved by the refreshed dependency lock; its high-severity advisory also marks
@nestjs/platform-express as high. package.json now overrides only that owner's
Multer to patched 2.5.0 and package-lock.json records its verified registry tarball.
The audit gate was not weakened. Clean install and production high-severity audit
pass; the existing moderate Hono finding remains. Changes are local until committed
and pushed; rerunning the unchanged failed commit would retain the vulnerable lock.

Clean-install validation also exposed sanitize-html 2.18.1 → htmlparser2 12's ESM
parser tree, which Jest 29 had skipped transforming. Both unit and protocol Jest
configs now enable JavaScript transformation only for the six parser-tree packages;
runtime dependencies and sanitizer behavior were not downgraded or mocked away.
Final local validation passes on Node 22.23.3: clean install, production audit gate,
strict build, 95 unit tests, 44 protocol tests, 5 publication-workflow tests, 5
Python deployment tests, lint, contract generation/build and the exact generated-
artifact no-diff gate. No workflow rerun, commit, push, publication or deployment
was performed; the fixed commit must reach main before the release can use it.
