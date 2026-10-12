# Real local catalog integration
Status: Complete (local scope)
Feature ID: 002-live-catalog-integration
Created: 2026-10-12
Request: Verify all three MCP tools against real local document/coding-lab services and fix integration issues before OAuth/deployment.

## Requirements
- FR-001: Exercise official MCP clients against the real Nest gateway, document service and coding-labs service with real local MongoDB, without persistence/auth doubles.
- FR-002: Discover real sections/workshops/published labs through owning public HTTP APIs. Validate every available workshop and published lab, including pinned latest version, ordered mixed references, public-field projection and structured/text output agreement.
- FR-003: Verify empty section and unknown workshop/lab/version behavior and rejected malformed arguments. Do not change learner policy or add OAuth/deployment.
- FR-004: Supply a repeatable opt-in read-only check. Fail if data is insufficient for successful detail/lab reads; never count empty catalogs as full verification. Restrict URLs to loopback and do not create/modify/delete records.
- FR-005: Record service/config/version evidence, exact results, regressions and remaining limits. Correct real integration issues if found and add focused regression coverage.

## Acceptance
AC-001: list_workshops succeeds for every real section and matches upstream public summaries.
AC-002: get_workshop succeeds for each real workshop, with exact ordered PAGE/CODING_LAB/ASSESSMENT_TEST references where present.
AC-003: get_coding_lab succeeds for all publicly listed labs, preserves JSON sample values and matches pinned latest content without authoring fields/sample IDs.
AC-004: Empty/missing/wrong-section records, unknown versions and malformed inputs produce safe outcomes; modern and legacy clients can call all three tools.
AC-005: Repeatable command exits zero only after nonempty real tool coverage; localhost endpoints only; no source/data changes to owner services.

## Scope limits
Use existing local data and real services in their supported local modes. Auth is synthetic local administrator context in owners, not OAuth/platform identity verification. No code execution or lab verification/grade calls are needed. Local database setup already exists. No publication, deployment or external service changes.
