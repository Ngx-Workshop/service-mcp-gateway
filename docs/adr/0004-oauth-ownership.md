# ADR 0004: OAuth issuer in service-auth, gateway as resource server
Status: Accepted for authorized local implementation · 2026-10-12
Feature: [003 OAuth](../../specs/003-oauth-resource-server/spec.md)

## Context

service-auth owns users, password verification and cookie JWT login. Inspection
found no OAuth authorization/token/metadata/PKCE/consent capability. The gateway
already owns MCP transport and three read-only catalog tools. The official SDK
supports a resource-server verifier; adding login/token persistence to the gateway
would duplicate identity ownership. See [source evidence](../../specs/003-oauth-resource-server/research.md).

## Decision

Extend service-auth with a maintained OAuth server engine and an auth-owned
browser login/consent flow using existing identity verification. Authorization
code flow with S256 issues separate resource-bound OAuth access tokens. Keep the
gateway database-free and implement public protected-resource metadata plus an
SDK bearer gate; auth advertises its own AS discovery. Resource/issuer identities
are configured explicitly, not inferred from inbound HTTP headers.

Preregister the local acceptance client; support approved HTTPS Client ID Metadata
Documents with strict SSRF/redirect/identity controls. Do not provide public DCR.
Choose/prove engine and durable adapter before implementing issuance, rather than
relying on frozen MCP legacy AS helpers or assuming current JWT login is OAuth.

## Alternatives and consequences

A gateway-owned OAuth server duplicates users/grants and is rejected. A third-party
standards-capable provider integrated with existing identity is a contingency if
the engine spike cannot meet the profile, requiring a revised owner ADR. Cookie
login/manual JWT injection does not fulfill the planned client consent/code flow.
Auth-owner work is a real dependency, delivered before gateway live acceptance.
Legacy cookie routes stay compatible. Local implementation and verification are recorded in feature 003 handoff.

Basis: [MCP authorization roles](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization),
[client registration](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration),
and [PKCE](https://www.rfc-editor.org/rfc/rfc7636.html).

Local acceptance evidence: [feature 003 handoff](../../specs/003-oauth-resource-server/handoff.md).
