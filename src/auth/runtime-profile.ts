import { isIP } from 'node:net';
export interface RuntimeProfile {
  production: boolean;
  bind: string;
  proxies: string[];
  origins: string[];
}
export function loadRuntimeProfile(env: NodeJS.ProcessEnv): RuntimeProfile {
  const profile = env.RUNTIME_PROFILE ?? 'local';
  if (!['local', 'production'].includes(profile))
    throw new Error('Invalid runtime profile');
  if (profile === 'local') {
    if (env.NODE_ENV === 'production')
      throw new Error('Production requires explicit profile');
    return { production: false, bind: '127.0.0.1', proxies: [], origins: [] };
  }
  if (
    env.NODE_ENV !== 'production' ||
    env.MCP_LOCAL_DEV === 'true' ||
    env.MCP_AUTH_MODE === 'local-public'
  )
    throw new Error('Unsafe production mode');
  const proxies = (env.TRUSTED_PROXY_IPS ?? '').split(',');
  if (!proxies.length || proxies.some((ip) => !isIP(ip)))
    throw new Error('Exact trusted proxy IPs required');
  const bind = env.LISTEN_HOST;
  if (!bind || !isIP(bind))
    throw new Error('Explicit private listener required');
  const origins = env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : [];
  for (const value of origins) {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      value !== url.origin ||
      url.username ||
      url.password ||
      url.hostname.includes('*')
    )
      throw new Error('Invalid allowed origin');
  }
  return { production: true, bind, proxies, origins };
}
