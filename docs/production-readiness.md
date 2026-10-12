# Production-readiness implementation

Implemented locally on 2026-10-12. Deployment and publication are deferred.

## Proxy contract

Set `NODE_ENV=production`, `RUNTIME_PROFILE=production`, an explicit numeric
`LISTEN_HOST`, and comma-separated exact `TRUSTED_PROXY_IPS` (no CIDR or wildcard).
Compose listens inside the container and publishes only the approved private
application IP. A firewall must restrict access to the approved edge.

The final trusted proxy must overwrite Host with the configured public authority,
X-Forwarded-Proto with `https`, and X-Forwarded-For with a single verified client IP.
It must remove Forwarded and X-Forwarded-Host. Appending an arbitrary forwarded
chain is rejected. This assumes one normalized final hop; adapt and test deliberately
if the real edge has additional trusted hops. Configure exact HTTPS browser origins
through `ALLOWED_ORIGINS`; server-to-server clients may omit Origin.

Production public identity uses canonical HTTPS on port 443, independent of the
private listen port. Public DNS/certificates, trusted edge addresses, firewall and
verified encrypted backhaul remain release gates; no Nginx change was made here.

## Containers and CI

Both images use a digest-pinned Node 22 Alpine base, multi-stage builds, production
dependencies, UID 1000, and private-file exclusions. Compose specifies read-only
filesystem/secrets, temporary writable /tmp, dropped capabilities and no new
privileges. Runtime secrets must be regular files owned by UID 1000 with mode 0600;
symlinks and broader permissions fail. Prepare ownership before mounting read-only.

Actions validates pull requests/main/manual runs, builds candidates locally, checks
UID/private-file exclusion, and retains image archives with SHA256 for review. It
contains no publish, SSH, production-secret or deployment job. Workflows were not
dispatched. Candidate image archives do not authorize later promotion.

## Remaining release gates

Confirm actual clients/callbacks and domains, CA/certificate validity, topology,
private-network policy, scoped credential ownership, encrypted backup/restore, key
rotation and outage targets. Implement edge limits/no-cache/native routes, public
client smoke and compatible image/config rollback before separately authorized
rollout. Do not reset rs0, regenerate keys, or restore shared data for app rollback.

## Gateway configuration

Set `MCP_AUTH_MODE=oauth`, `AUTH_ISSUER_URL`, `MCP_RESOURCE_URL` ending exactly
/mcp, `AUTH_INTROSPECTION_URL` exactly issuer + /oauth/introspect,
`AUTH_INTROSPECTION_CLIENT_ID` and `AUTH_INTROSPECTION_SECRET_FILE`. Check the
actual variable names in [OAuth config](../src/auth/oauth.config.ts) before staging.
Compose mounts the durable introspection credential at /run/secrets/introspection
using `INTROSPECTION_SECRET_HOST_FILE`. Inline secret environment values and
local-public/local-dev flags are rejected in production. No auth DB credentials
or signing/storage keys belong in this service.

Keep configured document/coding-labs owner URLs on the approved internal network.
Production bootstrap checks JSON owner responses and bounded authorization-server
discovery with matching issuer/introspection endpoint before listening. These
checks prove connectivity, not an actual OAuth grant; introspection stays uncached
and request-bound. Public protected-resource discovery allows credential-free
cross-origin GET; MCP requests require the configured Origin policy and bearer.

## Verification evidence

49 gateway unit tests and 40 integration tests passed, including spoofed/missing
proxy headers, Host/Origin rejection, public discovery CORS, fail-closed dependency
readiness and existing three-tool/bearer/revocation behavior. Strict application
and contract builds, generated-contract checks and lint passed. Local Docker
build installs the pinned published auth-client 0.0.66 with the committed lockfile.
Previous real local owner integration evidence is recorded in feature 003; no
public production client or edge was exercised in this phase.

Live release decision: [2026-10-12 preflight](deployment-preflight-2026-10-12.md). Audit completed; release gates failed or remain unverified.
