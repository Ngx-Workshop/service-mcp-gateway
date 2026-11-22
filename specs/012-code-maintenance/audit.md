# Code Maintenance audit

Audited: 2026-11-22 · HEAD: `2aa2dc2` · Scope: service-mcp-gateway

## Baseline

The worktree already contained the prepared feature records and Copilot
instructions. They were retained as authorized maintenance setup work.

| Check | Result |
| --- | --- |
| `node --version`; `npm --version`; `git --version` | Local shell: Node 24.9.0, npm 11.6.0, Git 2.54.0. The repository target remains Node 22.23.5. |
| `npm test -- --runInBand` | Baseline pass: 8 suites, 55 tests. |
| `npm run build` | Baseline pass; OpenAPI/MCP generation completed. |
| `npm run test:e2e -- --runInBand` | Baseline pass: 4 suites, 51 tests. |
| `npm run lint:check` | Baseline pass. |
| `npx --no-install prettier --check "src/**/*.ts" "test/**/*.ts"` | Baseline pass. |
| Broad Prettier probe over source, scripts, root files, docs and specs | Failed on 53 pre-existing files, mostly historical Markdown plus generated `openapi.json`/`mcp-tools.json`. No blanket rewrite was selected. |

## Dependency and responsibility map

- `src/app.module.ts` was a flat composition root containing all catalog,
  OAuth metadata and publishing controllers plus catalog providers and shared
  HTTP/configuration dependencies.
- `src/mcp/mcp.controller.ts` owns MCP transport setup, OAuth gating and SDK
  handler shutdown. It delegates tool behavior to `CatalogToolsService`.
- `src/tools/catalog-tools.service.ts` owns the exactly-three-tool registration,
  Observable/Promise boundary, output validation and safe tool result mapping.
- `src/clients/catalog.client.ts` is the read-only external adapter. It owns
  bounded HTTP calls, runtime validation and public projections. There is no
  persistence provider in this repository.
- `src/auth/oauth-metadata.controller.ts` projects validated configuration only.
  `src/auth/oauth-gate.ts` owns request authorization and does not forward bearer
  credentials to catalog owners.
- `src/publisher/publishing-proxy.controller.ts` is an opaque compatibility
  transport. Its bounded body/header/status forwarding is HTTP-specific rather
  than domain logic; extracting an otherwise single-use service was not justified.
- `src/observability/observability.module.ts` owned health only.
  `src/observability/observability.ts` emitted safe HTTP events but generated an
  ID without propagating it to asynchronous domain work.

No circular dependency, duplicate provider registration, database access,
service locator, `forwardRef`, accidental global feature module or persisted
schema exists. Controllers retain transport metadata and delegation. Configuration
and runtime input are Zod-validated; safe error projections already prevent raw
upstream responses from escaping. SDK handler/application shutdown and bounded
HTTP timeouts are explicit.

## Findings and selected changes

| Priority | Finding | Decision |
| --- | --- | --- |
| High | `src/app.module.ts` directly owned three distinct feature boundaries and their providers. | Added explicit configuration, catalog and publisher modules. The root now composes modules only; exports remain minimal and dependency flow is acyclic. |
| High | No staged formatting hook or CI `format:check` existed. | Added pinned Husky/lint-staged, guarded prepare behavior, generated/vendor ignores, a disposable partial-staging acceptance check and a CI formatting gate. |
| High | HTTP request IDs were not available to tool callbacks and no stable catalog use-case event existed. | Added singleton `AsyncLocalStorage` request context, validated UUID propagation and one bounded `catalog_tool_call` outcome event per tool execution. |
| Medium | The publisher controller is long. | Retained because its logic is cohesive opaque HTTP forwarding with no reusable business use case. Existing publisher e2e coverage characterizes status/header/body behavior. |
| Medium | `OAuthGate` is constructed by `McpController` rather than injected. | Retained: it is a config-only transport guard coupled to the SDK handler lifecycle. A provider abstraction would add no alternate implementation or reuse. |
| Low | `ConfigModule` is global although feature configuration uses an explicit token. | Retained to preserve existing bootstrap behavior; new feature dependencies use explicit module imports and token exports. |

## Compatibility and constitution check

Routes, tool schemas, authorization, safe errors, upstream protocols, publisher
forwarding and generated contracts are unchanged. No data model or migration
exists. The refactor preserves the bounded gateway domain, explicit HTTP/MCP
contracts, boundary authorization, predictable owner reads, local verification
and repository-local handoff required by the constitution.

## Final evidence

- Unit: 8 suites, 56 tests passed.
- E2E: 4 suites, 52 tests passed.
- Build, typed lint and supported-scope `format:check`: passed.
- Formatting workflow: staged formatting, independent partial-stage restoration,
  hook failure blocking and negative format gate passed in disposable Git fixtures.
- Install lifecycle: clean developer/Git, package-only/no-Git and
  production/`--omit=dev` installs passed. npm 10.9.9 lock dry-run passed.
- Delivery scripts: 5 Node publication tests, 6 deployment tests and 3 cleanup
  tests passed.
- Production audit gate passed with one existing moderate
  `@hono/node-server` advisory; no high finding.
- Contract install/generation/build passed with no generated artifact diff.
- Docker image build was attempted and blocked because the local Docker daemon
  was unavailable. Live Grafana receipt remains an external infrastructure check.
