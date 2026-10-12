# ADR 0006: One catalog scope, separate consent and deployment boundary
Status: Accepted for authorized local implementation · 2026-10-12
Feature: [003 OAuth](../../specs/003-oauth-resource-server/spec.md)

## Context

The verified tools expose general catalog summaries, workshop outlines and public
published lab content. Authentication should protect MCP access without suggesting
learner eligibility or exposing authoring/private data. Existing loopback-only
behavior is accepted in ADR 0003; deployment remains separately requested work.

## Decision

Require catalog:read for initialization/discovery and all three tools. All user
roles may consent to the same general catalog; roles are not implicit scopes.
Preserve tool schemas/projections and public owner routes. No downstream token
exchange/delegation or forwarding. Consent names the requesting client, gateway
resource and catalog-only scope; authorization grants are explicitly revocable.
Access lasts ten minutes; no refresh grant in this initial phase. Expiry requires
reauthorization, with a fresh code/S256 flow. Do not repurpose the legacy refresh
helper; refresh lifecycle needs a separate ADR if later required. Cookie sign-out
retains its original semantics and does not masquerade as grant revocation.

Implement/test OAuth locally while retaining 127.0.0.1 binding, production rejection
and Host/Origin checks. OAuth is the default; explicit local-public is a
local regression-test mode, never a fallback on auth failure or missing config.
Public metadata/preflight are explicit exceptions. Runtime behavior is implemented and verified locally.

## Consequences

This intentionally protects /mcp even though the underlying catalog REST reads
remain public. New access policy is a transport compatibility change, not a data
contract change. Session duration is limited without refresh; local acceptance
cannot prove hosted ChatGPT reachability. Public HTTPS URLs/callbacks, proxy/host/
origin/CORS settings, secret operations, traffic controls and deployment assets
remain next-phase decisions. Personalized tools require service-owned entitlement
and a separate delegation design. The implementation supersedes ADR 0003's unauthenticated access when implementation is delivered,
while keeping its catalog and local-boundary decisions.

Basis: [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html),
[revocation](https://www.rfc-editor.org/rfc/rfc7009.html),
and [protected resource metadata](https://www.rfc-editor.org/rfc/rfc9728.html).

Local acceptance evidence: [feature 003 handoff](../../specs/003-oauth-resource-server/handoff.md).
