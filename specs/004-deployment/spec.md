# Deploy the OAuth MCP gateway using existing infrastructure
Status: Deployed/published; ChatGPT three-tool acceptance passed · 2026-10-12
Updated: 2026-10-12

## Scope and intended outcome

Prepare a reviewable production implementation and release plan for the existing
GitHub Actions → Docker application droplet → Nginx edge architecture. service-auth
owns identities/OAuth/storage; gateway owns three read-only tools. Reuse existing
private networking, rs0 and SSH/OIDC tooling. No deployment, workflow dispatch,
publication, DNS/certificate change, secret write or Mongo administration now.
Runtime, Docker/Compose and validation-only CI readiness are implemented; Nginx and live infrastructure remain unchanged.

Recommended identities (proposals, not verified DNS or approved registrations):
resource `https://mcp.ngx-workshop.io/mcp`; issuer `https://auth.ngx-workshop.io`;
introspection `https://auth.ngx-workshop.io/oauth/introspect`. Keep issuer at origin
and resource at exact /mcp; changing either invalidates audience-bound grants.
Client callbacks and CIMD URLs must be verified with the intended client before
registration; no guessed ChatGPT redirect URI or invented client credentials.

## Requirements

- FR-001: Keep current hosting, container identities/ports/ngx-net and edge repository. Add a validated explicit production profile; local profile retains loopback/production rejection. Production forbids local-public, local flags, HTTP public identities and generation stubs. Public resource identity is independent of private listen address/port.
- FR-002: Public HTTPS exposes exactly /mcp and /.well-known/oauth-protected-resource/mcp on the proposed dedicated host. Reject unknown Host and conflicting forwarded authority. Preserve Authorization, MCP headers, protocol status/challenges and streamed responses; no BFF rewrite, cache or automatic replay of MCP/OAuth POSTs.
- FR-003: Trust only the configured edge peer/proxy chain; overwrite forwarding headers there and deny direct public application ports. Absent Origin permits server clients; present Origin must match an explicit client-origin registry. CORS for approved browser clients only; no wildcard credential CORS. Discovery may permit credential-free cross-origin GET; tokens never appear in URLs/logs.
- FR-004: Preserve exact catalog:read, S256, 600-second opaque tokens, no refresh/DCR, strict CIMD controls and authenticated per-request introspection. Reuse the additive auth-client artifact or a verified immutable registry release; no sibling build dependency or unpublished guessed version. All three tools/payloads remain unchanged and downstream owner GETs stay credential-free.
- FR-005: Environment-scoped release configuration separates public settings from secrets. Gateway has only resource-client introspection secret and deployment credentials, never JWT signing/private JWKS/Mongo/storage keys. Auth persists cookie/JWKS/encryption keys and dedicated DB credentials across release/rollback; no startup key generation or private config in images/artifacts/source/logs.
- FR-006: Auth reuses existing accounts and documented private rs0 only after topology, transactions, backup/restore, privileges, connectivity and encryption checks. Gateway has no Mongo credential/network need. Never reset rs0, copy/drop shared users or restore the old whole-database backup as an application rollback.
- FR-007: CI must test before publish/deploy, use pinned reviewed actions/Node/base images and lockfiles, package immutable artifacts by SHA/digest and promote the same artifact. Separate optional NPM publication from rollout and test-only builds. Require explicit manual release plus protected-environment authorization where available, with a documented equivalent if not available. Existing main triggers must not silently publish/deploy the OAuth work.
- FR-008: Rollout order is database/config readiness → auth → gateway privately → edge exposure → external-client acceptance. Readiness proves configuration and actual dependencies, not just open TCP. Save compatible image/config versions and sanitized failure diagnostics; failed smoke tests restore previous image/config without anonymous fallback or DB rewind.
- FR-009: Add edge/application request and login limits, bounded concurrency and redacted metrics for auth latency/401/403/503, tool/owner latency and revocation failures. Preserve existing 64-KiB MCP input, 2-MiB owner limits and timeouts. Review current dependency findings for reachable release blockers, without treating a clean build as an audit pass.
- FR-010: Verify legacy auth/browser routes, all three tools under both MCP eras, public TLS/discovery, real approved-client login/consent, introspection, next-request token/grant revocation, restart/key persistence and rollback. Actual hosted-client connectivity requires that client's test; official SDK tests alone cannot claim it.

