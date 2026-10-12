# OAuth tasks
Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md)
Status: T001–T010 complete for local scope; deployment deferred.

## Delivered planning

- [x] P001: Inspect service-auth source and installed auth-client 0.0.21; record gaps and compatible reuse in research.md.
- [x] P002: Review current MCP/SDK authorization and OAuth primary references; define resource/scopes/grants and contracts.
- [x] P003: Add spec, implementation plan, external-owner interfaces, proposed ADRs, verification matrix and handoff; update context/index and check links/whitespace.

## Auth owner first

- [x] T001: service-auth owner spec/ADR and maintained OAuth engine spike; prove S256/resource/metadata-client/introspection/revocation/storage hooks and record dependency/version/license (FR-001, 007–010; AC-003, 007). Gate T002; revise design if unsupported.
- [x] T002: Refactor existing identity verification; add safe auth local mode and isolated database/client fixtures, browser login/consent with CSRF and transaction binding, retaining legacy API tests (FR-001, 010–012; AC-002, 008). Depends T001.
- [x] T003: Auth metadata, authorize/token routes and hashed code/grant/token records; enforce exact client/resource/redirect/scopes and atomic redemption/expiry (FR-002, 007–009; AC-001–003, 007). Depends T002.
- [x] T004: Auth introspection, token/grant revocation and bounded metadata-client resolution; invalid legacy tokens, resource-server credentials, SSRF/DNS rebinding, next-request revocation tests (FR-004, 008–010; AC-004–007). Depends T003.
- [x] T005: Add typed configurable OAuthIntrospectionClient/principal/errors to auth-client; verify legacy export/consumer compatibility and new runtime schemas; build and locally package/test without publishing (FR-004–006, 010–012; AC-004–006, 008–009). Depends T004.

## Gateway consumer

- [x] T006: Validated OAuth config/default + explicit local-public mode; public path-aware metadata; keep loopback/production/Host/Origin rules and add config tests (FR-002, 003, 010; AC-001, 008). Local metadata tests can start independently; live behavior depends T003.
- [x] T007: Pin verified additive auth-client as runtime dependency, SDK verifier/middleware, scope and audience gate with 401/403/503 mappings and isolated request context; reject cookies/query/duplicate auth; prove no downstream auth headers (FR-003–006, 011; AC-004–006, 008). Depends T005–006.
- [x] T008: Update original config/protocol/live runner tests for explicit local-public or bearer; add OAuth HTTP/concurrency/protocol suites and exact discovery/error checks (FR-006, 010–012; AC-001, 004–009). Depends T007.
- [x] T009: Real local OAuth integration runner plus actual login/consent→code/token→all three tools for modern/legacy clients; revoke and retry; use nonempty catalog, isolated auth data and stop owned processes (FR-012; AC-002, 003, 006, 009). Depends T004, T008.
- [x] T010: Run changed owner/client/gateway build/lint/tests, source-generated HTTP/package contracts, local consumer import, original catalog regressions and real integration; record exact counts/gaps, approve/update ADR status and update handoff/context (FR-012; AC-008–009). Depends T009. No publish/deploy.

## External handoff

T001–T005 delivered in service-auth (features 001–003). oidc-provider 9.12.2
runtime retains legacy cookie behavior; hardened CIMD and additive auth-client
0.0.22-local.0 are verified. The gateway consumes a local tarball with lockfile
integrity; no package publishing. T006–T010 passed here. See [handoff](handoff.md)
for exact commands/counts and controlled TLS fixture limits. Document and labs
needed no source changes. Deployment remains a separate authorized phase.
