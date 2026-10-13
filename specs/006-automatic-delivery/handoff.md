# Handoff — automatic delivery

Implemented 2026-10-13. Main pushes and manual main runs now validate, publish via OIDC and deploy, matching the service-document ordering and SSH delivery conventions. PRs validate only. No npm tokens, API changes or domain writes.

Added exact-image promotion with archive checksum/ID/revision verification, host-owned configuration, existing private networking and persistent receipt mounts, trusted-proxy readiness and previous-container rollback. Main runs serialize without cancellation. Version publication is deterministic and safe to rerun for the same commit; a different commit collision or registry outage fails. Same-run artifacts support failed-job reruns during the three-day retention period.

Verification:
- actionlint 1.7.12: workflow passed (shellcheck unavailable; disabled explicitly).
- Node syntax check for inline publication script: passed.
- Five publication tests: deterministic version/provenance, same-commit rerun, collision rejection, registry outage, publish failure — all passed.
- Five Docker-double deployment tests: success/preserved environment and volume, checksum rejection, image rejection, failed readiness rollback, failed run rollback — all passed.
- git diff --check passed.
- Read-only live host inspection: required runtime values and owner-only mode match; Docker network/volume/current container exist; flock installed; actual trusted-backhaul OAuth metadata readiness passed.
- GitHub lists inherited DROPLET_IP and SSH_HOST_FINGERPRINT as accessible to this repository; repository SSH_PRIVATE_KEY exists. No secrets changed or printed.

No live GitHub release was triggered. Commit and push to main to activate and verify the complete publication/deployment run. The existing npm trusted publisher must continue authorizing this repository's deploy.yml (no environment). The new workflow retains all existing app/build/contract/lint checks; app suites were not rerun locally because application code is unchanged. Current production container was not replaced during this CI configuration task.

Current runbook: docs/automatic-delivery.md. Current user instruction supersedes manual-only delivery language in historical deployment records and ADR 0008; AGENTS and context docs reflect this.
