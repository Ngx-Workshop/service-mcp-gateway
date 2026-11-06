# Development and verification

Updated: 2026-10-12. Use Node 22 and committed lockfiles.

## Local startup

`npm ci`, copy `.env.example` to `.env`, configure actual DOCUMENT_BASE_URL and
CODING_LABS_BASE_URL, then `npm run start:dev`. See [README](../README.md).
OAuth mode requires the existing auth issuer, but the gateway has no MongoDB.
Explicit local-public mode permits catalog regression testing without auth. Bind address is fixed to 127.0.0.1 and
production mode is rejected. Base URLs are operator configuration, never tool
arguments; no client headers are forwarded.

## Checks

| Check | Command | Evidence |
| --- | --- | --- |
| Unit and adapter HTTP | npm test -- --runInBand | Schemas/config/error mappings and disposable HTTP owner responses |
| Strict application build and generation | npm run build | Type checks, OpenAPI components and mcp-tools.json |
| Protocol e2e | npm run test:e2e -- --runInBand | Actual Nest socket and official modern/legacy MCP client |
| Real local owners (opt-in) | npm run test:integration:local | All existing records through real MongoDB-backed owners and both MCP clients; see [setup/evidence](../specs/002-live-catalog-integration/handoff.md) |
| Non-mutating lint | npm run lint:check | Typed ESLint and formatting |
| Formatting | npm run format | Modifies source/test files |
| Contract generation/build | npm run contracts:service-mcp-gateway:gen; npm run contracts:service-mcp-gateway:build | Generated independent models and runtime schemas |

Run build before protocol e2e: it compares committed generated artifacts to actual
discovery. A no-tests exit is not a pass. The old Hello World e2e scaffold was
replaced. Test HTTP servers use ephemeral localhost ports and close connections
and timers; no external database/network services are required. One adapter test
waits for the real 5-second timeout. These doubles do not prove live service
compatibility or production connectivity.

## Regeneration

1. Change source MCP schemas/handlers, with behavior tests.
2. Run `npm run build` (postbuild writes openapi.json and mcp-tools.json).
3. Install package tooling via `npm --prefix contracts/service-mcp-gateway ci`.
4. Run `npm --prefix contracts/service-mcp-gateway run clean`, then root contract
   generation/build scripts.
5. Check generated differences and consumer impact. Run package dry-runs from the contracts directory (npm pack --dry-run), since
`npm --prefix ... pack` can select the service root. The package exports types
   through generated components aliases and runtime `mcpCatalogContract` through
   generated TypeScript; JSON import attributes are not needed at runtime.

The inherited GENERATE_OPENAPI flag remains accepted in existing automation, but
no longer changes persistence/auth behavior: those modules are absent. Generation
uses explicit illustrative upstream URLs if none are configured and performs no
upstream requests. MCP is intentionally absent from OpenAPI paths because a
JSON-RPC tool is not a REST operation.

## Limits and remaining phase work

Real local owner integration passed; see the [handoff](../specs/002-live-catalog-integration/handoff.md).
OAuth and deployment are implemented; private ChatGPT linking, distributed rate limiting and an audit backend remain open. Legacy support is stateless; clients requiring sessions or standalone
GET SSE streams are unsupported. Results over the documented limits are rejected;
producer pagination is needed before supporting large catalogs. JSON sample-test
inputs/expected values are service-owned opaque data, not executable code.

Contracts 1.0.0 and auth-client 0.0.66 are published; reviewed CI images and Nginx are deployed. Main now automatically validates, publishes contracts and deploys; see [automatic delivery](automatic-delivery.md). See [launch evidence](production-execution-2026-10-12.md).
Dependency-install audit findings are recorded in the handoff; no broad npm
upgrade/audit-fix was attempted as part of this feature.

## Local OAuth setup

Use Node 22. In service-auth follow its `docs/oauth-local.md`: generate an ignored
private config once, use an initialized writable local replica set, preserve
persistent keys, enable OAUTH_ENABLED/OAUTH_LOCAL_DEV and start the issuer.
Issuer/resource/port and redirects must match that config exactly. Existing auth
accounts sign in through the auth-owned browser interaction, then explicitly
consent to catalog:read. Exchange the S256 code for an opaque 600-second token.

Gateway `.env.example` defaults to local OAuth. Privately set
AUTH_INTROSPECTION_CLIENT_SECRET and matching ID from auth's resourceClient.
Do not place the user's bearer token in this config or forward it to domain
owners. Missing values fail startup; local-public is explicit only. The public
metadata path returns 404 in local-public mode. All listeners remain loopback and
production mode is rejected.

