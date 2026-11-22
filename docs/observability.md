# Service logging and heartbeat

This service uses native NestJS 11 `ConsoleLogger` JSON output to stdout/stderr, with `Logger` context for application events. No Angular logger or application-held Grafana credential is used. HTTP logs contain request ID, method, route template, status and duration; bodies, cookies, authorization headers, concrete identifiers and query strings are not logged by the middleware. A valid UUID `X-Request-ID` is accepted; invalid, duplicate or unbounded values are replaced with a generated UUID. Health polling is excluded from access logs. Avoid embedding secrets or personal search text in domain log messages.

The request ID is propagated through a singleton `AsyncLocalStorage` context.
Concurrent-request isolation is covered locally. `CatalogToolsService` emits one
`catalog_tool_call` object per completed tool callback with stable `operation`,
`outcome`, bounded `durationMs`, optional `requestId` and safe `errorCode`.
Expected not-found/forbidden outcomes use warning level; unavailable, timeout,
invalid-response and internal failures use error level. Input IDs, tool payloads,
owner URLs, response bodies and raw errors are omitted. This provides in-process
correlation only: the gateway does not emit trace/span IDs or forward request IDs
to owner services.

Nest JSON places these fields under the structured `message` object with context
`CatalogToolsService`. After collector JSON parsing, a representative Loki query
is `{service_name="service-mcp-gateway"} | json | message_event="catalog_tool_call"`.
Filter a known safe request UUID with `message_requestId="<uuid>"`; exact flattened
field names must be confirmed against the infrastructure owner's active pipeline.

`GET /health` and HEAD return the anonymous operational Terminus heartbeat with `status: ok` and `heartbeat: up`, plus `Cache-Control: no-store`. This is liveness only; it does not claim MongoDB or upstream readiness. Existing business-route authentication remains enforced. The gateway's exact read-only heartbeat is the only exception to its normalized proxy-envelope requirement. The operational endpoint is excluded from business Swagger/contracts where that service generates them.

Docker probes `/health` every 30 seconds. Deployments bound each container's local JSON log files to 10 MiB × 3. Host Alloy discovers active service names and ships logs and private HTTP heartbeat probe metrics to Grafana Cloud stack `ivorytoffee195`. Collector configuration/dashboard lives in infrastructure owner `nginx-ngx-workshop.io/ops/grafana`; its ingestion token remains host-owned, scoped to logs/metrics write, and requires account authorization before activation. No production credential belongs in this repository.

Validation on 2026-11-21: the isolated observability HTTP suite passed (5 scenarios), build passed, Linux-targeted lockfile dry run passed. Guarded services additionally passed the anonymous-heartbeat/protected-business-route HTTP test. Gateway production ingress e2e passed (51 scenarios), including exact-path/method heartbeat boundaries. Gateway and publisher lint passed. Full existing unit suites passed except Backstage's unchanged Octokit ESM test-loader failure, reproduced on its pre-change HEAD. Uploader tests pass under its documented `npm test` command; its 10 optional cases remain skipped. Publisher persistence e2e cases require the isolated Mongo URI and remain skipped when unavailable. These are local checks, not evidence of Grafana ingestion or live deployment.

Gateway maintenance validation on 2026-11-22 passed 6 isolated observability
scenarios and 52 gateway protocol scenarios, including safe domain success/failure
events, canary redaction and concurrent request-context isolation. Live Grafana
receipt remains pending with the infrastructure owner; local JSON assertions and
collector-compatible field shape are not a receipt claim.

CI follow-up: Node 22 ships npm 10.9.9, whose optional peer resolver requires the nested webpack entry omitted by this Mac's npm 11. Regenerated the lock with npm 10.9.9; its Linux clean-install dry run passes. No runtime dependency or bundler setting changed.
