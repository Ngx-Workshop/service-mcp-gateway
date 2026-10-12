# OAuth implementation plan
Status: Engine spike complete; ready for runtime implementation
Updated: 2026-10-12
Spec: [spec.md](spec.md) · Evidence: [research.md](research.md) · Interfaces: [contracts.md](contracts.md)

## Architecture and sequence

MCP client → gateway bearer challenge/public metadata → service-auth discovery →
auth-owned login and consent → authorization code with S256 → auth token endpoint →
client bearer request → auth-client introspection → SDK resource gate → unchanged
catalog tools → public document/coding-labs APIs.

1. **Auth engine spike (FR-001, 007–010; completed):** isolated owner spike recommends oidc-provider 9.12.2 (MIT), with 30 passing cases on Node 22.23.3 and real Nest/HTTP/MongoDB. See owner `docs/adr/0001-oauth-engine.md`; T001 establishes native engine and profile/adapter hooks, not full identity or metadata-fetch security. Atomic consumption/issuance requires MongoDB replica-set transactions and commit-before-response middleware. Original selection criteria: choose a maintained server engine with extension points for existing identity, PKCE, RFC 8707 resources, metadata clients, introspection/revocation and durable owner storage. Record library/version/license and conformance evidence in an auth-owner ADR. Test required hooks before building controllers. The installed MCP v2 SDK does not implement an AS; frozen legacy SDK AS helpers and a hand-written OAuth protocol are not the planned engine. If no engine satisfies the profile, revise this plan around a standards-capable provider integrated with service-auth identity; do not silently build an incomplete issuer.
2. **Auth owner implementation (FR-001–002, 007–009):** introduce src/oauth module/controllers and engine adapter; refactor credential verification from AuthenticationService while retaining sign-in/signup/cookie/metadata behavior. Add a minimal auth-owned browser login/consent page with explicit client, scope and resource, CSRF protection and no frame embedding. Existing cookie authentication may identify the user, but must not bypass consent. Add authorization transaction/code/grant/token records in auth-owned storage; no gateway database. Seed only explicit isolated test users/clients via owner test setup. Add local auth loopback/test-DB safeguards, bounded endpoints, token issuance/introspection/revocation and grant management. No schema changes to existing users required.
3. **Auth client additive API (FR-004–006, 010–011):** libs/ngx-auth-client/src/oauth-introspection.client.ts and oauth-principal.ts with strict runtime projection and configurable HTTP client. Keep legacy API/tests; export new Nest provider via an explicit register/config API, with no default production auth URL. Package must not depend on MCP SDK. Introspect only configured issuer URL with separate service credentials and bounded response; do not forward cookies. Invalid credentials for the resource-server connection are auth_unavailable, not user invalid_token. Invalid trusted response is invalid_auth_response. No retries or caching initially, so revocation is visible on the next request.
4. **Gateway integration (FR-002–006, 010–011):** planned src/auth module/config, oauth-verifier adapter, bearer middleware and public metadata controller. src/bootstrap.ts keeps localBoundary before OAuth and SDK parsing; public metadata/OPTIONS explicitly routed. Supported /mcp requests go through bearer auth before toNodeHandler; unsupported GET/DELETE stay 405. Middleware supplies verified req.auth for the existing Node bridge. Use SDK requireBearerAuth/expectedResource with configured resourceMetadataUrl and requiredScopes=[catalog:read]. A wrapper maps typed auth-service outage/malformed responses to sanitized 503 before SDK generic errors turn them into 500. Prove this mapping with installed SDK; invalid tokens use SDK OAuthError.InvalidToken, insufficient scopes use SDK 403 challenges. No Nest default 401 body or tool isError substitution. Protect initialization/discovery as well as tools; no global legacy auth guards. Do not alter catalog schemas/adapters.
5. **Local acceptance (FR-012):** test official modern and legacy clients with real auth issuer and real feature 002 owner services; authorize a real isolated local user and compare all available catalog records. Use an ephemeral callback receiver owned by the test client and a real browser login/consent step, not a synthetic token generator or production account. Fixture setup is restricted to auth-owned isolated test DB/API; never touch existing local catalog records. Revoke grant and confirm next request is denied; capture downstream headers to prove no forwarding. Report any protocol/client limitation with exact evidence.

## OAuth engine/storage responsibilities

Auth owns registered clients, metadata-client approval policy, consent transactions,
one-time code records, client/resource/subject/scope grants, hashed token records
and introspection credentials. Use separate collections/models and explicit TTL
checks; atomic redemption/issuance and revocation must work with the chosen local
Mongo topology. If transactions require a replica set, setup belongs to isolated
auth test infrastructure, not changes to existing catalog databases. Select/test
storage support in the engine spike before finalizing model migrations.

Scopes are exact tokens, not substring/role checks. Approval is per user and
client/resource; denial issues no code. Initial access TTL 600 seconds, code TTL
60 seconds, transaction TTL 600 seconds; no refresh tokens. A login session alone
is not permission to mint arbitrary clients' tokens. Explicit grant revocation
invalidates associated tokens, independent of legacy sign-out behavior.

