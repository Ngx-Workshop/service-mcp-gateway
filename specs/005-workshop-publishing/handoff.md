## Live draft generation passed — 2026-10-13

Owner funded API access. Fixed non-strict generation formatting with an internal strict schema and deterministic identity/order/section/level conversion;63 unit/adapter and43 e2e tests, build and lint passed. Locally validated image deployed with rollback preserved. Actual admin MFE generated a valid unpublished draft with one page, one lab (two sample/two hidden tests plus solution), and three questions. Public contract unchanged; code fix remains uncommitted locally. No publication/runner test performed. Detailed source/image hashes and screenshot in deployment evidence.

## Model activation update — 2026-10-13

OPENAI_API_KEY configured privately and PUBLISHING_MODEL=gpt-5.4-mini activated. Model access and gateway readiness passed. Live generation is blocked by OpenAI HTTP429 credit_balance_exhausted / insufficient_quota. No successful draft or publication occurred. Owner funding or a funded project key is required to retry the prepared brief. Temporary key copy deleted. See deployment evidence for details.

## Deployment update — 2026-10-13

Gateway and both proxy configurations deployed after explicit user authorization. Publishing enabled; authenticated production section lookup passed in the owner administrator browser. Missing/invalid authentication remains401, disallowed origins/learner facade403, preflight204 and catalog/auth metadata200. OPENAI_API_KEY/PUBLISHING_MODEL remain absent; no live model generation or content publication was performed. See [deployment evidence](../../docs/publishing-deployment-2026-10-13.md). Preserved previous containers/configs and durable journal volume for rollback.

# Workshop publishing handoff

Status: Implemented; live integration and deployment pending. Date: 2026-10-12.

Implemented: separate administrator-only MCP publishing tools and matching browser facade; strict editor/draft/CRUD schemas; owner API adapters; server-side OpenAI draft generation with verified uploader image context; sequential workshop/page/lab-verification/assessment assembly; durable receipts and duplicate/uncertain-write protection; publisher section lookup, brief/import/review/edit/publish/receipt interface. Existing catalog OAuth remains read-only.

Changed repositories: service-mcp-gateway, mfe-user-journey-admin-ai-publisher, nginx-ngx-workshop.io. Existing domain owner APIs already support the needed operations; no owner database or owner service implementation changes were required. Gateway contracts 1.1.0 generated and built; MFE consumes a committed vendor tarball and has no sibling runtime/build dependency. Registry package has not been published.

Verification: gateway build, contract generation/build, non-mutating lint, 61 unit/HTTP-adapter tests, 43 protocol/production/OAuth e2e tests; publisher production build, architecture checks, strict source/test type checks and 33 ChromeHeadless tests. Browser layout inspected on a temporary local preview. Native HTTPS and backhaul nginx syntax checked with temporary certs without starting/reloading production nginx. Model tests use synthetic responses; owner/auth tests use disposable doubles. Provided 23-block editor object and actual multipart upload bytes covered.

Scope limits: no paid live model call; no live MongoDB-backed publishing, Spaces storage or lab-runner acceptance; no production deployment, package registry publication or credentials provisioning. Publishing is not an atomic cross-service transaction: partial resources can be visible. Receipts require preserved durable storage, and deployment currently supports one gateway instance. Recovery is explicit CRUD reconciliation rather than automatic resume or rollback. A failed/timed-out create must be inspected before another request ID is used. Model drafting has no automatic retry.

Exact next steps: privately configure PUBLISHING_ENABLED, owner URLs, AUTH_BASE_URL, absolute journal storage and server-only OPENAI_API_KEY/PUBLISHING_MODEL; preserve the publisher-runs volume; deploy gateway/MFE plus both proxy files together after authorization. Use an administrator account to generate/review/publish a disposable workshop, open documentation in the document editor, complete a lab and assessment, inspect receipt/resources, and explicitly clean up independently owned resources. External publishing agents connect to /mcp/publishing with a validated platform administrator bearer and a >=180-second tool timeout; catalog OAuth does not grant publishing permission.

Detailed gateway configuration, authentication, source/type discrepancies, image handling and recovery: service-mcp-gateway/docs/workshop-publishing.md. Dependency installs reported existing/audited dependency-tree findings (gateway 46, MFE 41); no broad dependency upgrade was performed.

## Generation diagnostics — 2026-10-13
Local implementation: safe generation error categories distinguish configuration, uploader lookup, model access/quota/rate limits/timeouts/unavailability, incomplete/refused results and invalid generated content. Gateway logs category and bounded validation field paths only; publisher maps recognized codes to fixed messages and ignores upstream message text. Existing success schemas and auth boundaries unchanged.
Verification: gateway build/lint, 77 unit tests and 43 protocol tests; publisher architecture, strict application/test types, production build and 12 ChromeHeadless tests passed. Tests use synthetic failures. Public generated contract artifacts have no changes.
Live evidence: running model produced a valid draft from the exact Angular components brief with an empty image context in 10.9 seconds. Browser session had expired; after owner sign-in, complete production flow still returned the generic tool error. Original cause remains unknown because deployed dispatcher swallows errors without logs. Production deployment of diagnostics and full generation verification pending. No workshop published or domain records written in this investigation.

## Generation repair verified and deployed — 2026-10-13 evening

Root cause of reproduced failures: nested serialized image/quiz block data was not described by the internal generation schema. Completed model responses failed validation at documentation block paths with serialized_block reasons. The internal schema now uses required nested image/quiz objects; server conversion serializes editor JSON and resolves quiz answers from choice indexes. Public WorkshopDraft/editor contracts and provenance checks stay unchanged.

Local checks: gateway build and non-mutating lint,79 unit tests and43 protocol tests; publisher architecture, strict source/test types, isolated production build and12 ChromeHeadless tests passed. Public generated contracts have no diff. Added image/quiz conversion and invalid nested answer/image provenance regression coverage.

Live acceptance: deployed repair source SHA256 63d08a76b164b5175a38f5ada17bae9b5aaf3076205412a4f1f320071404f13f, image sha256:fb92e5b709f9bff2e6304fa5c518ce32c7a27b28118a7c4baf391b3f99455b38. Owner-authorized rollout preserved runtime credentials, auth controls and ngx-publisher-runs. Readiness passed; unauthenticated facade returned401. Original Angular components brief successfully generated “Angular Components: A Practical Introduction”: angular,level2,5 pages,2 labs,3 questions. Both generated image blocks contain serialized url/title objects and passed server provenance plus browser validation. Draft left in owner browser for review; no Publish action or owner writes performed. Screenshot /tmp/publisher-generation-success-20261013.jpg. Live quiz conversion covered by regression tests rather than this particular model result.

Rollback: original gateway retained as service-mcp-gateway.before-diagnostics-20261014T012015Z; pre-repair diagnostics retained as service-mcp-gateway.before-diagnostics-20261014T012548Z. Publisher backup /opt/mfe-remotes/releases/ai-publisher-before-diagnostics-20261013. This was a source build on the production host, not a CI-promoted commit. Commit/merge the source changes before a later main release to retain the repair; publication acceptance remains outside this generation-fix scope.
