import { loadOAuthConfig } from './oauth.config';
const valid = {
  MCP_LOCAL_DEV: 'true',
  MCP_RESOURCE_URL: 'http://127.0.0.1:3011/mcp',
  AUTH_ISSUER_URL: 'http://127.0.0.1:3000',
  AUTH_INTROSPECTION_URL: 'http://127.0.0.1:3000/oauth/introspect',
  AUTH_INTROSPECTION_CLIENT_ID: 'gateway',
  AUTH_INTROSPECTION_CLIENT_SECRET: 'fixture',
};
describe('OAuth configuration', () => {
  it('defaults to OAuth without downgrading incomplete configuration', () => {
    expect(loadOAuthConfig(valid).mode).toBe('oauth');
    expect(() => loadOAuthConfig({ MCP_LOCAL_DEV: 'true' })).toThrow();
  });
  it('requires explicit local-public and rejects production in both modes', () => {
    expect(
      loadOAuthConfig({ MCP_LOCAL_DEV: 'true', MCP_AUTH_MODE: 'local-public' })
    ).toEqual({ mode: 'local-public' });
    for (const mode of ['oauth', 'local-public'])
      expect(() =>
        loadOAuthConfig({
          ...valid,
          MCP_AUTH_MODE: mode,
          NODE_ENV: 'production',
        })
      ).toThrow();
  });
  it.each([
    { MCP_RESOURCE_URL: valid.MCP_RESOURCE_URL + '/' },
    { MCP_RESOURCE_URL: 'http://localhost:3011/mcp?x=1' },
    { AUTH_ISSUER_URL: valid.AUTH_ISSUER_URL + '/' },
    { AUTH_INTROSPECTION_URL: 'http://127.0.0.1:3001/oauth/introspect' },
    { MCP_LOCAL_DEV: 'false' },
  ])('rejects noncanonical identity %o', (change) =>
    expect(() => loadOAuthConfig({ ...valid, ...change })).toThrow()
  );
});
