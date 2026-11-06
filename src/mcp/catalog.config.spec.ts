import { loadCatalogConfig } from './catalog.config';
const valid = {
  MCP_AUTH_MODE: 'local-public',
  MCP_LOCAL_DEV: 'true',
  DOCUMENT_BASE_URL: 'http://127.0.0.1:4001/',
  CODING_LABS_BASE_URL: 'http://127.0.0.1:4002',
};
describe('Local catalog configuration', () => {
  it('needs no database or authentication configuration', () => {
    expect(loadCatalogConfig(valid)).toEqual({
      documentBaseUrl: 'http://127.0.0.1:4001',
      codingLabsBaseUrl: 'http://127.0.0.1:4002',
      port: 3011,
      auth: { mode: 'local-public' },
      runtime: {
        production: false,
        bind: '127.0.0.1',
        proxies: [],
        origins: [],
      },
    });
  });
  it('requires an explicit trusted publisher URL only when forwarding is enabled', () => {
    expect(() =>
      loadCatalogConfig({ ...valid, PUBLISHING_ENABLED: 'true' })
    ).toThrow();
    expect(
      loadCatalogConfig({
        ...valid,
        PUBLISHING_ENABLED: 'true',
        AI_PUBLISHER_BASE_URL: 'http://localhost:3014/',
        // Legacy model and journal settings no longer belong to this service.
        PUBLISHING_JOURNAL_DIRECTORY: 'relative',
        PUBLISHING_MODELS_JSON: 'invalid',
      }).publisherBaseUrl
    ).toBe('http://localhost:3014');
  });
  it.each([
    '',
    'file:///etc/passwd',
    'http://user:secret@example.com',
    'http://localhost/?secret=value',
    'http://localhost/#fragment',
  ])('rejects unsafe base URL %p without exposing it', (url) => {
    expect(() =>
      loadCatalogConfig({ ...valid, DOCUMENT_BASE_URL: url })
    ).toThrow('Invalid local catalog configuration: DOCUMENT_BASE_URL');
  });
  it.each(['0', '65536', 'invalid'])('rejects invalid port %p', (PORT) => {
    expect(() => loadCatalogConfig({ ...valid, PORT })).toThrow();
  });
  it('fails closed for production mode and missing owners', () => {
    expect(() =>
      loadCatalogConfig({ ...valid, NODE_ENV: 'production' })
    ).toThrow();
    expect(() => loadCatalogConfig({})).toThrow();
  });
});
