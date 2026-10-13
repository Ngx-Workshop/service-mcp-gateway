# Publishing deployment — 2026-10-13

User explicitly authorized gateway deployment, both Nginx layers, publishing enablement and live route verification. Completed on 2026-10-13, approximately 00:45 America/New_York.

## Running artifacts

- Gateway source/revision: 542067eecc9d308b2d18063e5e86a78c770179d6. Successful validation run 38344402766 supplied the promoted image archive; SHA256 matched its manifest and image ID matched image-id.txt.
- Gateway image: service-mcp-gateway:542067eecc9d, ID sha256:0b44183e9b9cb4b782ceb0eeb5c6e12492a8d2ec8dd21aaa06435d87d26fa826.
- Edge source: 403a198a6ce94ee844f5c90f558edcc2c1bdf0b9. Image nginx-ngx-workshop.io:publisher-403a198, ID sha256:2738a616c1c60e51e5a51c7068e0416dc50bc88ab88da46730450b2bff9ecc3c. Built from the pinned existing Nginx base and the exact repository configuration.
- Native edge config SHA256: 157d94a17ae80ebc908ce7074039bf0a3febdedaa317784f47dc6a5fe1481457.
- Private backhaul config SHA256: 50eeb30a7ccf0d2b13eed9f842379987840e6570e90fe9b66f839d25ae781203. Existing mounted inode preserved; live Nginx config tested and gracefully reloaded. Trusted proxy IP, private listener and exact edge allowlist preserved.

## Configuration

Enabled PUBLISHING_ENABLED=true. Set ASSESSMENT_BASE_URL=http://service-nestjs-assessment-test:3005, UPLOADER_BASE_URL=http://service-uploader:3010, AUTH_BASE_URL=http://ngx-auth-service:3000 and PUBLISHING_JOURNAL_DIRECTORY=/var/lib/ngx-publishing. Existing catalog/OAuth owner URLs, resource/issuer, scopes, origins and secret mounts preserved. No signing key, OAuth registration, introspection credential, user account or domain record was changed.

Durable Docker volume ngx-publisher-runs mounted at /var/lib/ngx-publishing; owner UID1000 and mode0700 verified. Gateway remains UID1000, root filesystem read-only, all capabilities dropped, no-new-privileges and no published host ports. Existing owner APIs retain their own administrator checks.

OPENAI_API_KEY and PUBLISHING_MODEL were absent. They remain unconfigured; AI draft generation is not operational yet. Manual draft validation and publishing tools are enabled. No model/provider choice or credential was invented.

## Live checks

- Signed-in owner administrator clicked Browse workshop sections in the production publisher. /api/publisher/tools successfully returned the actual Angular, Nest JS, RxJS and Rust sections through service-document; prior 404 error cleared and selector populated.
- Unauthenticated admin facade and invalid bearer:401.
- Invalid Origin and learner-host facade:403.
- Publishing MCP endpoint:401 without administrator credentials.
- Existing catalog endpoint:401 without catalog credentials.
- Publishing credentialed preflight:204.
- Existing catalog resource metadata:200, catalog:read unchanged.
- Existing auth issuer discovery:200, matching issuer.
- Both live Nginx configurations pass nginx -t. Gateway journal writable as UID1000.

No workshop, lab, assessment or image was created, modified or deleted. No model generation, paid request or full publishing acceptance was performed. This proves route/authentication and real read-adapter integration, not publication or model capability.

## Recovery

A fresh existing encrypted recovery job completed successfully before promotion (2026-10-13 04:42:20 UTC). Previous gateway container service-mcp-gateway.previous-publishing-20261013 and edge nginx.previous-publishing-20261013 remain stopped for rollback; old images were not deleted. Application-host /etc/ngx-workshop/releases/publishing-20261013 holds owner-only previous runtime env/container inspect and backhaul configuration. Edge /opt/nginx-ngx-workshop.io/publishing-20261013 holds prior container/config plus the new build context. Preserve the durable receipt volume across later releases.

