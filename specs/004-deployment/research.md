# Deployment inventory and gaps
Updated: 2026-10-12. Read-only checkout inspection; no live infrastructure probe.

Historical source inventory below predates readiness implementation. Current live
evidence and release blockers: [preflight](../../docs/deployment-preflight-2026-10-12.md).

## Existing assets to reuse

| Asset | Checkout evidence | Planning consequence |
| --- | --- | --- |
| App droplet and Docker | `.github/workflows/deploy.yml`, `Dockerfile`, `docker-compose.yml` | Keep `/opt/ngx-nestjs-services/service-mcp-gateway`, container service-mcp-gateway, port 3011 and ngx-net; no Kubernetes or new hosting platform |
| Auth service | service-auth workflow/Dockerfile | Existing ngx-auth-service at port 3000, same app deployment pattern; preserve legacy consumers |
| Public edge | nginx-ngx-workshop.io `docker/nginx.conf` and workflow | Dedicated edge droplet proxies to application VPC address 10.116.0.4; existing read-only Let's Encrypt mounts under `/etc/letsencrypt/live/ngx-workshop.io/` |
| Auth hostname | Nginx host maps/static mounts | auth.ngx-workshop.io already serves an authentication SPA and `/api/auth/` routes; add exact native OAuth/discovery paths without taking over `/` |
| Current MCP route | Nginx `/api/mcp-gateway` location and `.ngx-workshop/nginx.conf.example` | Rewrite leaves `/mcp-gateway/...`, incompatible with native `/mcp`; do not use it as canonical MCP URL |
| Database | service-uploader `docs/deployment-2026-10-04.md`; auth workflow | Documentation records authenticated MongoDB 8.0.17 on 10.116.0.2:27017, database/authSource workshop-viewer and single-member rs0; reverify live before any use |
| CI/CD | Both service workflows | main push/manual dispatch → npm OIDC publish → pinned SSH/SCP source transfer → host Docker build → recreation and TCP probe; no test gate, protected environment or automatic application rollback in these two service workflows |
| Related CLI | cli-ngx-workshop-node template | Gateway-triggered service dispatch exists as a template, not the installed auth/MCP workflows; don't assume it controls these releases |

## Runtime blockers (not configuration-only work)

Gateway `src/mcp/catalog.config.ts`, `src/auth/oauth.config.ts`, bootstrap and
local-boundary reject production, require local flags, bind loopback, require HTTP
loopback issuer/resource and compare public resource port to listener port.
Auth config/bootstrap/provider restrict OAuth to local issuer/database and
provider Host checks use public issuer. `grants.mjs` explicitly uses secure:false;
provider proxy trust and secure cookies require production tests. Login throttling
keys on socket address, which collapses all edge users behind a proxy.
The additive client supports HTTPS but currently requires introspection at the
issuer origin; use the public canonical HTTPS endpoint rather than inventing a
private endpoint override or disabling TLS checks.

Gateway Dockerfile runs npm ci before copying vendor; the local file dependency
will be absent in that layer. Auth `.dockerignore` excludes env files but not
`.oauth-local/`, so a manual local build could bake private config into an image.
Runtime OAuth key/config mounts are absent from both deployment workflows.
Gateway workflow still demands MONGODB_URI/AUTH_BASE_URL, despite having no DB and
now requiring catalog/OAuth settings. Auth workflow URI validation forces a shared
workshop DB credential and doesn't require replicaSet or planned auth-specific user.
Auth compose filename has a trailing space (`docker-compose.yml `); normalize in
implementation without assuming that file runs today's workflow (it uses docker run).

Source HEADs are historical baselines, with authorized uncommitted OAuth work:
auth f09e24655f4df07e07b3d722a578732da5bb8351; Nginx
7fccfb60803c91af41e4737d6b4119f1a58d7d47. Working source, not HEAD alone, was inspected.
Local OAuth evidence is [feature 003](../003-oauth-resource-server/handoff.md).

## Verified primary references

Reviewed 2026-10-12; no client callback or certificate inventory was obtained.

- [MCP authorization](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/index.mdx): discovery, resource binding and registration boundary.
- [oidc-provider v9.12.2 configuration](https://github.com/panva/node-oidc-provider/blob/v9.12.2/docs/README.md): pinned engine reference; production proxy/cookie behavior must be proved on installed version.
- [Nginx proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html): streaming/buffering, header and TLS controls.
- [GitHub deployment environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments): approvals, branch restrictions and environment secrets; availability depends on account/repo plan.
- [MongoDB 8 transaction production considerations](https://www.mongodb.com/docs/v8.0/core/transactions-production-consideration/): replica-set transaction prerequisites. rs0 single-member availability remains a separate operational limit.
