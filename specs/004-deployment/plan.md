# Implementation and rollout plan
Status: Deployed/published; ChatGPT three-tool acceptance passed · 2026-10-12
Inventory: [research.md](research.md) · Requirements: [spec.md](spec.md)

## Boundaries and concrete changes

| Owner | Future files/work | Compatibility / verification |
| --- | --- | --- |
| MCP gateway | src/auth/oauth.config.ts, src/mcp/catalog.config.ts, src/mcp/local-boundary.ts, src/bootstrap.ts, src/auth/oauth-gate.ts | Explicit local/production profile; HTTPS public identities independent of private listener; trusted proxy and exact hosts/origins; preserve no anonymous fallback |
| Gateway build/delivery | Dockerfile, .dockerignore, docker-compose.yml, .github/workflows/deploy.yml | Copy vendor before npm ci; non-root runtime, pinned Node 22 image, runtime-only dependencies; secrets outside build context; tests/release/promote/rollback |
| Auth owner | Its feature 004, config/provider/bootstrap/grants/interactions/app.module; private config mounts/workflow | HTTPS issuer/secure proxy session, trusted rate-limit identity, private replica set, persistent secrets; preserve legacy routes/users |
| Edge owner | nginx-ngx-workshop.io/docker/nginx.conf and deploy workflow | Dedicated MCP vhost; exact auth-native paths; frontend/API retained; nginx -t and rollback; no edge source changes in this phase |
| DB/operator | Existing rs0, auth-specific role, scheduled encrypted backup/restore drill | Preserve users and other services; no database recreation or whole shared DB rollback |

## Production configuration contract

Existing gateway names remain MCP_AUTH_MODE=oauth, MCP_RESOURCE_URL,
AUTH_ISSUER_URL, AUTH_INTROSPECTION_URL, AUTH_INTROSPECTION_CLIENT_ID/SECRET,
DOCUMENT_BASE_URL, CODING_LABS_BASE_URL, PORT=3011. Proposed additions are an
explicit runtime profile, private bind address, allowed hosts/origins and trusted
proxy peers; finalize names in implementation before env generation. NODE_ENV is
production; local flags absent/false. No AUTH_BASE_URL or MONGODB_URI in gateway.
Config failures must stop startup rather than silently choose local mode.

Use canonical HTTPS issuer introspection (same-origin SDK contract) with network
routing tested from app droplet; use private DNS resolution only if certificate
hostname validation and Host/SNI remain the public issuer. Private owner base URLs
use verified native document/lab reads, never their frontend /api rewrites and
never their local synthetic-admin mode. Readiness excludes secret-bearing payloads.
Gateway liveness checks process; private readiness boundedly checks owner routes
and auth discovery/reachability, while full authenticated acceptance uses a
separately held disposable test token. Do not make every liveness call introspect.

Public host /mcp routes directly to 3011 with unchanged path. Path-aware metadata
routes directly, never to the BFF. Use HTTP/1.1 proxying, preserve Authorization,
MCP headers and WWW-Authenticate, turn buffering/cache off for MCP responses,
remove WebSocket upgrade boilerplate, disable upstream retries of mutations,
allow bounded SSE response duration. Present Origin uses approved exact registry;
server clients without Origin remain allowed. Reject arbitrary hosts at edge and
service, overwrite forwarded headers and trust only known edge peers. VPC app
ports limited to edge and specifically authorized internal callers; no public
0.0.0.0 published ports. Docker firewall behavior must be tested, not inferred
from UFW configuration. Reuse port numbers but separate listen/publish policy.

## Release stages (future; do not execute now)

1. Confirm D001–D005 and inventory live infra read-only under later authorization.
   Audit domains/certs, routes/consumers and current deployed configs without
   collecting secret values. Agree private-backhaul transport and recovery targets.
2. Implement and test both production profiles/container configs offline. Reuse
   135 local OAuth tests as baseline, add proxy/TLS/env/container tests; auth first
   builds additive package, gateway consumes immutable artifact. Fix Docker layer
   order and key exclusions before any build containing private config.
3. Add non-deploying PR validation in both service repos. Auth CI starts only an
   isolated replica set for OAuth suites; gateway isolated checks remain standalone,
   and release integration uses real approved domain HTTP owners without seeding
   their data. Nginx validation uses fixture certs offline. Tests precede publishing.
4. Refactor main workflows so main validates/builds; promotion requires explicit
   dispatch and release authorization. Use protected environments where supported;
   if unavailable, an operator-authorized manual promotion with branch checks and
   isolated secrets is mandatory. Preserve pinned SSH fingerprint/SCP actions,
   timeout/concurrency/cleanup. Remove coupling deploy needs publish. Optional
   contract/client NPM OIDC publishing is a separate reviewed job.
5. Produce/test Docker images in CI, label source SHA, capture image digest and
   dependency/config schema versions. Prefer transporting immutable image archives
   through existing SCP + docker load instead of rebuilding a different image on
   the host; no new registry is required. Artifact attestations/checksums validated
   before activation. Never include env/keys in archives. Versioned release/config
   directories avoid stale source overlay and pair image/config atomically.
6. Provision auth least-privilege DB role/indexes/validators and persistent secrets
   only after a current recoverable backup and isolated restore proof. Validate
   replica-set name, primary and real transaction; don't repeat rs.initiate.
7. Release auth production-capable code with public OAuth ingress closed initially;
   preserve current legacy routes and JWT/domain/TTL settings. Then privately
   verify AS metadata, TLS proxy cookies, registered client and storage/restart.
   Deploy gateway behind closed MCP ingress; verify dependencies/metadata/bearer.
8. Enable auth native routes, then dedicated MCP edge routing after private smoke
   gates; preserve SPA / and /api/auth consumers. Run external positive/negative
   flow, all three tools, token/grant revocation and real selected client test.
   A limited explicit client registry is the initial launch cohort, not open DCR.
9. Observe bounded latency/error/availability and redact diagnostics. Failed gate
   closes new MCP ingress and restores compatible image/config pair; auth legacy
   rollback must keep accounts and keys. Never switch to local-public. Database
   schema changes stay additive; restoring shared DB is a separate incident operation.

## Secrets and Mongo handoff

Auth stores a durable private config outside release checkout, root-owned 0600
and readable by its dedicated runtime UID via an owner-readable 0600 mount.
Existing loader rejects group/world-readable files; do not widen to 0644. Mount
read-only outside image, preserve compatible previous revisions securely, and
remove transient runner/SCP files on success/failure. Gateway service-secret file
or protected env injection stays separate. Do not give CI backup key/DB admin
access when it only needs release configuration. NPM publishing uses existing
OIDC and does not share OAuth keys. See auth ADRs 0005/0006 for key retention,
revocation-safe restore and least privilege.

## Verification and rollout limits

Future checks: existing auth npm run test:oauth/lint:oauth/build-client and gateway
unit/e2e/build/lint/contracts, additional real TLS/proxy/container tests, private
Mongo restore/restart, edge nginx -t, dedicated deployment dry-run and full public
client smoke. No smoke script exists for production yet; don't run today's local
runner against production, as it asserts loopback and starts local auth fixtures.
Public smoke must use disposable auth-owned account/grant and read-only owner data.
Record raw test counts and actual deployed SHAs/digests, not estimated success.
Planning verification now is source-to-plan consistency, links and diff hygiene.

No constitution amendment: ownership/contracts/security/persistence remain. This
plan records implemented production boundary changes and deferred release operations,
with regression evidence; it does not remove current local restrictions now.

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
