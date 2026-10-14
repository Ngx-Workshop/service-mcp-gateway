# Workshop AI publishing

Implemented 2026-10-12; deployed 2026-10-13. [Live route verification](publishing-deployment-2026-10-13.md) passed. Model credentials are configured and live draft generation passed after funding and a strict generation-format fix. Full publication acceptance remains pending.

## Interfaces

The existing `/mcp` endpoint retains exactly three public catalog tools and `catalog:read` OAuth. It never exposes authoring models, reference solutions, hidden tests or write capabilities.

`/mcp/publishing` is a separate stateless MCP endpoint for agents. It requires a platform administrator bearer validated by service-auth on every request. Catalog OAuth tokens cannot authorize this endpoint. Configure the client timeout to at least 180 seconds for model generation or multi-step publication. Publishing never uses the local-public authentication bypass.

The admin publisher calls `/api/publisher/tools` through the admin reverse proxy, which forwards to gateway `/publisher/tools`. This facade shares the same validated tool dispatcher. Browser access uses the existing administrator accessToken cookie plus an allowed Origin; external agents use a bearer header. Only the selected, validated platform bearer is forwarded to trusted authoring owners. Unrelated cookies, catalog tokens and model API credentials never reach owners.

Tools: `generate_workshop_draft`, `validate_workshop_draft`, `publish_workshop`, `get_publishing_run`, `manage_document`, `manage_assessment`, `manage_coding_lab`, `workshop_image`. CRUD tools use discriminated operation inputs; discover the generated schemas in mcp-tools.json. Lab deletion archives through the owner; assessment deletion is permanent. Version updates require expectedContentHash, assessment updates require __v. Caller-supplied audit identity is never accepted.

## Configuration and rollout

Keep PUBLISHING_ENABLED=false until ready. Enable it with actual ASSESSMENT_BASE_URL, UPLOADER_BASE_URL and an absolute PUBLISHING_JOURNAL_DIRECTORY. Existing document/coding URLs remain authoritative. AUTH_BASE_URL must point to the trusted platform auth owner, which validates administrator credentials. Model drafting additionally needs privately provisioned OPENAI_API_KEY and an explicitly selected PUBLISHING_MODEL supporting structured Responses output. These are server-only variables. Manual draft validation/publication works without model credentials.

Docker creates an owner-writable /var/lib/ngx-publishing directory and mounts publisher-runs there. Preserve this volume across releases; it contains private authoring results including solutions. Run a single gateway instance with this directory; this implementation does not provide a distributed queue or shared filesystem locking. A browser timeout does not cancel the server run; inspect its receipt before another attempt.

Apply nginx-ngx-workshop.io native HTTPS and backhaul configuration together: admin-only `/api/publisher/tools`, agent `/mcp/publishing`, 8 MiB body limit and 180-second upstream timeout. Catalog body/time limits remain unchanged. Publish the additive contracts package 1.1.0 separately if needed; the MFE currently installs a committed reproducible vendor tarball, so it builds without sibling checkouts or an unpublished registry package. The gateway and both Nginx configurations are deployed; registry publication remains separate. Production currently uses the preserved ngx-publisher-runs volume.

## Draft and editor format

WorkshopDraft includes sectionId, name, summary, level, pages, labs and assessment. Documentation pages carry arrays of blockId, sortIndex, componentInstanceName, savedAction and dataClean. The supplied editor example is a regression fixture. IDs must be unique per page and order contiguous from zero. HTML is sanitized using a parser with a small allowlist; active content is rejected. Code and diagram strings remain literal. Image and quiz dataClean contain serialized JSON strings; image URLs must be HTTPS. Unsupported dynamic MFE-loader blocks cannot be generated.

Draft generation reads ready image assets through service-uploader and supplies their names/URLs to the model. Model image URLs must belong to that verified set. The workshop_image tool can find assets or upload actual base64 image bytes as multipart file data to service-uploader; it never creates fake storage URL metadata or fetches arbitrary remote URLs. Uploads cap at approximately 4.5 MiB bytes through the 6 MiB encoded argument limit. Returned storageUrl is the editor image URL; actual public object access depends on uploader permissions.

The generator uses the OpenAI Responses structured-output API with server-selected model, store=false and an internal strict output schema, then converts and strictly validates its result, section, level, answers and image provenance. Internal image and pop-quiz payloads are typed nested objects: the server serializes them into the existing editor dataClean JSON string format and derives quiz answers from choice indexes. This avoids asking the model to guess an undocumented nested string structure. Refusal, incomplete/invalid output and owner errors fail without publishing. No automatic model retries or paid live calls are used by tests. Reference: https://developers.openai.com/api/docs/guides/structured-outputs.

Published owner types are pinned and compile-checked at mappings. Known producer type discrepancies: CreateWorkshopDto declares _id required although runtime permits omission; LabTestCaseDto's generated input/expected unions omit JSON arrays and narrow opaque values. The adapter intentionally omits that _id requirement and validates service-owned sample/hidden JSON test values at the MCP boundary instead of using unsafe any.

## Publishing sequence and recovery

Publication checks the section, creates the workshop, fills and renames the owner's automatically created first page, appends other pages, creates each lab and draft version, verifies its exact content hash, publishes it, attaches the lab reference, creates the assessment, and attaches it last. Pages precede labs and assessment in the journey.

The owning services make resources available as their operations complete. There is no cross-service atomic transaction or hidden workshop draft state. A partial failure can therefore leave visible partial content. Each mutation is journaled pending before execution and completed with its result afterward. Receipts include resource IDs, statuses and sanitized recovery messages. Request IDs are bound to administrator subject and a normalized draft hash. Repeated IDs return the recorded receipt; a changed draft conflicts. A timeout or crash with a pending mutation is never automatically replayed. Concurrent duplicate requests are rejected.

Recover by inspecting the receipt and owning records with CRUD tools, determining whether the pending operation committed, repairing existing pages/references/labs/assessment, or explicitly removing newly created resources. Deleting the workshop removes its document pages; independently owned labs and assessments require separate cleanup. Do not invent a fresh request ID merely to retry an uncertain create. No automatic rollback, resume or exactly-once claim is made.

## Verification

Gateway unit tests cover editor specimen, invalid/sanitized blocks, assessment choices, bearer/admin boundaries, model refusal and image context, actual multipart HTTP uploads, publishing order, verification failure, duplicate IDs, draft conflicts, receipt ownership and uncertain writes. Protocol tests use a real Nest listener and official MCP client with disposable owner/auth doubles. These do not prove live MongoDB, uploader storage, lab runner, production ingress or model access.

## Generation failure diagnostics
The generator returns safe error codes for missing settings, image lookup, model access/quota/rate limits/timeouts, provider rejection/unavailability, incomplete/refused output and invalid generated content. The dispatcher logs the category and bounded validation field paths only; upstream bodies, prompts and credentials are excluded. Updated publisher clients map these codes to fixed guidance and fall back safely for older responses. Success schemas remain unchanged. Diagnostics and nested-block format repair were deployed after owner approval; see the 2026-10-13 deployment evidence.
