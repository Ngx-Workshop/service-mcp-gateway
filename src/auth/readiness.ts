import type { CatalogConfig } from '../mcp/catalog.config';
export async function validateDependencies(
  config: CatalogConfig
): Promise<void> {
  if (config.auth.mode !== 'oauth')
    throw new Error('OAuth readiness requires issuer');
  const issuer = config.auth.issuer;
  try {
    await Promise.all(
      [
        config.documentBaseUrl + '/navigation/sections',
        config.codingLabsBaseUrl + '/published-labs',
        issuer + '/.well-known/oauth-authorization-server',
      ].map(async (url, index) => {
        const response = await fetch(url, {
          redirect: 'error',
          signal: AbortSignal.timeout(3000),
        });
        if (
          response.status !== 200 ||
          !response.headers.get('content-type')?.includes('application/json')
        ) {
          await response.body?.cancel();
          throw new Error();
        }
        if (index === 2) {
          // Bound discovery independently of catalog response limits.
          const reader = response.body!.getReader();
          let bytes = 0;
          const chunks: Uint8Array[] = [];
          while (true) {
            const item = await reader.read();
            if (item.done) break;
            bytes += item.value.length;
            if (bytes > 65536) {
              await reader.cancel();
              throw new Error();
            }
            chunks.push(item.value);
          }
          const metadata = JSON.parse(
            Buffer.concat(chunks).toString()
          ) as Record<string, unknown>;
          if (
            metadata.issuer !== issuer ||
            metadata.introspection_endpoint !== issuer + '/oauth/introspect'
          )
            throw new Error();
        } else await response.body?.cancel();
      })
    );
  } catch {
    throw new Error('Production dependencies not ready');
  }
}