## Real OAuth acceptance

Start real document/coding-labs owners using README local modes and existing
nonempty catalogs. Build the auth owner (`npm run build` and
`npm run build:ngx-auth-client`) and gateway (`npm run build`), then from gateway:

```sh
npm run test:integration:oauth:local
```

The test uses AUTH_SERVICE_ROOT (default ../service-auth), a temporary private
config and its own MongoDB replica set/account. It uses real login/consent/S256,
all three tools with both official clients and real owner REST reads, then token
and browser grant revocation and an auth outage. It closes owned apps/MongoDB and
removes temporary keys/data; it does not seed/change catalog data or reconfigure
shared MongoDB. The auth owner requires mongod on PATH (or OAUTH_SPIKE_MONGOD).
Only the opt-in live test requires the owner checkout. The versioned auth-client
tarball is sufficient for normal gateway runtime/build/tests.

For a separately running OAuth gateway, `test:integration:local` accepts a bearer
via MCP_BEARER_TOKEN environment; never pass it on command-line or print it.
[Feature 003 handoff](../specs/003-oauth-resource-server/handoff.md) records exact
passed counts and fixture limits. No external hosted-client or deployment claim.

## Deployment planning

The [deployment plan](../specs/004-deployment/handoff.md) now records existing infrastructure/CI reuse,
public HTTPS and client identities, secrets/Mongo ownership, production runtime
changes, verification and rollback gates. Planning is complete; implementation
and deployment remain pending. Current loopback restrictions and delivery assets
are unchanged. Proposed domains and live infrastructure state require verification
before later release work.

## Workshop publishing
See [configuration and recovery](workshop-publishing.md). The normal test suite includes publishing tests; protocol e2e includes the separate admin endpoint. Tests use doubles and temporary receipts, never real workshops or paid model calls.

## Preparation verification — 2026-11-05

Normal tests cover skills supplied to actual request instructions, private progress,
objective/runner checks, bounded repair, constant-output review, stale hashes and
receipt recovery. Protocol e2e covers start/get through the official MCP client and
foreign-subject denial. Build must copy all four SKILL.md assets into dist/publishing/
skills; Docker copies dist. Run npm run build, tests, protocol e2e, lint:check and
contract generation/build after changes. Frontend uses the generated 1.3.0 contract
tarball; no registry publication or deployment is implied by local generation.

## Deployment audit correction — 2026-11-05

Run 42142147627 failed before build/image/publication/deployment at
`npm audit --omit=dev --audit-level=high`. The refreshed lock resolved Multer 2.4.0
under @nestjs/platform-express 11.2.8; GHSA-q7qp-rjg7-q26m is patched in 2.5.0.
A scoped @nestjs/platform-express → multer 2.5.0 override keeps the Nest major and
all delivery/security gates intact. Only that transitive lock entry changed.
Clean `npm ci --ignore-scripts` and the exact production audit command pass; the
remaining moderate @hono/node-server advisory is outside this high-severity gate.
No major Hono/MCP or Nest upgrade was introduced. See the preparation handoff for
validation evidence. This dependency correction does not itself push or deploy.

Clean-install validation also exposed sanitize-html 2.18.1 → htmlparser2 12's ESM
parser tree, which Jest 29 had skipped transforming. Both unit and protocol Jest
configs now enable JavaScript transformation only for the six parser-tree packages;
runtime dependencies and sanitizer behavior were not downgraded or mocked away.
Final local validation passes on Node 22.23.3: clean install, production audit gate,
strict build, 95 unit tests, 44 protocol tests, 5 publication-workflow tests, 5
Python deployment tests, lint, contract generation/build and the exact generated-
artifact no-diff gate. No workflow rerun, commit, push, publication or deployment
was performed; the fixed commit must reach main before the release can use it.

## AI publisher extraction — 2026-11-06

Publishing implementation, generation, preparation checks, skills and receipts now
belong to service-ai-publisher (port 3014). This gateway retains only bounded forwarding
for /publisher/tools and /mcp/publishing; configure PUBLISHING_ENABLED=true and
AI_PUBLISHER_BASE_URL=http://service-ai-publisher:3014. It no longer needs model
credentials, authoring-owner URLs or journal storage. Catalog OAuth/ingress is unchanged.
Gateway contracts preserve existing authoring exports using a packaged publisher
contract snapshot. Historical publishing deployment instructions above describe the
pre-extraction system. See specs/009-publisher-migration/handoff.md for current rollout.
