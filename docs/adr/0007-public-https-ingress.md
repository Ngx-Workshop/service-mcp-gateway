# ADR 0007: Public HTTPS through the existing Nginx edge
Status: Accepted for readiness implementation; release operations deferred · 2026-10-12
Feature: [004 deployment](../../specs/004-deployment/spec.md)

## Context

Nginx already terminates HTTPS on ngx-workshop.io subdomains and proxies over the
VPC to application port 3000. The current MCP /api rewrite does not target native
/mcp. Local binaries reject production/remote identities and bind loopback. Auth
hostname already hosts a SPA and legacy /api/auth consumers.

## Proposed decision

Reuse Nginx/DigitalOcean/Docker; propose dedicated mcp.ngx-workshop.io with exact
/mcp and path-aware protected-resource metadata. Reuse auth.ngx-workshop.io as
origin issuer, adding native /oauth routes, AS discovery and /jwks ahead of SPA
fallback. Do not replace existing / or /api/auth routes or mount issuer under an
unverified /api prefix. DNS/cert coverage is an operator gate, not a claim today.

Public URLs are canonical explicit HTTPS config independent of private port and
binding. Implement separate production profiles; retain current strict local
profiles. Only trusted edge peers may supply normalized forwarded protocol/client
address; service checks exact public Host and approved present Origin, permits
server clients with no Origin, and rejects direct/spoofed ingress. Configure
noncredentialed discovery CORS independently from bearer MCP CORS. Preserve MCP/
Authorization headers and challenges; streaming is not WebSocket upgrade. No
response caching, auth URL logging, bearer rewriting or upstream POST replay.

Prefer verified TLS across edge-to-app VPC hops. Existing HTTP backhaul is a
known source inventory fact, not an encryption guarantee. Before public launch,
choose encrypted backhaul using existing proxy tooling or explicitly accept a
restricted VPC trust boundary with firewall/direct-port tests. The production
spec records this decision as D003; no tls verification bypass is acceptable.
Gateway-to-introspection uses canonical issuer HTTPS and validates certificates.

## Alternatives and consequences

Using the existing BFF rewrite couples AI protocol and browser routes and breaks
native discovery. New hosting/orchestration is unnecessary at current scope.
One dedicated public host avoids path aliases and cookie ambiguity. Production
requires proxy/secure-cookie tests plus exact client registrations and public
smoke; localhost proofs don't establish hosted-client compatibility. Implementation
must be coordinated with the edge owner and never expose current local binaries.

References: [Nginx proxy controls](https://nginx.org/en/docs/http/ngx_http_proxy_module.html),
[MCP authorization](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/index.mdx).

## Implementation evidence

The readiness subset is implemented and verified locally; see
[production readiness](../production-readiness.md). CI now validates and retains
reviewable candidates only. Secret provisioning, live client registration, edge
configuration, backup/rotation proof and protected promotion remain future release
operations. No publishing or deployment occurred.

## Live preflight — 2026-10-12

[Audit evidence](../deployment-preflight-2026-10-12.md) verifies current hosts,
certificate, authenticated single-member rs0 and historical backup integrity.
Installed production configuration does not yet satisfy this decision; deployment
is blocked by the recorded infrastructure/client/secret/recovery/CI gaps. No
production change or publication occurred.

## Launch-policy clarification

The user accepts downtime because there is no production traffic. Retain the
single-member replica for launch; no strict recovery-time commitment or
zero-downtime deployment is required. Preserve data and keys and prove recovery.
Initial ChatGPT registration is a recommendation awaiting exact client callback
acceptance; see [client/recovery note](../launch-client-and-recovery.md).
Nothing was provisioned, deployed or published.

## Authorized launch evidence — 2026-10-12

Decision implemented in production after explicit user authorization. See [launch evidence](../production-execution-2026-10-12.md) for reviewed commits/images, persistent secrets, verified TLS/scoped storage, actual recovery/public acceptance and the unresolved private ChatGPT builder error. Earlier no-deploy statements describe the historical phase.
