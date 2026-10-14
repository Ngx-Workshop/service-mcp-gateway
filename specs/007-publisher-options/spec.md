# Publisher options
Status: Implemented; live integration pending · Updated: 2026-10-13

## Requirements and acceptance
FR-001 / AC-001: Administrators select a server-allowed generation model with USD input/output pricing per million tokens. Optional model input preserves older callers; unlisted models fail before provider calls.
FR-002 / AC-002: Sections load on entry into a dropdown, with explicit empty/failure and retry behavior.
FR-003 / AC-003: Historical publishing request IDs load from administrator-owned durable receipts and can be inspected. The current attempted ID remains visible after failures.
FR-004 / AC-004: Browse ready image assets or explicitly generate/upload an image, preview it and insert it into the first documentation page before validation/publication. Image failure preserves the draft.

## Boundaries and assumptions
The gateway owns provider credentials, model allowlist and durable receipt history. Workshop images use existing editor image blocks: no workshop cover field exists in this contract. Prices are reference rates, not a total workshop estimate. Generation incurs a separate provider charge and upload occurs only on explicit request. No automatic paid calls in tests. Live owner/provider acceptance is pending.

Unconfirmed submitted IDs are retained in the running app session until reconciled; durable server receipts survive app reload and gateway restart. No browser storage of another administrator’s receipt content.
