# OAuth protection for the MCP catalog
Status: Complete for authorized local OAuth scope; deployment deferred
Feature ID: 003-oauth-resource-server
Created: 2026-10-12
Request: Plan OAuth using service-auth and @tmdjr/ngx-auth-client; leave deployment for the next phase.

## Outcome and scope

A connected user authorizes a known MCP client to read the same general catalog
through the existing three tools. service-auth remains the identity and OAuth
issuer owner; the gateway becomes its protected resource. OAuth grants do not
create personalized learner entitlement. This feature plans local implementation
and real local acceptance; it does not authorize runtime changes in this planning
turn or claim readiness for deployment.

Unchanged: tool names, input/output schemas, published domain contracts, public
owner REST endpoints, stateless modern/legacy transport and redacted lab content.
Excluded: deployment, DNS/TLS/proxy/CI changes, production mode, new tools,
OpenClaw, learner progression, token exchange/downstream delegation, OIDC identity
claims, password/implicit/client-credentials grants to MCP, and refresh tokens.

## Requirements

- FR-001: service-auth owns OAuth authorization code flow, PKCE S256, client registration policy, login and explicit per-client/resource/scope consent. Reuse existing user identity/password verification without duplicating users or changing legacy browser login contracts.
- FR-002: Gateway publicly serves RFC 9728 metadata for its configured canonical /mcp resource; advertise one trusted auth issuer and catalog:read scope. Auth owner serves RFC 8414 metadata. Canonical URLs come from configuration, never Host/forwarded headers or tool arguments.
- FR-003: All implemented MCP requests, including initialization, discovery and all tools, require Authorization: Bearer and catalog:read. Cookie-only, legacy app JWT, refresh/ID token and query/body tokens are not valid credentials. OPTIONS preflight and public metadata are exempt; unsupported GET/DELETE remain 405 without opening sessions.
- FR-004: Validate active access token, trusted issuer, exact single gateway audience/resource, nonempty subject and actual OAuth client ID, finite expiry, token use and granted scope. Never decode unverified JWTs or map role to scope. Different users/clients must have isolated request context.
- FR-005: Reuse the auth-client package via a new additive typed introspection client, with explicit config and no cookie fallback. Do not install its existing global AuthenticationGuard/RemoteAuthGuard as the MCP OAuth gate. No auth DB access/shared signing secret in the gateway.
- FR-006: Missing/invalid/expired/wrong-audience credentials yield HTTP 401 Bearer challenge; insufficient scope yields HTTP 403 insufficient_scope with catalog:read and metadata link. Authentication precedes body/tool processing and downstream calls. Introspection outage/invalid response fails closed with sanitized 503, not invalid_token or a tool error.
- FR-007: Bind authorization code, PKCE, redirect, client, subject, resource and granted scopes; atomically redeem once with enforced expiry. Validate resource in both authorize and token requests. Unknown client/resource/scope, missing/weak PKCE, mismatched redirect and replay fail safely. Unvalidated redirect URLs never receive errors or codes.
- FR-008: Issue distinct opaque OAuth access tokens with 10-minute lifetime, stored as cryptographic hashes with owner-managed grant state. Introspection/revocation are authenticated, bounded and scoped to the caller resource/client. Revoke grants/tokens explicitly; reject expired/revoked tokens on the next protected request. No validation cache or refresh grant in first implementation; after expiry, reauthorize. Legacy sign-out remains cookie logout, not an implied OAuth grant revocation.
- FR-009: Support preregistered local clients and allowlisted HTTPS Client ID Metadata Documents. No public DCR endpoint. Validate metadata/client_id consistency, exact redirects, allowed capabilities and consent; prevent private-network fetches, redirects and DNS rebinding. Do not advertise support until its tests pass.
- FR-010: Preserve loopback binding, Host/Origin protection, production rejection and bounded requests/results. HTTP is a controlled loopback-only development exception; non-loopback configured OAuth endpoints require HTTPS. No discovery/autofetch of issuers from incoming tokens. Bound introspection timeout to 3 seconds and response to 64 KiB; no redirects, credentials in URLs or hidden retries.
- FR-011: Public owner reads remain credential-free. No inbound token/cookie, introspection service credential or identity data in tool outputs, logs, downstream calls or generated tool contracts. Consent clearly explains catalog-only access; no access to grading or private learner data.
- FR-012: Verify local real auth→gateway→document/labs flow plus focused negative tests, package compatibility and original catalog regressions. Update feature evidence and preserve existing browser login consumers. Document separate release/deployment prerequisites without performing them.

## Acceptance scenarios

| ID | Observable scenario | Required result |
| --- | --- | --- |
| AC-001 | Native official client calls /mcp without credentials; follows challenge→resource metadata→auth metadata | Public discovery describes exact configured resource/issuer/scope; MCP returns 401 and no owner reads |
| AC-002 | Real local user logs in, consents to preregistered client using S256, exchanges code with same resource, calls discovery and all tools | Exact three catalog tools and same outputs as feature 002 through real MongoDB-backed owners; modern and legacy client calls succeed |
| AC-003 | Invalid/missing/plain PKCE, bad redirect/client/resource, scope escalation, expired code or concurrent replay | No token issued; atomic single redemption; safe errors and no redirect to unvalidated destination |
| AC-004 | Missing/duplicate/malformed bearer, cookie-only, app JWT, wrong audience/issuer, expired/revoked/access-use mismatch | 401 with RFC-compatible challenge before tool/body/owner processing; valid token with no catalog:read yields 403 |
| AC-005 | Auth unreachable/timeout/5xx, introspection credentials rejected or malformed trusted response | Sanitized 503; no fallback to cookies, local decoding, anonymous access or cached identity |
| AC-006 | Revoke a client grant, authorize another user/client, send concurrent requests | Revoked token denied on next request; no principal leakage; subject and client remain distinct |
| AC-007 | Allowlisted metadata client completes flow; metadata targets private IP/redirect/DNS rebinding, inconsistent ID or redirect | Allowed client works; hostile metadata fails without fetching private resources or issuing tokens |
| AC-008 | Legacy browser signin/validate/signout and other auth-client consumers; missing OAuth config/unsafe mode; downstream capture | Existing browser behavior retained; OAuth mode fails startup without config; no forwarded credentials or new production binding |
| AC-009 | Build/lint/unit/HTTP/protocol checks, real local flow, generated discovery drift and package consumer tests | Nonempty real-service success evidence; exact commands/counts recorded; no publication or deployment |

## Assumptions and implementation gates

One scope suffices for all three read-only tools; all platform user roles may
consent to this general catalog. Initial user-facing login/consent pages belong
in service-auth rather than a new frontend dependency. Default proposal is no
refresh tokens and 10-minute access tokens; revisit only with a separate lifecycle
ADR if sustained client sessions require it.

The subsequent T001 spike recommends oidc-provider 9.12.2 (MIT) with real
HTTP/MongoDB evidence and a replica-set transaction prerequisite; see owner
`docs/adr/0001-oauth-engine.md`. Before auth runtime integration, apply its recorded
constraints and harden the adapter. Original engine gate: select a maintained OAuth engine compatible
with Nest/Node, existing identity, durable storage and this profile. Engine selection
is an implementation gate, not evidence that the existing auth service is compliant.
Exact external callback URLs/client identities and public resource/issuer URLs
belong to deployment configuration later. No such value must be invented now.
