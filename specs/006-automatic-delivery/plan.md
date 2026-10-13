# Plan

Use service-document/.github/workflows/deploy.yml as the delivery convention: main-only publication, npm 12 OIDC, deterministic version, deployment depending on publication, pinned SSH/SCP actions and non-cancelling production concurrency.

Keep gateway validation and its immutable Docker artifact. Transfer that artifact instead of rebuilding on the host. A Python deployment entry point verifies archive checksum, image ID and revision, then recreates the gateway with existing private runtime configuration and volume. Retain the old container and restore it on failure. Check OAuth resource metadata through ngx-oauth-backhaul, preserving proxy trust checks.

No API, database or model changes. No credentials enter GitHub artifacts. Existing organization secrets supply DROPLET_IP and SSH_HOST_FINGERPRINT; repository SSH_PRIVATE_KEY already exists. No new runtime secrets needed. Current user request explicitly supersedes the former manual-only release policy (ADR 0008).

Verify workflow structure/actionlint, mocked Docker success and rollback paths, plus read-only live prerequisites. Do not trigger a live release without a committed main revision.
