# Real local integration plan
Status: Complete (local scope)
Updated: 2026-10-12
Spec: [spec.md](spec.md)

## Evidence and approach
MongoDB is running on 127.0.0.1:27017; no owner services initially listened. Start current-source document service on loopback:3007 with DOCUMENT_LOCAL_DEV=true, NODE_ENV=development, GENERATE_OPENAPI=false and document_local. Start coding-labs on loopback:3009 with CODING_LABS_LOCAL_DEV=true, development mode, generation disabled and coding_labs_local. Start compiled gateway on loopback:3011 with actual owner URLs. Do not edit owner code, use generation stubs, read another service's database, or mutate local records.

Initial official modern-client scan passed five sections, eleven workshops and one published lab. Real sample input is an array and the workshop includes all three journey kinds. No adapter mismatch was observed.

## Implementation
FR-001–004: Add test/live-catalog.integration.ts and test:integration:local script. Discover via public API, validate unknown HTTP responses, compare observable outputs with real data, run modern and legacy clients, verify negative behavior. Use existing records only; fail clearly for empty catalogs. Keep this opt-in rather than add local service prerequisites to unit/e2e suites.
FR-005: Update local URL defaults, feature index, architecture/development/README and handoff. Add regression fixes only where evidence justifies them.

## Constitution and risk
Owning APIs retain data/business-policy responsibility. Gateway remains local/public/read-only. All URL overrides must be loopback HTTP(S) without credentials/query/fragment. API/contract shapes remain unchanged unless real evidence requires an adapter fix. No consumer release or OpenAPI regeneration is required for this test/config/documentation-only addition. Local-mode checks are not production authentication evidence. Existing gateway changes are preserved.

## Checks
Run the opt-in test against the started services, typed lint and strict build. Tests/unit protocol regression only if runtime adapter/schema changes occur. Stop only processes launched for this verification; preserve MongoDB and existing local records. Record owner source refs and public counts without copying saved content into the evidence.
