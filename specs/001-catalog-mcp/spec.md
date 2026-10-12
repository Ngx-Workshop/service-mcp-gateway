# Local catalog MCP proof of concept

Status: Complete (local scope)
Feature ID: 001-catalog-mcp
Created: 2026-10-12
Request: User approved the catalog architecture and local implementation only.

## Scope and requirements
- FR-001: Expose exactly list_workshops, get_workshop, get_coding_lab over official SDK Streamable HTTP at /mcp.
- FR-002: Reuse document-contracts 0.0.37 and coding-labs-contracts 0.0.9 behind GET-only adapters; validate unknown responses and project safe outputs.
- FR-003: Require sectionId for workshop reads. Resolve detail by ID within that section. No learner eligibility, progress, document bodies, mutations, hidden tests or solutions.
- FR-004: Strict input/output schemas and bounded requests; sanitize errors without leaking upstream bodies, URLs or credentials.
- FR-005: Public local-only endpoint: bind to 127.0.0.1, validate Host and any Origin; never forward inbound credentials. No MongoDB requirement or seed CRUD routes.
- FR-006: Generate OpenAPI and independent MCP contract artifacts from the implemented schemas; document compatibility changes without publishing.

## Acceptance scenarios
- AC-001: SDK client discovers exactly three read-only tools and successfully calls all three with representative HTTP upstream responses (FR-001–003).
- AC-002: Invalid IDs, blank/oversized section keys and unknown input fields cannot reach upstream services (FR-004).
- AC-003: Missing workshop/unpublished lab returns NOT_FOUND; denied upstream reads return FORBIDDEN; timeout/unavailability/malformed data are safe execution errors (FR-004).
- AC-004: Invalid Host/Origin is rejected; incoming authorization/cookies never reach upstream; absent Origin is allowed for native clients (FR-005).
- AC-005: Server starts with no database/auth service; retired CRUD routes return 404; invalid configuration fails startup (FR-005).
- AC-006: Generated package builds and describes actual MCP schemas; live Nest HTTP round trips work with official modern and legacy SDK clients (FR-006).

## Success and boundaries
Unit, adapter HTTP integration, protocol e2e, strict build and non-mutating lint pass locally. External production services are not required: upstream doubles exercise real HTTP. Live owner integration remains separately unverified. OAuth, deployment, Nginx, publishing, resources, prompts and agents are excluded.

## Accepted assumptions
Workshop IDs are nonblank opaque strings; lab/version IDs are Mongo ObjectIds. Catalog is public metadata, not authorization to consume learner content. List responses are capped rather than silently truncated; real pagination is future domain-owner work. No external repository changes are required.
