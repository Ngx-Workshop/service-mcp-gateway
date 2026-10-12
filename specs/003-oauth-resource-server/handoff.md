# Handoff: local OAuth integration
Status: Complete for local scope · 2026-10-12 · Node 22.23.3
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)
Interfaces: [contracts.md](contracts.md)

## Delivered behavior

service-auth owns real login/consent, S256 code exchange, resource-bound opaque
600-second tokens, encrypted transactional Mongo storage, introspection and token/
grant revocation. Hardened CIMD supports explicitly approved HTTPS IDs and exact
approved names/redirects/capabilities. Fetch validates all DNS answers as public,
pins one address for TLS, enforces 3 seconds/64 KiB and disables redirects,
connection reuse, ambient proxies and credentials. Empty metadata registry disables
CIMD advertising. No public dynamic registration or refresh grant.

@tmdjr/ngx-auth-client adds immutable OAuthPrincipal, typed introspection and
sanitized errors; legacy exports remain. Gateway consumes checked-in version
0.0.22-local.0 with lockfile integrity, without sibling runtime dependencies or
publication. AuthInfo retains distinct subject/client ID per request. Every /mcp
method authenticates before body parsing; missing/invalid bearer gives 401,
missing exact catalog:read gives 403, auth outage/malformed trusted response gives
503. Header-only credentials, no cookie fallback/query tokens or authorization
cache. Public metadata/preflight are exceptions. Local-public requires explicit
MCP_LOCAL_DEV=true/MCP_AUTH_MODE=local-public. OAuth is default and missing config
fails startup. Loopback binding, Host/Origin checks and production rejection remain.
Tool contracts and owner read projections stay unchanged; credentials never reach
catalog owners.

## Verification

| Repository | Command | Result |
| --- | --- | --- |
| service-auth | npm run test:oauth | 64 passing: 23 real app/storage/CIMD, 14 additive-client, 27 metadata fetch cases; zero skipped |
| service-auth | npm run lint:oauth; npx eslint libs/ngx-auth-client/src/oauth-introspection.ts | Passed |
| service-auth | npm run build; npm run build:ngx-auth-client | Passed (also executed by test:oauth) |
| gateway | npm test -- --runInBand | 40 passed, including overlapping distinct users/clients |
| gateway | npm run test:e2e -- --runInBand | 31 passed, modern/legacy authenticated tools, owner header capture and original protocol regressions |
| gateway | npm run build; npm run lint:check | Passed |
| gateway | npm run contracts:service-mcp-gateway:gen; npm run contracts:service-mcp-gateway:build | Passed; typed protected-resource metadata plus unchanged tool definitions |
| gateway | npm run test:integration:oauth:local | Passed with real auth and real document/labs owners |

Real integration exercised login→explicit consent→S256 code/token→discovery and
all three tools under both modern 2026-07-28 and legacy clients. All five sections,
eleven workshops and one published lab (latest pinned version 2) matched owner
public reads. Negative IDs/versions/inputs, text/structured equivalence and public
field projections passed. Token endpoint revocation denied the next POST/GET/
DELETE; browser grant revocation denied the next protected request. Closing auth
caused sanitized 503, with no fallback. The harness seeded one account only in its
own temporary auth replica set via sign-up, removed it, and closed owned apps.
Owners ran their supported local modes against existing MongoDB; no owner data or
source was changed. Test-started owner listeners were stopped; shared mongod was
left intact.

Acceptance AC-001–009 is supported collectively by the owner application,
client, gateway and real flow suites, not by one test alone. CIMD uses native
HTTPS and certificate validation with a controlled test CA and test-only socket
routing; DNS/private/rebinding checks use controlled answers. An untrusted cert
is rejected. No runtime switch allows private addresses or unverified TLS. This
proves the integration/security seams locally, not reachability of an external
metadata host or hosted ChatGPT. Dependency audit backlogs remain: auth 99,
gateway 46; no unrelated audit-fix or clean-audit claim.

## Reproduce and next phase

Follow [development](../../docs/development.md) for configuration and live setup.
Run owners first; build auth and gateway; run the OAuth runner from gateway.
AUTH_SERVICE_ROOT may locate the auth owner checkout; only this opt-in live test
requires it. Runtime and regular gateway tests use the versioned local artifact.
No raw secrets or tokens are printed or committed. Deployment, public issuer/
resource/callback registration, proxies/CORS/host policy, production Mongo,
credential/key operations, traffic limits, monitoring and publication remain
separate work. No commit, publish, push, deployment or external client connection.
