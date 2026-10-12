import { isIP } from 'node:net';
import { loadRuntimeProfile } from './runtime-profile';
import { readPrivateSecret } from './private-secret';
export type OAuthConfig =
  | { mode: 'local-public' }
  | {
      mode: 'oauth';
      issuer: string;
      resource: string;
      endpoint: string;
      clientId: string;
      clientSecret: string;
    };
export function loadOAuthConfig(env: NodeJS.ProcessEnv): OAuthConfig {
  const production = loadRuntimeProfile(env).production;
  if (!production && env.MCP_LOCAL_DEV !== 'true')
    throw new Error('OAuth gateway requires explicit local development');
  const mode = env.MCP_AUTH_MODE ?? 'oauth';
  if (mode === 'local-public') return { mode };
  if (mode !== 'oauth') throw new Error('Invalid MCP_AUTH_MODE');
  try {
    const resource = new URL(env.MCP_RESOURCE_URL ?? ''),
      issuer = new URL(env.AUTH_ISSUER_URL ?? ''),
      endpoint = new URL(env.AUTH_INTROSPECTION_URL ?? '');
    for (const url of [resource, issuer, endpoint])
      if (
        (production
          ? url.protocol !== 'https:' ||
            url.port !== '' ||
            isIP(url.hostname.replace(/^\[|\]$/g, '')) ||
            url.hostname === 'localhost' ||
            url.hostname.endsWith('.localhost')
          : url.protocol !== 'http:' ||
            !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        throw new Error();
    if (
      env.MCP_RESOURCE_URL !== resource.href ||
      resource.pathname !== '/mcp' ||
      (!production &&
        Number(resource.port || 80) !== Number(env.PORT ?? 3011)) ||
      env.AUTH_ISSUER_URL !== issuer.origin ||
      issuer.pathname !== '/' ||
      endpoint.origin !== issuer.origin ||
      endpoint.pathname !== '/oauth/introspect' ||
      env.AUTH_INTROSPECTION_URL !== endpoint.href ||
      !env.AUTH_INTROSPECTION_CLIENT_ID ||
      env.AUTH_INTROSPECTION_CLIENT_ID.includes(':') ||
      (production
        ? !env.AUTH_INTROSPECTION_SECRET_FILE ||
          !!env.AUTH_INTROSPECTION_CLIENT_SECRET
        : !env.AUTH_INTROSPECTION_CLIENT_SECRET)
    )
      throw new Error();
    return {
      mode,
      issuer: issuer.origin,
      resource: resource.href,
      endpoint: endpoint.href,
      clientId: env.AUTH_INTROSPECTION_CLIENT_ID,
      clientSecret: production
        ? readPrivateSecret(env.AUTH_INTROSPECTION_SECRET_FILE!)
        : env.AUTH_INTROSPECTION_CLIENT_SECRET!,
    };
  } catch {
    throw new Error('Invalid OAuth gateway configuration');
  }
}
