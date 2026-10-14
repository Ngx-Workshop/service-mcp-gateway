# Handoff: Publisher options
Status: Implemented; live integration pending
Updated: 2026-10-13
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior
AI model dropdown displays input/output USD reference prices per million tokens and sends the selected model to the server. Server configuration owns allowed models and pricing; the original configured model remains a compatible default. Sections populate a dropdown automatically with reload and empty/error states. Publishing history lists the latest 100 administrator-owned durable receipts, while unconfirmed submissions remain inspectable during the running app session. Historical inspection preserves the current request ID. Images can be selected from ready uploader assets or explicitly generated/uploaded, previewed, inserted into the first documentation page and server-validated. Failure preserves edits and prevents publishing an unvalidated draft. No separate workshop cover field is introduced.

## Verification evidence
Gateway: 82 unit tests and 43 protocol e2e tests passed; application build, contract generation/build and non-mutating lint passed.
Tests use HTTP/model/owner doubles and temporary journal directories; no paid model requests or real workshops were created. Meaningful coverage includes model propagation/allowlist rejection, section/model/history startup, setup error preservation, selected image serialization and ordering, image generation/upload and failures, uncertain request reconciliation, durable history restart/subject filtering and unchanged public catalog authorization. Final diff whitespace checks passed.

## Integration order and remaining work
Gateway contracts 1.2.0 are regenerated and committed locally; the publisher installs a reproducible vendor tarball. Deploy the gateway before the publisher bundle. Registry publication and deployment were not performed. Configure OPENAI_API_KEY, model availability and optional PUBLISHING_MODELS_JSON/PUBLISHING_IMAGE_MODEL, then verify in the real administrator shell: automatic section load; model choice reaches the provider; generated image reaches READY uploader storage; adding an image validates and publishes; historical IDs survive reload and respect account ownership. Reference prices need operator maintenance and differ from total charges.

X001 remains pending for this live acceptance. Documentation now describes configuration, contracts, image placement, history limits and review component size exception. No unrelated dependency changes remain in the publisher lockfile.
