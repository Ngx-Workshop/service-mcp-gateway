# ADR 0002: Independent MCP contracts with domain reuse
Status: Accepted · 2026-10-12

## Context
Published document-contracts 0.0.37 and coding-labs-contracts 0.0.9 export types,
not validators or HTTP clients. TypeScript types are erased. The original gateway
package 0.0.5 exports seed CRUD models rather than MCP contracts.

## Decision
Pin domain packages and use their types to check consumed upstream projections.
For this small proof of concept, explicit Zod validators check consumed fields
and discard unknown model properties. Sample-test input/expected remain opaque
JSON data; the owning published-content endpoint decides what is public.
Define independent strict MCP input/output schemas in catalog.schemas.ts.
Generate OpenAPI components and tool JSON from those same schemas. Reuse
openapi-typescript to generate model aliases and emit runtime JSON Schemas, rather
than use codegen models that widen opaque JSON to any. No duplicate handwritten
MCP package schemas. Build/package/runtime import and discovery drift checks are
required before handing off contract changes.

## Consequences
Owner data model changes are absorbed by projections without automatic changes
to AI-facing names. Explicit validators have a maintenance cost; they can later
be replaced by producer-exported OpenAPI/runtime schemas. Schema-first domain
migration is incremental, not a prerequisite. The generated package replaces
seed CRUD exports and therefore needs a deliberate breaking-release/consumer
migration decision before publishing. Local manifest version is not a release.
