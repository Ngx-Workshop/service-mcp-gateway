# Handoff: Real local catalog integration

Status: Complete (local scope)
Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Outcome

All three MCP tools passed against real, current-source local document and
coding-labs services using their existing MongoDB data. Both official SDK client
modes passed: modern pinned 2026-07-28 and legacy default. No runtime adapter,
owner contract or owner source change was required. The configuration mismatch
was the illustrative upstream ports in `.env.example`; they now match verified
local document:3007 and coding-labs:3009 ports.

Added `test/live-catalog.integration.ts` and `npm run test:integration:local`.
It discovers records through public owner HTTP APIs, compares all public metadata
and ordered references, and exits nonzero for missing real coverage or failed
checks. It only permits loopback HTTP(S) URLs, follows no redirects, sends no
credentials and does not seed data or access databases directly. It is opt-in:
unit/protocol tests remain independent of locally running services.

## Runtime evidence

| Component | Source/config observed | Actual behavior |
| --- | --- | --- |
| service-document | Clean checkout at 4c61f52; DOCUMENT_LOCAL_DEV=true, NODE_ENV=development, GENERATE_OPENAPI=false, PORT=3007; MongoDB document_local | Started with npm start from current source; real navigation service/persistence on 127.0.0.1:3007 |
| service-coding-labs | Clean checkout at 1191cfc; CODING_LABS_LOCAL_DEV=true, NODE_ENV=development, GENERATE_OPENAPI=false, HOST=127.0.0.1, PORT=3009; MongoDB coding_labs_local | Started with npm start from current source; real published-lab service/persistence on 127.0.0.1:3009 |
| MongoDB | Existing process on 127.0.0.1:27017 | Retained existing records; no writes, seeding, migrations or direct DB reads |
| Gateway | Compiled dist/main.js; NODE_ENV=development, DOCUMENT_BASE_URL=http://127.0.0.1:3007, CODING_LABS_BASE_URL=http://127.0.0.1:3009, PORT=3011 | Real Nest/SDK listener on 127.0.0.1:3011/mcp; same runtime source as feature 001 |
| SDK/contracts | Client/server 2.3.1, Node bridge 2.1.1; document-contracts 0.0.37 and coding-labs-contracts 0.0.9 | Existing pinned packages reused unchanged |

Owner services used their supported local modes with synthetic administrator
context. Generation was disabled; no auth/persistence doubles were used. The
verification used public navigation/published-lab endpoints only, never authoring,
verification/grading, code execution or personalized eligibility routes.

## Acceptance evidence

`npm run test:integration:local` passed on the final script with both modes:

| Acceptance | Real check | Result per client mode |
| --- | --- | --- |
| AC-001 | Discover sections via GET /navigation/sections, compare list_workshops to GET /navigation/workshops?section=… for every section | PASS: 5 sections, 11 summaries, including existing empty section |
| AC-002 | get_workshop for every real workshop, compare all public metadata and sortId-ordered references | PASS: 11 details; observed PAGE, CODING_LAB and ASSESSMENT_TEST |
| AC-003 | Discover via GET /published-labs, compare latest public content and explicit versionId reads to GET /published-labs/:labId | PASS: 1 published lab, versionNumber 2; array sample input preserved, latest/pinned identical; no hiddenTests, referenceSolution or sample storage IDs |
| AC-004 | Unknown section, missing workshop, existing workshop in wrong section, missing lab/version, malformed arguments for all three tools | PASS: empty section returns []; missing resources preserve NOT_FOUND; malformed inputs rejected |
| AC-004 | Exactly three readOnly tools, schema validation, JSON text equals structuredContent on every success | PASS in both modern and legacy modes |
| AC-005 | Nonempty catalogs required, loopback URL validation, owner working trees checked after shutdown | PASS; neither owner repo changed |
| Local URL negative check | MCP_GATEWAY_URL=https://example.com/mcp npm run test:integration:local | Expected exit 1 with loopback requirement before any requests |
| Strict build/generation | npm run build | PASS; no contract/API source change |
| Typed lint | npm run lint:check | PASS |
| Whitespace | git diff --check | PASS |

The initial runner had TypeScript errors (SDK call options and unannotated evolving
arrays); these were fixed before the passing checks. No integration mismatch was
hidden by changing the owner responses or weakening runtime validation.
The existing feature 001 unit/e2e evidence remains separate: no runtime code
changed here, so those suites were not rerun for this test/config/docs addition.

## Cleanup and continuation

Stopped all document, coding-labs and gateway processes launched for this pass;
ports 3007/3009/3011 no longer listen. Existing MongoDB remains running. Owner
working trees stayed clean. No records were created or changed, and nothing was
committed, published or deployed.

For another run, follow the [README setup](../../README.md#verify-against-real-local-services).
Overrides are process environment variables; the runner does not load `.env`.
It does not launch or stop services. Counts reflect the current local snapshot;
no historical-version or unpublished-lab fixture was created. Empty catalogs are
not sufficient to pass. Production connectivity, OAuth, learner eligibility,
audience/scopes, credential delegation and deployment remain future phases.
No remaining work is required for this real local integration scope.
