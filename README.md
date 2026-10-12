# NGX Workshop MCP Gateway

Local, read-only NestJS proof of concept using the official MCP TypeScript SDK.
OAuth protects all MCP requests through service-auth and the additive auth-client.
The gateway has no database or domain mutations. Deployment remains deferred.

## Run locally

Use Node 22. From this repository:

```sh
npm ci
cp .env.example .env
# Set catalog URLs and privately supply matching auth issuer/resource credentials.
npm run start:dev
```

The endpoint is `http://127.0.0.1:3011/mcp`. Both upstream services must be reachable
for successful reads. The verified local ports in `.env.example` are 3007 for document and 3009 for
coding-labs; override them for other local setups. Base URLs must use HTTP(S), without embedded
credentials, query strings or fragments. The gateway sends no incoming cookies or
tokens downstream. `PORT` defaults to 3011; the listener always binds 127.0.0.1.
Production requires the explicit, validated `RUNTIME_PROFILE=production`; local mode remains loopback-only.
OAuth is the default; missing configuration fails startup. Explicit
`MCP_LOCAL_DEV=true MCP_AUTH_MODE=local-public` enables local catalog regression
mode. See [OAuth setup](docs/development.md#local-oauth-setup).

## Tools

| Tool | Required input | Optional input | Output |
| --- | --- | --- | --- |
| `list_workshops` | `sectionId` | — | Workshop summaries |
| `get_workshop` | `sectionId`, `workshopId` | — | Metadata and ordered page/lab/assessment references |
| `get_coding_lab` | `labId` | `versionId` | Published prompt, starter code, hints and public sample tests |

Workshop tools describe the general catalog, not personalized learner eligibility.
They do not return document bodies. Lab tools use the service's redacted published
endpoint and never expose authoring models, hidden tests or reference solutions.
Inputs reject extra keys. Section/workshop IDs are nonblank strings up to 120
characters; lab/version IDs are 24-character hexadecimal ObjectIds.

All tools are annotated read-only/idempotent. Successful responses contain
`structuredContent` plus equivalent JSON text. Expected execution errors contain
`isError: true` and JSON text `{ "error": { "code", "message" } }`. Codes are
NOT_FOUND, FORBIDDEN, UPSTREAM_TIMEOUT, UPSTREAM_UNAVAILABLE,
UPSTREAM_INVALID_RESPONSE or INTERNAL_ERROR. SDK protocol/input errors are
separate from tool execution errors.

## MCP compatibility

The SDK serves 2026-07-28 Streamable HTTP and a stateless legacy 2025 handshake at
the same path. Modern requests use version/method/name headers and SDK metadata.
There are no server sessions, resources, prompts or mutation tools. Authenticated GET/DELETE
session operations return 405; unauthorized requests return 401. Use an official MCP client or Inspector with
Streamable HTTP; a plain browser GET is not tool discovery. Tests exercise both
the modern pinned client and the legacy default client.

## Verify against real local services

Start MongoDB locally, then start each owner in its supported local mode from
its own checkout (separate terminals):

```sh
# service-document
DOCUMENT_LOCAL_DEV=true NODE_ENV=development GENERATE_OPENAPI=false MONGODB_URI=mongodb://127.0.0.1:27017/document_local PORT=3007 npm start
# service-coding-labs
CODING_LABS_LOCAL_DEV=true NODE_ENV=development GENERATE_OPENAPI=false MONGODB_URI=mongodb://127.0.0.1:27017/coding_labs_local PORT=3009 HOST=127.0.0.1 npm start
```

Build service-auth and this gateway first. From this repository run:

```sh
npm run test:integration:oauth:local
```

The check uses public HTTP reads and official modern/legacy MCP clients. It
compares every local workshop and published lab, checks pinned latest versions,
public-field projection and missing/invalid inputs. It never seeds or changes
data. Existing local data must contain at least one workshop and published lab;
empty catalogs fail instead of claiming coverage. Publish local content through
the owning application if needed. Override `MCP_GATEWAY_URL`, `DOCUMENT_BASE_URL`
and `CODING_LABS_BASE_URL` explicitly to check other loopback ports. The catalog-only runner accepts `MCP_BEARER_TOKEN` privately via environment
and does not start services. The OAuth runner starts/stops isolated auth and gateway
fixtures; domain owners must already be running. AUTH_SERVICE_ROOT defaults to
the sibling service-auth checkout only for that opt-in test.

The [real-service handoff](specs/002-live-catalog-integration/handoff.md) records
the passing five-section, eleven-workshop, one-lab scan on 2026-10-12. Owner local
modes use real MongoDB and synthetic administrator context; this verifies catalog
integration. [OAuth evidence](specs/003-oauth-resource-server/handoff.md) now
adds real auth login/consent, bearer access and immediate token/grant revocation.

## Verify and contracts

```sh
npm test -- --runInBand
npm run build
npm run test:e2e -- --runInBand
npm run lint:check
npm --prefix contracts/service-mcp-gateway ci
npm --prefix contracts/service-mcp-gateway run clean
npm run contracts:service-mcp-gateway:gen
npm run contracts:service-mcp-gateway:build
```

Build generates `openapi.json` and `mcp-tools.json` from the actual tool schemas.
Run build before the e2e contract-drift test. The OpenAPI file has component schemas
and a public OAuth metadata route: it does not pretend MCP tools are HTTP CRUD endpoints.
The independent gateway package exports input/output/error types and
`mcpCatalogContract` runtime JSON Schemas. Published domain packages supply typed
upstream projections; explicit runtime validators check consumed fields.

This adoption retires `/example-crud` and its generated CRUD contracts. No
replacement package has been published ; production-readiness delivery files are now updated.
Existing release automation still reflects seed assumptions and requires a
separate deployment/release review before production use.

See [architecture](docs/architecture.md), [development](docs/development.md),
[ADRs](docs/adr/README.md), and the [feature handoff](specs/001-catalog-mcp/handoff.md).

## OAuth local acceptance

[Feature 003](specs/003-oauth-resource-server/handoff.md) is implemented locally.
The gateway serves `/.well-known/oauth-protected-resource/mcp` and validates
header bearer credentials through the official SDK and auth-client introspection.
It requires exact `catalog:read` and the configured `/mcp` audience before MCP body
parsing. Missing/invalid tokens return 401, insufficient scope 403, auth failures
503. Query tokens, cookie-only credentials and legacy JWTs are rejected. Public
metadata and OPTIONS are exceptions. There is no cached authorization.

service-auth retains legacy browser auth and owns explicit consent, PKCE and
revocation. Its CIMD registry approves exact HTTPS IDs/names/redirects and fetches
with public DNS pinning, verified TLS and bounded time/size. The local auth-client
artifact is documented in [vendor](vendor/README.md); no publishing occurred.

All three tools passed with real catalog owners in both protocol eras. Token and
browser grant revocation denied the next request. See [local setup and checks](docs/development.md).
Public deployment and external ChatGPT connectivity remain next-phase work.

## Production readiness

Production profiles, persistent secrets, MongoDB checks, hardened containers and
validation-only CI are implemented. See the [readiness runbook](docs/production-readiness.md)
and [deployment handoff](specs/004-deployment/handoff.md). Public infrastructure,
client registrations, recovery proof and rollout remain deferred. Nothing was
deployed or published.
