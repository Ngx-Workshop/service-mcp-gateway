# Architecture decisions

- [0001 — Dedicated gateway and official SDK](0001-gateway-sdk.md)
- [0002 — Independent MCP contracts and domain reuse](0002-contract-boundaries.md)
- [0003 — Public catalog and local-only proof of concept](0003-local-catalog.md)

ADRs 0001–0003 are accepted for the user-approved local scope on 2026-10-12.
The authorized OAuth implementation accepts these decisions:

- [0004 — Auth issuer and gateway resource ownership](0004-oauth-ownership.md)
- [0005 — Additive auth-client introspection](0005-oauth-auth-client.md)
- [0006 — Catalog scope, consent and local boundary](0006-oauth-catalog-scope.md)

ADRs 0004–0006 are implemented and locally verified. See the
[OAuth plan](../../specs/003-oauth-resource-server/plan.md). Deployment remains
outside the OAuth phase.

Deployment planning adds proposed decisions (no runtime/deploy asset changes):

- [0007 — Public HTTPS ingress](0007-public-https-ingress.md)
- [0008 — Gated immutable delivery](0008-gated-deployment-delivery.md)

See [deployment planning handoff](../../specs/004-deployment/handoff.md). Neither
ADR authorizes a workflow run or rollout.
