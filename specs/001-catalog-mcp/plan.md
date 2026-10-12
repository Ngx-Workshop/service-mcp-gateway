# Implementation plan
Status: Complete (local scope)
Spec: [spec.md](spec.md)
Updated: 2026-10-12

## Baseline
Gateway is a CRUD Nest 11 seed with mongoose and stale e2e. Published domain packages contain erased TypeScript models, not runtime validators or HTTP clients. Official registry confirms server/client 2.3.1 and node 2.1.1. Source endpoints were verified in the approved architecture review; this implementation depends only on published contracts.

## Design
FR-001: thin Nest controller delegates /mcp to official Node handler; tool factory uses injected adapters with immutable public definitions.
FR-002–003: HttpService GET Observables validate unknown payloads before projection; firstValueFrom at SDK Promise boundary. Public reads carry no client credentials.
FR-004: Zod 4 strict MCP schemas; permissive upstream projections discard extra authoring fields. Fixed timeout, response size, list/outline limits, no redirects and bounded local request bodies. Semantic not-found/forbidden errors are distinguished from protocol validation errors.
FR-005: no persistence imports; localhost startup plus Host/Origin checks before MCP parsing. OAuth deliberately excluded; deployment assets untouched.
FR-006: Zod is the MCP contract source. Swagger exports its schemas as independent named components and a separate tools JSON artifact; openapi-typescript plus generated aliases regenerate package models. Domain validators are explicit small projections with compile-time checks against published model fields.

## Constitution check
1: Gateway owns protocol contracts, no persisted domain.
2: Explicit public routes, generated models and MCP discovery; obsolete seed API retired with migration notice.
3: Public local-only approved; no auth bypass for personalized operations because none exist.
4: N/A: no persistence.
5: Acceptance tests exercise behavior and real local HTTP.
6: Specs, ADRs, context docs and handoff updated locally.

## Verification
Unit schemas and projection/error tests; adapter tests with disposable HTTP upstream; e2e using official SDK and actual Nest listener, modern and legacy protocol paths. Strict build, generated contract build, eslint without fixes. No external infrastructure prerequisite.

## Risks and migration
Breaking local seed REST/contracts removal is intentional; version/release approval remains future work. Incoming MCP tokens are never forwarded. Unknown upstream fields are discarded; missing/wrong consumed fields fail closed. CI/deployment still reflect seed assumptions and must be reviewed before any production push. No external-owner modifications or database migration.
