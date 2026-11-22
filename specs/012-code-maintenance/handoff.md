# Handoff: Code Maintenance

Status: Implemented locally; Docker/Grafana acceptance pending · Updated: 2026-11-22
[Spec](spec.md) · [Plan](plan.md) · [Tasks](tasks.md) · [Audit](audit.md)

## Completed behavior

- Split the flat root composition into explicit configuration, catalog and
  publisher feature modules with acyclic imports and minimal exports.
- Preserved all MCP/OAuth/publisher routes, exactly three read-only tools,
  validation, safe errors, owner projections and generated contracts.
- Added validated UUID request correlation through `AsyncLocalStorage`, including
  concurrent isolation and replacement of invalid inbound values.
- Added one bounded `catalog_tool_call` structured event per completed tool
  callback. Events contain operation/outcome/duration, safe error code and request
  ID when available; payloads, credentials, URLs and raw errors remain absent.
- Added Husky 9.1.7 and lint-staged 17.6.2, guarded prepare setup, staged
  TypeScript Prettier, explicit generated/vendor ignores, `format:check`,
  disposable hook acceptance and CI gates.
- Kept the supported formatting baseline to source/test TypeScript. A broad probe
  found 53 pre-existing historical Markdown/generated violations; none were
  reformatted incidentally.

No consumer contract, persistence, access policy, migration, publication or
deployment change is required.

## Verification evidence

| Check | Result |
| --- | --- |
| `npm test -- --runInBand` | PASS: 8 suites, 56 tests |
| `npm run build` | PASS; generated OpenAPI/MCP output |
| `npm run test:e2e -- --runInBand` | PASS: 4 suites, 52 tests |
| `npm run lint:check` | PASS |
| `npm run format:check` | PASS |
| `npm run test:formatting-workflow` | PASS: staged formatting, independent partial-stage restoration, failing hook block and negative format check |
| Clean developer/Git `npm ci` | PASS; `.husky/_` configured |
| Package-only/no-Git `npm ci` | PASS; guarded prepare skipped |
| Git + source `npm ci --omit=dev` | PASS; Husky absent and prepare safe |
| `npx --yes npm@10.9.9 ci --ignore-scripts --dry-run` | PASS; preserved Node 22 optional webpack tree |
| `npm audit --omit=dev --audit-level=high` | PASS gate; one moderate `@hono/node-server` advisory remains |
| Delivery script tests | PASS: 5 Node publication, 6 deployment and 3 cleanup tests |
| Contract install/generation/build | PASS; generated artifact no-diff check passed |
| `docker build --tag service-mcp-gateway:maintenance-check .` | BLOCKED: local Docker daemon unavailable |
| Live Grafana query | PENDING: external infrastructure authorization/receipt |

The local shell was Node 24.9.0/npm 11.6.0 rather than the repository's Node
22.23.5 target. The lockfile was therefore regenerated with npm 10.9.9 and its
cross-platform dry-run passed. Install commands retained existing peer-resolution
warnings and moderate audit findings; no broad dependency upgrade was attempted.

## Remaining work and exact next action

With a Docker daemon available, run:

```sh
docker build --tag service-mcp-gateway:maintenance-check .
docker run --rm --entrypoint node service-mcp-gateway:maintenance-check \
  -e 'require("fs").accessSync("dist/main.js"); require("@tmdjr/ngx-auth-client")'
```

Then the infrastructure owner should deploy through the existing validated
workflow and confirm one `catalog_tool_call` event in Grafana using a known safe
request UUID. Confirm the actual collector-flattened fields before finalizing
query examples. Do not add Grafana credentials to this application.
