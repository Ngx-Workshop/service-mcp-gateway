# ADR 0005: Additive auth-client introspection for MCP tokens
Status: Accepted for authorized local implementation · 2026-10-12
Feature: [003 OAuth](../../specs/003-oauth-resource-server/spec.md)

## Context

Current @tmdjr/ngx-auth-client 0.0.21 prioritizes cookies, calls boolean validation
and decodes subject/email/role; it carries no trusted client/resource/scope/expiry
projection. Existing services depend on those exports. Adapting its legacy guard
without changing the auth protocol cannot validate MCP audience or permissions.

## Decision

Add a separate configurable OAuthIntrospectionClient/OAuthPrincipal API in the
existing package, preserving old guards/decorators/types. Auth issues opaque
10-minute access tokens and stores hashes. Gateway authenticates to RFC 7662
introspection with a dedicated resource-server credential. Validate active state,
issuer, exact audience, subject, client_id, token use, scope and expiry from that
trusted response; never locally decode claims or merge an existing request user.
Reuse the package's Nest/HTTP patterns and identity ownership where practical,
without giving the package an MCP SDK dependency.

The gateway adapter maps trusted principal into SDK AuthInfo; user subject and
client ID stay distinct. SDK enforces required scope and expectedResource. No
cookie fallback, shared JWT signing secret, redirects, silent retries or caching.
Bound requests to three seconds/64 KiB; invalid tokens yield 401, insufficient
scope 403, and infrastructure/malformed trusted response yields sanitized 503.
Service credentials reach only the configured introspection endpoint; caller
credentials never reach public catalog owners.

## Alternatives and consequences

Boolean validation plus local claim decoding is insufficient. Shared-secret JWT
verification distributes signing authority and preserves legacy audience ambiguity.
Asymmetric JWT/JWKS is a future option if latency/availability evidence requires
it; it needs a new owner key lifecycle/revocation ADR. Introspection gives auth
immediate revocation authority but adds a network dependency on every protected
request. Auth outage must fail closed. New API must be built/locally consumed
before a runtime gateway pin. Local version 0.0.22-local.0 is built and consumed
from an integrity-pinned tarball; publication remains separate.

Basis: [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662.html),
[resource indicators](https://www.rfc-editor.org/rfc/rfc8707.html),
[SDK verifier](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization).

Local acceptance evidence: [feature 003 handoff](../../specs/003-oauth-resource-server/handoff.md).
