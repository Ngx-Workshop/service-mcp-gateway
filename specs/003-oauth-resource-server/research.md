> Historical planning inspection. The missing capabilities described below are
> now implemented; see [current local evidence](handoff.md).

# OAuth research and reuse evidence
Updated: 2026-10-12 · Source review only; no live auth verification.

## Existing owner

Inspected service-auth at f09e24655f4df07e07b3d722a578732da5bb8351;
working tree clean. Source paths below are relative to that repository, recorded
here so implementing this plan does not require reconstructing this conversation.

| Source | Observed behavior | Reuse or required change |
| --- | --- | --- |
| src/iam/authentication/authentication.controller.ts | POST /sign-up and /sign-in set accessToken cookie; GET /sign-out clears cookie; GET /validate-access-token returns boolean; GET /user-metadata returns email/role | Keep existing browser contracts. Add a separate OAuth module and login/consent browser flow in this owner |
| src/iam/authentication/authentication.service.ts | Existing password hash comparison, user lookup, JWT access/refresh generation; metadata upsert on signup | Reuse identity and credential verification; separate verification from legacy token issuance. Do not reuse generateTokens as the OAuth issuer |
| src/iam/authentication/guards/access-token.guard.ts | Cookie-only verification using configured JWT issuer/audience/secret | Existing session can identify the user at authorization UI; MCP bearer verification must be separate |
| src/iam/config/jwt.config.ts | Shared JWT secret, issuer, audience; default access TTL 3600 and refresh TTL 86400 | Leave legacy settings compatible. New OAuth resource/grants must not rely on the global legacy audience |
| src/iam/authentication/authentication.controller.ts, authentication.service.ts | Refresh route commented out; refresh helper verifies a JWT without distinct token-use binding | No usable OAuth refresh lifecycle proven. Do not expose that helper as an OAuth grant |
| src/main.ts | cookie-parser; default port 3000; binds 0.0.0.0 | Local verification must add explicit loopback/local-mode configuration in owner implementation; do not assume a safe supported auth local mode exists |
| libs/ngx-auth-client/src/ngx-auth-client.service.ts | Cookie takes priority over Bearer; forwards both cookie/header to boolean validation; locally decodes sub/email/role after validation; default remote URL; broad catch; no explicit timeout | Retain this legacy API for existing consumers; new configurable bounded introspection API is required for MCP |
| libs/ngx-auth-client/src/interfaces/active-user-data.interface.ts | sub/email/role only | New OAuth principal type needs trusted clientId, issuer, audience, scope, expiry; existing roles are not OAuth scopes |

No OAuth authorize/token/introspection/revocation routes, authorization-server
metadata, client registry, consent grants, PKCE or resource indicators were found
in src or library source. No JWKS route was found. This is an observation of the
checkout, not a claim about unseen production infrastructure.

The installed @tmdjr/ngx-auth-client 0.0.21 in the gateway was inspected separately:
its compiled ngx-auth-client.service.js has the same cookie-first/boolean-validation
behavior. It is currently a devDependency and unused by the running gateway.
Source review does not establish a future package version or a published release.

## Gateway/SDK integration evidence

Current src/bootstrap.ts binds loopback, installs localBoundary, disables Nest
body parsing and rejects production through src/mcp/catalog.config.ts.
src/mcp/mcp.controller.ts uses createMcpHandler + toNodeHandler and stateless
legacy support. Catalog owner GETs deliberately send no user credentials.

Installed @modelcontextprotocol/server 2.3.1 declares OAuthTokenVerifier,
requireBearerAuth, expectedResource, metadata and scope helpers. AuthInfo contains
clientId, scopes, expiry and resource plus extra. The installed Node bridge 2.1.1
forwards req.auth as authInfo. Thus a Nest middleware can authenticate before the
existing bridge and attach verified context without replacing tool contracts.
Do not infer clientId from sub: a client application and user are different identities.
The SDK is the resource boundary, not the authorization-server implementation.

## Standards and profile

Reviewed primary references on 2026-10-12:

- [MCP 2026-07-28 authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization): resource-server/authorization-server separation; HTTP authorization profile.
- [MCP discovery](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/authorization-server-discovery): protected resource and AS discovery.
- [MCP client registration](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/client-registration): metadata-document clients, preregistration and compatibility choices.
- [SDK v2 resource authorization](https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization): verifier seam, challenges, expiry/resource context. Confirm against installed types during implementation rather than copying examples for a different SDK version.
- [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html): protected resource metadata.
- [RFC 7662](https://www.rfc-editor.org/rfc/rfc7662.html): authenticated introspection returning active state and trusted token context.
- [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636.html): PKCE S256 binding.
- [RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html): requested resource and audience binding.
- [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html): redirect validation, secure grants and token lifecycle practices.
- [RFC 7009](https://www.rfc-editor.org/rfc/rfc7009.html): revocation.

Plan targets current modern protocol plus the gateway's existing legacy wire
transport with the same bearer gate. Supporting a legacy wire handshake does not
promise every historical client's OAuth discovery convention. A local preregistered
SDK client is the first acceptance client; metadata-document clients are a separate
acceptance case. Actual hosted ChatGPT callback registration and reachability
cannot be verified until the deployment phase; no universal client compatibility
claim is made here.

## Subsequent engine evidence

T001 completed in service-auth on 2026-10-12. oidc-provider 9.12.2 (MIT) passed
30 executable cases with Node 22.23.3, Nest 11.1.3 and a fresh isolated MongoDB
6.0.1 replica set. See owner `docs/adr/0001-oauth-engine.md` and
`specs/001-oauth-engine-spike/handoff.md`. Core native protocols plus required
application/adapter policies were proved. Atomic issuance needs replica-set
transactions. Metadata-client engine hooks were tested with a fetch Response
double; hardened remote fetching and real login/consent remain unimplemented.
The original source-review observations above remain historical and do not imply
new endpoints exist in the running auth application.
