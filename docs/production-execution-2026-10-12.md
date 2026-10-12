# Authorized production execution — 2026-10-12

The user authorized deployment and publication after resolving preflight gates.
Private ChatGPT client: `ngx-workshop-chatgpt-prod`, PKCE S256, exact callback
`https://chatgpt.com/connector_platform_oauth_redirect`, only `catalog:read`.
Public resource: `https://mcp.ngx-workshop.io/mcp`.

Auth is live at `https://auth.ngx-workshop.io` with verified private HTTPS
backhaul and scoped TLS Mongo storage. Discovery and legacy sign-in checks passed.
Gateway has only its separate introspection secret, no database credentials.
Recovery baseline restored all 21 users in isolation; daily consistent encrypted
backups include oplog and are verified in private independent object storage.
Matching production OAuth/JWT/backhaul secrets have separate encrypted escrow.

Gateway contracts 1.0.0 intentionally replace seed CRUD exports. Consumers must
use the three catalog tool models/schemas; no seed CRUD compatibility is claimed.
Auth-client 0.0.66 preserves legacy exports and adds introspection.
CI validates before optional manual OIDC publication; rollout remains explicit.

Production verification is opt-in with exact approved HTTPS URL allowlisting;
uses owner read APIs and an operator-owned temporary auth account, never domain
seeding. Public OAuth/tool/revocation acceptance and private ChatGPT linking remain
pending until the validated gateway image is promoted.
