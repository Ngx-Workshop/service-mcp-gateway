# ADR 0003: Public catalog, local-only boundary
Status: Accepted · 2026-10-12

## Context
General document navigation is public metadata; personalized learner progression
is a different service-owned policy. Published lab content is explicitly redacted.
Existing JWT authentication is not a complete MCP OAuth authorization server.
The user approved local catalog implementation and deferred OAuth/deployment.

## Decision
Use document GET /navigation/workshops?section=… for list and in-section detail;
use coding labs GET /published-labs/:labId with optional published version.
Require sectionId and avoid inventing a detail route. No document bodies, learner
progress, grading, hidden tests or reference solutions. Return projected public
metadata only, with typed safe errors.

Bind to 127.0.0.1, reject production mode, validate Host/Origin, bound requests and
upstream responses, and never forward incoming cookies or authorization. Do not
wire the auth client into these public reads or imply read-only annotations are
access control. No OAuth or deployment changes in this phase.

## Consequences
Remote clients cannot connect yet; this is intentional. Domain-owner eligibility
must be consulted for future personalized tools rather than reimplemented here.
Protecting the external endpoint will require OAuth discovery/scopes/audience
validation and explicit downstream identity delegation. Existing deployment assets
are not compatible with the local-only listener until the next phase.