Rollback: stop/remove the new affected container, rename/start its preserved previous container, restore the previous gateway runtime.env if reverting the gateway, and restore backhaul.previous.conf into the existing mounted file then nginx -t / reload. Do not restore MongoDB or regenerate keys for application rollback. Root-owned inspect/env backups remain private because future versions may contain credentials.

Next: privately provision server model/API credentials and recreate gateway with the same security flags, secret mounts and receipt volume. Then conduct a separately scoped disposable workshop publishing acceptance.

## Model configuration update — 2026-10-13

The user supplied a private key file and authorized configuration and draft-generation verification. A temporary RTF copy was restricted to0600, the key extracted without display and transferred through verified SSH, then that temporary copy deleted. Server key and runtime.env remain root-owned0600. No key value entered source control, chat, browser content or command-line arguments.

OpenAI model preflight accepted the key and confirmed gpt-5.4-mini access. OPENAI_API_KEY and PUBLISHING_MODEL=gpt-5.4-mini are now active. Existing image, nonroot/read-only/capability/port controls, introspection mount and durable publisher volume preserved; gateway readiness passed. Prior container service-mcp-gateway.before-model-20261013T154524Z and owner-only configuration backups under /etc/ngx-workshop/releases/publishing-model-20261013T154524Z retained.

The live admin browser submitted an unpublished TypeScript-functions workshop brief in Angular. Generation failed. A server diagnostic invoked the same production DraftAgentService with an empty image context and captured sanitized provider details: OpenAI HTTP429, credit_balance_exhausted, insufficient_quota. No successful draft or domain record writes occurred. Billing settings/payments were not altered.

Current blocker: API funding. Owner must add API credits at https://platform.openai.com/settings/organization/billing/ or supply a funded project key. Then retry the prepared brief and verify documentation blocks, lab tests/solution and assessment before publication. Model documentation: https://developers.openai.com/api/docs/models/gpt-5.4-mini.

## Successful draft verification after funding

Credits added by owner. Live model output exposed a generation-format defect: the original non-strict schema did not convey semantic action/order/assessment refinements to the model. Fixed with an internal strict generation schema using explicit block action variants and required properties; arbitrary IO values are JSON strings, assessment answers are choice indexes, and the server assigns unique block IDs, sequential sortIndex, caller section and level before validating the unchanged public WorkshopDraft. Refusals, invalid JSON, invalid indexes and unverified images still fail; no automatic paid retries or validation bypass added.

Verified: build,63 unit/adapter tests,43 protocol e2e tests and non-mutating lint. Public MCP schemas/OpenAPI unchanged. Production runtime dependencies remain unchanged; Docker prune reported one existing moderate advisory and no high/critical findings. A fresh recovery job completed successfully during the release.

Promoted locally validated source image service-mcp-gateway:generation-20261013, image ID sha256:840660f0634b22fec210b72c9f0762cf2f844d3557a42be6a039f431c199f2f1. Source archive SHA256 c9d2c9dbdbf8f7c95176597543aa790ad9cf082e10cb6f2035b37c82719fcf90; includes only allowlisted application sources/configuration/package locks, never runtime keys. This source fix is in the local working tree and has not been committed/pushed or presented as a CI-built revision. Previous container service-mcp-gateway.before-generation-20261013T155931Z retained; current runtime env, secret mount, security flags and receipt volume preserved. Gateway readiness passed; unauthenticated facade remains401.

Actual signed-in admin publisher successfully generated “Pure TypeScript Functions for Angular Developers”: one documentation page with h1 header, two medium paragraphs and a text/typescript code block; unique IDs and sortIndex0–3; one coding lab with starter code, reference solution, two sample and two hidden tests; three multiple-choice assessment questions, all answers matching choices; section angular, level1. Verified through real uploader-image lookup and real OpenAI response, returned through the publishing facade and validated in the UI. Screenshot: publishing-draft-verification-2026-10-13.png. Draft left in the owner browser for review. No Publish action was invoked, no domain records were written, and lab runner/publication acceptance remains separate.
