# ADR 0008: Gated immutable releases through existing CI/CD
Status: Accepted for readiness implementation; release operations deferred · 2026-10-12
Feature: [004 deployment](../../specs/004-deployment/spec.md)

## Context

Before this change, auth/gateway main workflows published NPM then deployed via pinned SSH/SCP,
root-only temporary env, source archives and host Docker builds. These two
workflows save previous images/env but do not automatically restore on smoke
failure. TCP checks do not establish OAuth/owner readiness. Automatic main
publication/deployment could release unreviewed production-incompatible code.

## Proposed decision

Reuse Actions, reviewed action pins, SSH host fingerprints, existing service paths,
Docker/ngx-net and NPM OIDC. Add secret-free PR validation and build stages; only
explicit authorized promotion accesses environment-scoped production secrets.
Use protected environments/restricted branches where available; verify GitHub
plan support and document a manual operator promotion equivalent if unavailable.
Main should validate/build, not automatically expose OAuth or publish a new API.
Separate optional NPM publication from rollout and don't require publish success
as an unrelated service deployment dependency.

Test and promote immutable images by source SHA and digest, with config schema and
producer/consumer artifact versions. Prefer CI-built image archives over the
existing host rebuild, transported using the same SCP tooling and verified before
docker load; no new registry required. Pin base image digest and install lockfiles.
Copy gateway vendor package before npm ci and explicitly exclude all private auth
config. Use non-root runtime and persistent read-only external secret mounts.
Builds/test jobs must never need production credentials or keys.

Prepare compatible image/config pairs in versioned directories; activation,
readiness and diagnostics are bounded. Release DB/config prerequisites → auth →
private gateway → edge → public smoke. On failure, preserve sanitized diagnostics,
close new ingress and restore a compatible previous image/config pair. Never fall
back to anonymous access or restore the shared DB for application rollback.
Legacy auth remains supported; removing OAuth exposure isn't permission to reset
accounts, regenerate keys or turn stale restored grants active.

## Consequences

Cross-owner release gates replace independent ungated main rollouts. Auth-client
may remain the reviewed local artifact initially, with immutable checksum; a
registry release requires separate publication review and consumer tests. Contract
version/migration decisions must account for prior seed CRUD replacement, not
blindly bump a run-number patch. Actual promotion remains later explicit work.

References: [GitHub environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

## Implementation evidence

The readiness subset is implemented and verified locally; see
[production readiness](../production-readiness.md). CI now validates and retains
reviewable candidates only. Secret provisioning, live client registration, edge
configuration, backup/rotation proof and protected promotion remain future release
operations. No publishing or deployment occurred.

## Live preflight — 2026-10-12

[Audit evidence](../deployment-preflight-2026-10-12.md) verifies current hosts,
certificate, authenticated single-member rs0 and historical backup integrity.
Installed production configuration does not yet satisfy this decision; deployment
is blocked by the recorded infrastructure/client/secret/recovery/CI gaps. No
production change or publication occurred.

## Launch-policy clarification

The user accepts downtime because there is no production traffic. Retain the
single-member replica for launch; no strict recovery-time commitment or
zero-downtime deployment is required. Preserve data and keys and prove recovery.
Initial ChatGPT registration is a recommendation awaiting exact client callback
acceptance; see [client/recovery note](../launch-client-and-recovery.md).
Nothing was provisioned, deployed or published.

## Authorized launch evidence — 2026-10-12

Decision implemented in production after explicit user authorization. See [launch evidence](../production-execution-2026-10-12.md) for reviewed commits/images, persistent secrets, verified TLS/scoped storage, actual recovery/public acceptance and the unresolved private ChatGPT builder error. Earlier no-deploy statements describe the historical phase.
