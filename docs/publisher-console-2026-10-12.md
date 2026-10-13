# AI Publisher browser origin

User authorized production integration on 2026-10-12. Add exact origin `https://admin.ngx-workshop.io` alongside `https://chatgpt.com` in `ALLOWED_ORIGINS`. The resource remains `https://mcp.ngx-workshop.io/mcp`, with catalog:read enforced through uncached @tmdjr/ngx-auth-client introspection. No gateway engine, tool contract or secret change.

Production OPTIONS from the admin origin returns 204 with the exact allow-origin and supported SDK headers. Unapproved origin OPTIONS returns 403. Existing image `service-mcp-gateway:9e6630a2e6e0` was recreated through the validated promotion operator; prior container/config retained. Auth preregisters public client `ngx-workshop-ai-publisher-prod` with exact callback `https://admin.ngx-workshop.io/ai-publisher/console`, required S256 PKCE and no refresh token. Updated encrypted application recovery escrow verified at `ops-recovery/ngx-oauth/20261013T004509Z/application-secrets.tar.gz.gpg` in the independent private backup bucket.

Frontend owns single-use callback validation, in-memory bearer handling and expiry/revocation disconnect. Actual browser acceptance and frontend release evidence belong to `mfe-user-journey-admin-ai-publisher/specs/003-console-oauth/handoff.md`; server policy checks alone are not a browser acceptance claim.
