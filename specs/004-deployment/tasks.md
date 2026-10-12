# Deployment tasks
Status: Deployed/published; ChatGPT three-tool acceptance passed · 2026-10-12

- [x] P001: Inventory workflow/container/edge/database docs and production runtime gaps; record verified sources and unknowns in research.md.
- [x] P002: Add coordinated specs, config/ownership handoff, proposed ADRs, release/rollback order and acceptance gates; validate docs without altering deploy assets.
- [x] R001: Implement explicit production HTTPS/trusted-proxy profile while retaining local mode and legacy behavior.
- [x] R002: Require persistent runtime-owned private secret files; reject unsafe production config.
- [x] R003: Validate authenticated TLS MongoDB/schema/transactions in auth and dependency readiness in gateway with isolated regression tests.
- [x] R004: Correct Docker entrypoints/vendor/native dependencies, non-root image, private mounts and exclusions; build locally.
- [x] R005: Replace automatic publication/deployment with validation-only CI gates and candidate evidence; update ADRs and runbooks.

- [x] R006: Perform authorized live read-only deployment preflight; record passes, failures and unverified client/recovery policy in docs/deployment-preflight-2026-10-12.md. Audit complete, release not approved.

- [ ] T001: Confirm D001–D005, exact client callback/IDs, ingress/backhaul policy, live rs0/backup facts and environment protection support. Gate release; FR-002/005/006/007; AC-002/003/005/006.
- [ ] T002: Auth owner implements production profile, secure proxy cookies and legacy regressions, persistent secret mounts and Mongo least privilege (auth feature 004). Depends T001; FR-001/004/005/006; AC-001/003/005/007.
- [ ] T003: Gateway config/bootstrap/boundary production profile, public identity vs private listen, exact Host/Origin/trusted proxy and readiness tests. Depends confirmed identity policy, T002 for live acceptance; FR-001–004/009; AC-001/002/004/008.
- [ ] T004: Dockerfile/vendor layer, .dockerignore, non-root/runtime dependencies and deployment config contract; test isolated builds/image secret exclusion. Depends T003; FR-005/007; AC-001/006.
- [ ] T005: PR tests/build/contracts and immutable image release; separate publish/deploy, protected manual promotion and secret validation in .github/workflows/deploy.yml. Auth pipeline delivered first; FR-007; AC-006.
- [ ] T006: Edge owner implements dedicated vhost/native auth metadata and OAuth paths, verified certs, proxy/TLS/header/streaming/limits/no-cache policy and nginx tests. Depends T001–004; FR-002/003/009; AC-002/008.
- [ ] T007: Operator proves current backup/restore/key recovery/rs0 transactions and config rotation/rollback in isolation; stage least-privilege migration without disturbing other owners. Depends T001/002; FR-005/006/008; AC-005/006.
- [ ] T008: Add separate bounded production smoke and redacted monitoring: public discovery, actual chosen client, both SDK eras/three tools, revocation, outage and legacy browser acceptance. Depends T002–007; FR-008–010; AC-003–008.
- [ ] T009: After separate release authorization, promote auth→private gateway→edge, run smoke/rollback proof, record image/config versions and limitations. Depends all prior tasks; FR-008/010; AC-006/007.

Production-readiness implementation is authorized and delivered. T002–T005 have
local implementation evidence; their public acceptance, rotation/recovery and
promotion portions remain unchecked until release work. No checklist triggers a
deployment or publication. Live facts, edge changes, backups and rollout remain
deferred (T001 and T006 onward). See [readiness evidence](../../docs/production-readiness.md).

2026-10-12 preflight: T001 partially verified (hosts/certificate/rs0/current
permissions/backup integrity); actual clients and RPO/RTO remain open. T006/T007
and rollout remain unchecked. Existing remote main workflows still publish/deploy;
local CI changes must be reviewed before any future dispatch.

2026-10-12 user clarification: no production traffic; downtime accepted. Initial
launch retains single-member rs0 without a strict RTO or zero-downtime requirement.
Data-loss policy is not waived. [Recommended ChatGPT registration and recovery
baseline](../../docs/launch-client-and-recovery.md) replace the open availability
question; exact callback/issuer acceptance and recoverable backups remain gates.
No deployment or publication is authorized.

## Authorized production execution — 2026-10-12

The user now authorizes the recommended ChatGPT setup, infrastructure/secret/
MongoDB TLS/scoped-access/recovery remediation, deployment and publication.
Earlier no-deploy/no-publish restrictions are historical and superseded. Downtime
is acceptable; existing shared records/legacy auth and independent keys remain
preserved. No renewed permission is required for the explicitly authorized
release. Record exact versions, images, recovery proof and public smoke evidence.

Execution order: fresh encrypted consistent backup and isolated restore; durable
keys/CA/scoped roles; validated service and private TLS backhaul images; safe CI
and package release; private service rollout; edge/DNS; ChatGPT linking and public
three-tool/revocation/legacy acceptance. Compatibility-mode Mongo TLS preserves
older consumers until their own TLS migration; auth requires verified TLS.

- [x] X001: Fresh encrypted shared backup, independent escrow and isolated restore proof.
- [x] X002: Mongo TLS certificates, staged compatible server mode and scoped auth/provision/backup principals.
- [x] X003: Persistent OAuth keys, exact ChatGPT client, encrypted private backhaul and private-only bindings.
- [x] X004: Validated versioned images; gated CI/publication and reviewed commits.
- [x] X005: Activate services/edge/DNS; public SDK tools, revocation, legacy and rollback acceptance.
- [x] X006: Link private ChatGPT connection and record remaining account-specific constraints.

## Launch acceptance evidence

X001–X005 completed; [immutable release, infrastructure, recovery and public acceptance evidence](../../docs/production-execution-2026-10-12.md). X006 completed: owner sign-in/consent, authenticated tool discovery and all three ChatGPT read-only calls passed. Historical T-items above combine broader rotation/client journeys; do not imply those unexercised portions were completed. No production key regeneration or live DB restore occurred.
