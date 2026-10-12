# Handoff: Local catalog MCP proof of concept

Status: Complete (local scope)
Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior

The CRUD seed is now a database-free local NestJS MCP gateway with exactly
list_workshops, get_workshop and get_coding_lab. Official SDK server 2.3.1 and
Node bridge 2.1.1 serve modern 2026-07-28 and legacy stateless requests at /mcp.
Strict inputs/output, typed domain projections, public-field redaction, bounded
requests/responses, sanitized errors, localhost binding, Host/Origin checks and
production-mode rejection are implemented. Incoming cookies/tokens are never
forwarded. No OAuth, deployment, resources, prompts or mutation tools were added.

## Acceptance evidence

| Scenario/check | Actual check | Result and scope |
| --- | --- | --- |
| AC-001 | npm run test:e2e -- --runInBand | PASS: discovery and all three calls over actual local HTTP |
| AC-002 | npm test -- --runInBand; protocol e2e | PASS: strict fields/IDs and no owner calls for invalid arguments |
| AC-003 | Unit/adapter HTTP and protocol suites | PASS: not-found/denied/unavailable/malformed/oversized responses and real 5-second timeout |
| AC-004 | Protocol suite with raw HTTP Host override and Origin cases | PASS: boundary rejects invalid values, native no-Origin client allowed, credentials not forwarded |
| AC-005 | Config unit tests, retired-route e2e, compiled-process smoke | PASS: missing/unsafe config rejected; compiled server listens on loopback and executes list_workshops without DB/auth |
| AC-006 | Build/generation, ESM runtime import, discovery drift, modern/legacy client | PASS: actual package exports independent types/runtime JSON Schemas |
| Unit/adapter totals | npm test -- --runInBand | 3 suites, 32 tests passed |
| Protocol totals | npm run test:e2e -- --runInBand | 1 suite, 21 tests passed |
| Strict application build | GENERATE_OPENAPI=true npm run build | PASS; generates openapi.json and mcp-tools.json |
| Contract generation | npm --prefix contracts/service-mcp-gateway run clean; root contracts:service-mcp-gateway:gen | PASS; no hand-edited generated files |
| Contract build | npm run contracts:service-mcp-gateway:build | PASS |
| Runtime contract import | Node ESM import of contracts/service-mcp-gateway/dist/index.js | PASS: mcpCatalogContract has exactly three tools |
| Package contents | npm pack --dry-run --ignore-scripts from contracts/service-mcp-gateway | PASS: correct package, seven files containing only dist and manifest |
| Typed lint | npm run lint:check | PASS; no fixes/suppression needed |
| Whitespace | git diff --check | PASS |

Owner HTTP servers are disposable contract-shaped doubles. They test real adapter
HTTP behavior, not live production responses. Official SDK is real, not mocked.
Compiled smoke launched dist/main.js against an ephemeral localhost owner and
called list_workshops, then stopped both processes. Nothing was deployed or
published. No external infrastructure was required.

## Contract and consumer handoff

| Owner/consumer | Interface | Action and ordering |
| --- | --- | --- |
| service-document | @tmdjr/document-contracts 0.0.37; GET /navigation/workshops?section=… | No owner changes required. Actual local catalog/outline responses verified in feature 002; set DOCUMENT_BASE_URL for the target environment |
| service-coding-labs | @tmdjr/coding-labs-contracts 0.0.9; GET /published-labs/:labId with optional versionId | No owner changes required. Actual local public/pinned lab responses verified in feature 002; set CODING_LABS_BASE_URL for the target environment |
| Gateway package consumers | ListWorkshopsInput/Output, GetWorkshopInput/Output, GetCodingLabInput/Output, ToolError, mcpCatalogContract | Seed CRUD exports/routes removed. Migrate deliberately before release; local version 0.0.1 was not published and is not the next published version |
| Future learner tools | service-user-metadata eligibility/progress policy | Must use owner policy and supported user delegation; catalog does not grant learner access |

Tool discovery artifact and OpenAPI components both derive from catalog.schemas.ts.
The package uses openapi-typescript plus generated aliases so opaque sample-test
JSON is typed unknown rather than any. Published domain contracts are compile-time
checks; explicit runtime projection validators cover only consumed fields. The
absence of producer runtime schemas is documented in ADR 0002.

## Remaining work

No incomplete tasks remain within the approved local acceptance scope. Real local
owner integration subsequently passed; see [feature 002](../002-live-catalog-integration/handoff.md).
OAuth, scope/audience enforcement, downstream credential delegation,
production rate limits/audit integration and deployment are subsequent phases.
Existing Docker/Actions/Nginx files were not modified or run. They retain seed
assumptions and cannot deploy this loopback-only proof of concept as a public MCP
endpoint without deliberate changes. Do not infer a production release from this
local completion.

Dependency installs report root audit findings (46: 15 moderate, 31
high); contract tooling reports 3 high findings after removing unused codegen.
These are npm install audit summaries, not a fresh vulnerability investigation.
No broad dependency upgrade/audit-fix was undertaken. The local scope has no
production-security acceptance claim.

## Context maintenance

README, AGENTS, architecture/development docs, feature index and three ADRs now
describe the adopted gateway. The reusable seed-adoption guide and workflow
remain historical/reusable guidance; no other repository was modified. Changes
are left in the working tree for review, without commit, push, publish or deploy.
