import {
  mkdtempSync,
  writeFileSync,
  chmodSync,
  symlinkSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCatalogConfig } from '../mcp/catalog.config';
import { readPrivateSecret } from './private-secret';
describe('production profile and secret ownership', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gateway-prod-'));
  const secret = join(dir, 'secret');
  beforeAll(() => writeFileSync(secret, 'a'.repeat(43), { mode: 0o600 }));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  const env = {
    RUNTIME_PROFILE: 'production',
    NODE_ENV: 'production',
    LISTEN_HOST: '0.0.0.0',
    TRUSTED_PROXY_IPS: '10.116.0.3',
    MCP_RESOURCE_URL: 'https://mcp.example.test/mcp',
    AUTH_ISSUER_URL: 'https://auth.example.test',
    AUTH_INTROSPECTION_URL: 'https://auth.example.test/oauth/introspect',
    AUTH_INTROSPECTION_CLIENT_ID: 'gateway',
    AUTH_INTROSPECTION_SECRET_FILE: secret,
    DOCUMENT_BASE_URL: 'http://service-document:3007',
    CODING_LABS_BASE_URL: 'http://service-coding-labs:3009',
  };
  it('uses public identities independent of private ports and reads durable secret', () => {
    const config = loadCatalogConfig(env);
    expect(config.port).toBe(3011);
    expect(config.runtime.production).toBe(true);
    expect(config.auth.mode === 'oauth' && config.auth.resource).toBe(
      env.MCP_RESOURCE_URL
    );
  });
  it.each([
    { MCP_AUTH_MODE: 'local-public' },
    { MCP_LOCAL_DEV: 'true' },
    { TRUSTED_PROXY_IPS: '0.0.0.0/0' },
    { AUTH_ISSUER_URL: 'http://auth.example.test' },
    { AUTH_INTROSPECTION_CLIENT_SECRET: 'unsafe' },
    { MCP_RESOURCE_URL: 'https://mcp.example.test:3011/mcp' },
  ])('fails closed for unsafe production %o', (patch) =>
    expect(() => loadCatalogConfig({ ...env, ...patch })).toThrow()
  );
  it('rejects readable-by-others and symlink files', () => {
    chmodSync(secret, 0o644);
    expect(() => readPrivateSecret(secret)).toThrow();
    chmodSync(secret, 0o600);
    symlinkSync(secret, join(dir, 'link'));
    expect(() => readPrivateSecret(join(dir, 'link'))).toThrow();
  });
});