Preregister a public local official-client fixture with S256 and exact callback;
confidential clients require registered authentication. Add allowlisted metadata
clients with HTTPS only, 3-second/64-KiB fetch limits, content validation, no
redirects, DNS/address pinning against private/reserved IPv4/IPv6 and no ambient
proxy. Bind fetched client_id/redirect metadata to consent transaction to prevent
TOCTOU changes. No DCR or metadata fetch from unknown unapproved hosts. Callback
localhost is supported for preregistered local fixtures; no wildcard production
redirects. Do not advertise metadata-client support before AC-007 passes.

## File map and ownership

| Repository | Planned areas | Ordering / contract |
| --- | --- | --- |
| service-auth | src/oauth/**, src/iam/authentication/authentication.service.ts, src/app.module.ts, src/main.ts, owner specs/tests | Own engine, routes/storage/browser UI/local mode; deliver interfaces in contracts.md before consumer live acceptance |
| service-auth / package | libs/ngx-auth-client/src/oauth-*.ts, index.ts, module config API, package tests/README | Additive typed principal/errors; build and local consumer proof before gateway pin/runtime dependency |
| service-mcp-gateway | src/auth/**, src/bootstrap.ts, src/app.module.ts, src/mcp/catalog.config.ts, src/mcp/mcp.controller.ts, package manifests | SDK gate and request context; explicit local-public test mode and oauth default; preserve loopback/prod rejection |
| service-mcp-gateway tests | test/oauth.e2e-spec.ts, test/oauth-local.integration.ts, test/live-catalog.integration.ts, existing e2e/config tests | Isolated verifier tests then real issuance and three-tool regression; no deployed callback requirement |
| service-document / service-coding-labs | No source or package change | Continue public HTTP reads and existing domain contracts |

These runtime integration paths remain planned. The isolated engine spike now
exists under service-auth/spikes/oauth-engine with an owner spec and ADR; it is
not mounted in the application. Owner integration handoff resides here. Future implementation must create owner-local
specs/ADRs rather than treat gateway docs as a replacement for owner governance.
Use local package build/pack/install to verify the new auth-client exports before
publication; never claim current 0.0.21 has them. Package version and release
ordering are recorded after producer compatibility tests; no guessed version.

## Verification strategy

| Layer | Required evidence |
| --- | --- |
| Auth engine/owner | Real identity verification and consent; strict client/redirect/resource/scope; S256; atomic replay and expiry tests; introspection service authentication/audience restriction; revoke and unchanged legacy browser flows |
| Auth-client | Trusted schema/issuer/audience/expiry/token-use checks; distinct user/client; timeout/size/status/malformed response; no redirects/cookie fallback/default role/claim merge; old consumer API regression |
| Gateway HTTP | 401/403 challenge syntax and metadata discovery, 503 infrastructure errors, no body/tool/owner processing before denial; cookie/query/duplicate-header rejection; unsupported methods/preflight; Host/Origin/production rules |
| Request concurrency | Separate users/clients and scopes; revoked grant immediately denied; no singleton mutable principal or logging tokens |
| MCP protocol | Existing modern/legacy clients, same exact three tools and payloads, authenticated discovery, text/structured agreement, original adapter limits/error behavior |
| Real local chain | Real auth→gateway→document/labs with nonempty catalogs; existing auth-owned test account and explicit consent/code exchange; pinned lab version, errors and no downstream credentials |
| Build/contracts | Strict builds and typed lint in changed repos; library package export/local consumer import; regenerate actual changed HTTP/package schemas from owner source; unchanged MCP discovery payloads |

Test commands for gateway remain npm test -- --runInBand, npm run build,
npm run test:e2e -- --runInBand and npm run lint:check. Planned real OAuth command:
npm run test:integration:oauth:local (implemented). Auth owner uses its package
build/test/e2e scripts; do not run mutating lint to prove compatibility. Record
actual nonempty tests, real owner behavior and skipped cases separately. Source
inspection and this plan do not satisfy any runtime OAuth acceptance scenario.

## Constitution and rollout boundary

Ownership: auth owns identities/tokens, gateway owns protected transport and tools.
Contract: new OAuth endpoints are separate from legacy cookies and MCP payloads;
auth producer delivers first. Authorization: explicit bearer/scope gate with real
negative cases; roles never imply scopes. Persistence: auth-only records and
isolated tests, no foreign DB access. Context: research, ADRs, interfaces and
completed implementation tasks remain local. No constitution amendment required.

OAuth mode changes unauthenticated local /mcp access: provide explicit
local-public for existing test doubles only, no implicit fallback or production
bypass. Update original integration runner for bearer injection without logging.
Keep production rejection, loopback listener, Docker/Nginx/Actions and deployment
settings untouched throughout this phase. New metadata/routes need bounded
parsing and explicit preflight headers but no permissive credentialed CORS.
Future deployment decides real HTTPS issuer/resource/callbacks, host/origin/CORS
allowlists, secret management, traffic limits/monitoring, proxy behavior and key or
credential rotation operations. No external ChatGPT connection is claimed by a
local success alone.

Implementation and command evidence: [handoff](handoff.md). Producer-owned
local tarball consumption avoids requiring sibling source for normal gateway use.
The opt-in real OAuth test deliberately starts the producer from AUTH_SERVICE_ROOT.
