# Architecture

Updated: 2026-10-12 · Deployed catalog gateway; private ChatGPT linking open.

## Responsibilities and flow

MCP HTTP → auth-client introspection + SDK bearer gate → official SDK → injected tool callback → catalog adapter → owning REST
service. This gateway owns AI-facing contracts and transport only. It has no
MongoDB connection; authoring writes use owning REST APIs through the separate administrator endpoint. The old example CRUD module
has been removed.

| Concern | Source | Behavior |
| --- | --- | --- |
| Runtime | `src/bootstrap.ts`, `src/main.ts` | Local loopback or explicit production listener; bounded SDK body parsing; shutdown hooks |
| Configuration | `src/mcp/catalog.config.ts` | Validated owner URLs, public HTTPS identity and runtime profile |
| Local boundary | `src/mcp/local-boundary.ts` | Host allowlist; reject invalid present Origin before parsing |
| OAuth | `src/auth/` | Configured resource/issuer; header bearer before parsing; request-local SDK AuthInfo; 401/403/503; public metadata/preflight |
| Protocol | `src/mcp/mcp.controller.ts` | Official createMcpHandler/toNodeHandler, stateless modern and legacy requests |
| Registration | `src/tools/catalog-tools.service.ts` | Exactly three tools; Observable/Promise boundary; sanitized execution errors |
| MCP contracts | `src/tools/catalog.schemas.ts` | Strict input/output schemas, annotations and error contract |
| Service adapters | `src/clients/catalog.client.ts` | GET only, 5-second timeout, 2 MiB response limit, no redirects/proxies or forwarded credentials |
| Runtime domain validation | `src/clients/upstream.schemas.ts` | Consumed-field projections checked against pinned published types |
| Generation | `src/swagger.ts`, `scripts/export-mcp-contracts.cjs` | OpenAPI components, discovery JSON, independent models/runtime JSON Schemas |

The request limit is 64 KiB; lists/outlines cap at 500 and sample tests at 100.
Oversized results fail rather than silently omit records. SDK response mode auto
normally returns JSON for these short callbacks. No subscriptions are advertised.
Errors avoid upstream URLs, bodies, credentials and stacks. There is no retry,
pagination, caching or rate-limit subsystem in this local phase.

## Verified upstream boundaries

| Owner | Native read route | Contract |
| --- | --- | --- |
| service-document | GET /navigation/workshops?section=… | @tmdjr/document-contracts 0.0.37, WorkshopDto consumed fields |
| service-coding-labs | GET /published-labs/:labId?versionId=… | @tmdjr/coding-labs-contracts 0.0.9, PublishedLabDto consumed fields |

There is no verified workshop detail route. get_workshop selects within a section
list and sorts its outline by sortId. Page resourceId is its page entry ID; lab
and assessment resourceId is the owning service reference. The adapter rejects
cross-section results and mismatched lab/version identities.

Runtime compatibility passed against both contract-shaped HTTP doubles and real
local MongoDB-backed owner services. The [live integration handoff](../specs/002-live-catalog-integration/handoff.md)
records five sections, eleven workshops and one published lab using modern and
legacy clients. Unit/e2e tests need no sibling source; the opt-in live check needs
running owners with nonempty local catalogs. Production integration also passed against all 6 real workshops and 2 published labs; see [launch evidence](production-execution-2026-10-12.md).

## Administrator publishing

See [workshop publishing](workshop-publishing.md) for the separate /mcp/publishing endpoint, browser facade, editor contracts, model generator, owner adapters and durable receipts. Catalog behavior remains unchanged.

## Security and future boundaries

OAuth defaults to bearer enforcement with catalog:read. service-auth owns account
login/consent, code/token/grant storage and revocation. The additive auth-client
validates trusted introspection without cookie fallback, JWT decoding or cached
identity. Public domain GETs remain credential-free; roles imply no catalog scope.
The gateway has no auth DB access or signing secret. Protected-resource metadata
uses explicit configured identities, never inbound Host or forwarded headers.
The gateway pins published @tmdjr/ngx-auth-client 0.0.66 and needs no sibling checkout at runtime.

Local loopback binding and Host/Origin checks remain; explicit production uses exact trusted proxy IPs and normalized HTTPS authority. Explicit
local-public is for local regression tests only. OAuth errors occur before body
parsing/tool calls. CIMD HTTPS fetch protections belong to service-auth; runtime
has no test bypass for private addresses or TLS verification.

Docker/Actions gates and dedicated Nginx native HTTPS routing are deployed. Public identities, exact callbacks, verified private backhaul, scoped Mongo and persistent secrets are in operation. Private ChatGPT account linking remains unverified; distributed traffic controls and an audit backend are future work.

## Contracts and migration

Zod MCP schemas are stable boundary definitions, not aliases for domain REST
models. Explicit small validators are used because published domain packages
contain TypeScript-only models. A future producer-owned OpenAPI/runtime-schema
export can replace those validators independently of the MCP contract.

The gateway contracts package now uses openapi-typescript plus generated aliases
and runtime JSON Schema metadata. Opaque sample input/expected values remain
unknown, avoiding generated any. This is a breaking replacement of seed CRUD
exports; @tmdjr/service-mcp-gateway-contracts 1.0.0 is published with this intentional break. Consumers of seed CRUD must migrate. See [ADRs](adr/README.md).

## Production readiness

See the [runbook](production-readiness.md) and [handoff](../specs/004-deployment/handoff.md).
Production bootstrap verifies owner responses and authorization-server discovery
before listening. See [actual launch evidence](production-execution-2026-10-12.md) for deployed versions and the remaining ChatGPT client gap.

## Automatic delivery

Main pushes validate, publish contracts via npm OIDC, then promote the exact validated Docker artifact. Deployment preserves the host-owned environment, private ingress and persistent publishing volume, checks readiness through the trusted proxy and restores the previous container on failure. See [delivery runbook](automatic-delivery.md).
