# Implemented local OAuth interfaces
Status: Implemented and verified locally; deployment deferred.
Updated: 2026-10-12

## Ownership and endpoint contract

| Owner | Route/export | Authentication and behavior |
| --- | --- | --- |
| Gateway | GET /.well-known/oauth-protected-resource/mcp | Public; resource=MCP_RESOURCE_URL, authorization_servers=[AUTH_ISSUER_URL], scopes_supported=[catalog:read], bearer_methods_supported=[header] |
| Gateway | /mcp supported protocol methods | Bearer+catalog:read; metadata and preflight exceptions explicit; no cookie acceptance |
| Auth | GET /.well-known/oauth-authorization-server | Public RFC 8414 metadata: issuer, authorization_endpoint, token_endpoint, introspection_endpoint, revocation_endpoint, response_types_supported=[code], grant_types_supported=[authorization_code], code_challenge_methods_supported=[S256], scopes_supported=[catalog:read], token_endpoint_auth_methods_supported=[none, client_secret_basic]; advertise CIMD only when implemented |
| Auth | GET /oauth/authorize | Validate client/redirect/resource/scope/PKCE first; real login/session and consent; code+original state+iss response for validated redirect; advertise authorization_response_iss_parameter_supported=true |
| Auth | Auth-owned login/consent POSTs | Browser session, CSRF protection, bound authorization transaction, denial→access_denied at validated redirect; user never submits password to MCP client/gateway |
| Auth | POST /oauth/token | Form encoded authorization_code exchange, code_verifier, redirect_uri, client_id, resource; client authentication per registration; no password/implicit/refresh grant |
| Auth | POST /oauth/introspect | RFC 7662 form token (+optional access_token hint), separate resource-server client_secret_basic credential; only introspect own gateway audience; no browser cookie authentication |
| Auth | POST /oauth/revoke | RFC 7009 form token; authenticates confidential client or verifies issued public client binding; uniform success for unknown tokens, revoke only caller-owned tokens |
| Auth | Auth-owned grant management | Authenticated user+CSRF may revoke own client/resource grant and its tokens; consent UI supplies an explicit revoke action |
| Auth client | OAuthIntrospectionClient, OAuthPrincipal, OAuthVerificationError | Additive exports independent of MCP SDK; leave existing exports unchanged |

For http://127.0.0.1:3011/mcp the metadata path is
http://127.0.0.1:3011/.well-known/oauth-protected-resource/mcp. Do not mount only
an origin-root document or misrepresent the auth issuer as the gateway. Any root
compatibility alias must reference the same resource and be separately tested.
Issuer location/port is explicitly supplied for local tests; auth's observed
default port 3000 is not a promised local deployment topology.

Token response: access_token, token_type=Bearer, expires_in=600,
scope=catalog:read; Cache-Control:no-store and Pragma:no-cache. No refresh_token
or ID token. Unknown/mismatched resource yields invalid_target. Token exchange
cannot alter consented scopes or resource; code is single-use, TTL 60 seconds.
Consent transaction TTL 10 minutes; tokens/codes are random with at least 256 bits
of entropy and stored only as hashes. Expiry is checked during reads even if DB
TTL cleanup has not run. Codes must be consumed atomically in a transaction with
token issuance; failure/retry must not allow replay to issue another token.

## Trusted introspection projection

Inactive/unknown/expired/revoked token: {active:false}, without other metadata.
An active token for this gateway must include active:true, token_type:Bearer,
iss, sub, client_id, aud (single resource URI), scope (space-separated string),
exp and iat (integer Unix seconds). These fields are an agreed stricter application
profile even where RFC 7662 fields are optional. Auth rejects legacy JWTs and
other token types rather than marking them active for this resource.

New package API:

```ts
interface OAuthPrincipal {
  issuer: string;
  subject: string;
  clientId: string;
  audience: string;
  scopes: readonly string[];
  issuedAt: number;
  expiresAt: number;
}
// Constructor uses explicit issuer, introspection URL, resource URI,
// resource-server credentials, timeout, response limit and allowed local mode.
// verifyAccessToken(rawToken: string): Promise<OAuthPrincipal>
// Error categories: invalid_token, auth_unavailable, invalid_auth_response.
```

This is not an extension of IActiveUserData: email and role are unnecessary for
catalog authorization. No default role/email or previously attached request user
is merged into this principal. Package schema validates issuer/resource/types;
gateway independently checks expected resource and expiry and requires scope.
Map clientId from client_id (never sub), expiresAt from exp, resource from aud,
and extra.subject/extra.issuer from trusted principal to SDK AuthInfo. Token stays
request-local for SDK internal context, never serialized or logged.

## Config and compatibility

Gateway config: MCP_AUTH_MODE=oauth|local-public (default oauth); MCP_RESOURCE_URL, AUTH_ISSUER_URL, AUTH_INTROSPECTION_URL,
AUTH_INTROSPECTION_CLIENT_ID, AUTH_INTROSPECTION_CLIENT_SECRET, explicit loopback
local development flag and existing catalog base URLs/port. No auto-downgrade on
missing values. local-public is explicit local testing only and cannot bypass
production rejection. URL identity comparison uses a shared documented canonical
policy (lowercase scheme/host, no query/fragment/credentials, fixed /mcp path and
no trailing slash for canonical resource); reject rather than loosely matching
host prefixes, encoded paths or a different origin/path.

Auth engine config defines that same issuer/resource, authorized resource-server
credential and registered clients with exact redirect URIs/grants/scopes. Service
credential authenticates introspection, never grants MCP tool access itself.
Allow HTTP only for explicit loopback test URLs; production transport configuration
is deferred. No secrets/examples of real tokens in committed env files.

Adding OAuth changes access to /mcp, not tool payloads. feature 002 runner must
accept an explicit bearer supplied via process environment (never CLI/logs) or
run explicitly in local-public mode; final acceptance requires OAuth mode with
real auth. Published domain packages need no changes. Auth-client change is
additive, locally packaged as 0.0.22-local.0; move the verified package to a runtime gateway
dependency after its producer/consumer checks pass. The locally pinned artifact is documented in vendor/README.md; no package release occurred.
