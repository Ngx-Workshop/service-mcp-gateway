# Automatic main delivery

Effective 2026-10-13, the user-requested policy supersedes historical manual-only release instructions.

`.github/workflows/deploy.yml` validates pull requests. Pushes to main and manual runs on main validate, publish `@tmdjr/service-mcp-gateway-contracts`, then deploy. Production runs queue without cancelling a rollout. No package or deployment runs from a PR or other branch.

Publication uses npm 12.1.0 and trusted OIDC, with provenance. The version uses the committed major/minor plus GitHub's workflow run number (currently `1.1.<run number>`). A rerun skips publication only when the registry version already belongs to the same commit. npm's trusted publisher must name organization `Ngx-Workshop`, repository `service-mcp-gateway`, workflow `deploy.yml`, and no environment. No npm token is used.

Deployment uses pinned SSH/SCP actions and these existing secrets:

- `SSH_PRIVATE_KEY` (repository).
- `DROPLET_IP` and `SSH_HOST_FINGERPRINT` (organization, accessible to this repository).

The host must already have Docker, Python 3, `flock`, `ngx-net`, the running `service-mcp-gateway` and `ngx-oauth-backhaul` containers, volume `ngx-publisher-runs`, root-owned mode 0600 `/etc/ngx-workshop/oauth/gateway/runtime.env`, and `/etc/ngx-workshop/oauth/gateway/introspection` readable by UID 1000. The runtime file retains OPENAI_API_KEY, PUBLISHING_MODEL, PUBLISHING_ENABLED and service configuration. CI never transfers or rewrites it. PORT remains 3011; no host port is published.

CI transfers its tested image into `/opt/ngx-nestjs-services/mcp-gateway/releases/<run id>-<attempt>`. The host verifies archive SHA-256, image ID and commit label before stopping production. The new container keeps UID 1000, read-only filesystem, restricted tmpfs/capabilities and existing receipt/secret mounts. Readiness checks real OAuth metadata from the trusted backhaul. Failed container creation/readiness restores the stopped previous container and fails the job. Archive files are removed after the deployment attempt. Previous containers/images are retained for rollback; periodically remove obsolete stopped CI containers/images after confirming they are no longer needed.

For a successful release, the retained container is `service-mcp-gateway.before-ci-<run id>-<attempt>`. To roll back, under the deployment lock stop/rename the current container, rename that retained container to `service-mcp-gateway`, start it and repeat the trusted-proxy readiness check. Never delete the persistent volume or host configuration.

Rerun all jobs to repeat validation, or rerun failed jobs to reuse the same run's artifact. Artifacts expire after three days; after expiry start a new manual main run. Review validation, npm publication and deployment job results separately. No Nginx or database deployment is included.

Local verification: `node --test scripts/test-publish-workflow.cjs` and `python3 -m unittest discover -s scripts -p 'test_deploy_production.py' -v`. These tests exercise Docker doubles; they do not claim a live GitHub release. The first automatic release occurs after this workflow is committed and pushed to main.
