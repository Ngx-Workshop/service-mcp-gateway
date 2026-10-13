# Automatic gateway delivery

Requested 2026-10-13: match service-document delivery on main.

- FR-001: Pull requests validate only. Pushes and manual runs on main validate, publish the contracts package using npm OIDC, then deploy.
- FR-002: Publish a deterministic major.minor.GITHUB_RUN_NUMBER version; reruns accept only the same commit's existing publication.
- FR-003: Deploy the exact validated image. Preserve host-owned credentials, private networking, runtime restrictions and persistent publishing receipts.
- FR-004: Verify startup through the trusted proxy; restore the previous container on failed startup. Serialize production releases.

Acceptance: a PR cannot release; failed validation/publication blocks deployment; image mismatch fails before replacing production; failed readiness restores the prior container; successful deployment retains existing environment and receipt volume.

Scope: delivery configuration and local failure-path verification. A live GitHub run requires committing/pushing this change and is recorded separately.
