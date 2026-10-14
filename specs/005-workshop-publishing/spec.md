# Workshop publishing
FR-001: Administrators and authenticated agents can generate and review a workshop draft, then explicitly publish it.
FR-002: Documentation uses Ngx-EditorJs2 block arrays serialized in service-document html.
FR-003: Authoring tools support owner API CRUD for documents, labs and assessments, plus uploader image search/upload.
FR-004: Public catalog OAuth cannot authorize writes. Publishing requires validated platform admin authentication.
FR-005: Publish verifies labs before publication and records each completed operation; duplicate run IDs cannot blindly repeat writes.
AC-001: A valid draft creates documentation, verified labs, assessment and ordered references.
AC-002: Invalid blocks/questions and non-admin access fail before owner writes.
AC-003: Partial failure returns completed resource IDs and stops; uncertain writes require reconciliation.
AC-004: Publisher preserves drafts on failure and shows generation/publishing/recovery states.
Assumption: Use existing platform administrator credentials via the shell for the publisher and bearer auth for external agents. Catalog OAuth remains independent.

## Generation failure diagnostics — 2026-10-13
FR-006: Generation failures distinguish missing model configuration, image lookup, model authorization/quota/rate limit/timeout/unavailability, incomplete/refused output and invalid generated drafts using fixed safe messages. No upstream bodies, credentials, prompts or stacks reach the browser.
AC-005: Simulated generation failures return a classified error; the publisher displays actionable guidance and preserves the brief. Unknown/malformed errors retain the generic fallback.
Live evidence: owner reported a long wait on the deployed console; direct running-model diagnostic of the same Angular components brief passed in 10.9 seconds with an empty image context. Root cause of the original failed request is not established.

FR-007: The internal model schema describes nested image and pop-quiz fields explicitly. Server conversion emits the existing serialized editor format and derives quiz answers from indexes, preserving final validation and image provenance.
AC-006: Structured generated image and quiz objects produce valid editor blocks; malformed nested data, invalid answers and unverified image URLs remain rejected.
Observed production cause: completed model output failed serialized image/quiz block validation at pages.0.blocks.2 and pages.4.blocks.2. The old internal schema declared these payloads as arbitrary strings and supplied no nested field contract.