## Acceptance for future implementation

| ID | Scenario | Required evidence |
| --- | --- | --- |
| AC-001 | Production/local config and container builds | HTTPS external identities differ from private ports; unsafe modes fail; local regressions pass; vendor install works; no key/config file in image layers |
| AC-002 | Edge route/TLS/Host/proxy/Origin | Valid cert chain/renewal test; exact discovery/MCP routes; spoofed/direct ingress denied; bearer/challenge/SSE headers intact; no rewrite/cache/retry |
| AC-003 | Approved OAuth client | Verified ID/CIMD/callback registration; S256/resource/code flow; secure auth-only cookies; exact consent; all three tool calls succeed with same public fields |
| AC-004 | Invalid/revoked bearer and outage | 401/403/503 before tools; revocation denies next request; Basic secret only to issuer introspection; owner headers contain no credentials |
| AC-005 | Mongo/keys/restart/restore | Auth least-privilege CRUD/transactions/expiry work; tokens survive compatible restart; encrypted backup restores in isolation with keys, old grants invalidated; users preserved |
| AC-006 | CI/release/rollback | Test failure prevents publish/deploy; unauthorized promotion blocked; artifact digest/config revision recorded; failed rollout captures diagnostics then restores previous release |
| AC-007 | Public client and legacy regression | Real external client works and can revoke; modern/legacy tools pass; old authentication SPA/API/BFF cookie consumers unchanged |
| AC-008 | Operational protections | Edge limits/throttle identity spoofing/outage alerts tested; no sensitive fields in access logs, CI artifacts or support output |

## Decisions to confirm before implementation/release

D001: Operator confirms mcp hostname, DNS owner, certificate SAN/renewal and chosen
client environments (no live DNS lookup performed). D002: Obtain exact client IDs,
CIMD URLs/callbacks/origins and platform policy. D003: Verify edge/app/database
private addresses/firewalls and choose encrypted VPC backhaul or explicitly accept
the existing private HTTP trust boundary before launch. Prefer verified TLS for
cross-droplet sensitive traffic; do not disable TLS verification to reuse HTTP.
D004: Verify rs0 topology/version/TLS/backup ownership; confirm single-member
outage tolerance and recovery targets. Proposed initial RPO <=24h/RTO <=4h are
planning targets, not current guarantees. D005: Confirm GitHub environment controls,
production secret owner and auth-client publication policy. These are future
release gates, not approval requests or work performed in this planning turn.

Readiness scope and current evidence: [runbook](../../docs/production-readiness.md).
Release acceptance remains broader than the completed local checks.

Live release decision: [2026-10-12 preflight](../../docs/deployment-preflight-2026-10-12.md). Audit completed; release gates failed or remain unverified.

2026-10-12 user clarification: no production traffic; downtime accepted. Initial
launch retains single-member rs0 without a strict RTO or zero-downtime requirement.
Data-loss policy is not waived. [Recommended ChatGPT registration and recovery
baseline](../../docs/launch-client-and-recovery.md) replace the open availability
question; exact callback/issuer acceptance and recoverable backups remain gates.
No deployment or publication is authorized.

## Authorized production execution — 2026-10-12

The user now authorizes the recommended ChatGPT setup, infrastructure/secret/
MongoDB TLS/scoped-access/recovery remediation, deployment and publication.
Earlier no-deploy/no-publish restrictions are historical and superseded. Downtime
is acceptable; existing shared records/legacy auth and independent keys remain
preserved. No renewed permission is required for the explicitly authorized
release. Record exact versions, images, recovery proof and public smoke evidence.

Execution order: fresh encrypted consistent backup and isolated restore; durable
keys/CA/scoped roles; validated service and private TLS backhaul images; safe CI
and package release; private service rollout; edge/DNS; ChatGPT linking and public
three-tool/revocation/legacy acceptance. Compatibility-mode Mongo TLS preserves
older consumers until their own TLS migration; auth requires verified TLS.
