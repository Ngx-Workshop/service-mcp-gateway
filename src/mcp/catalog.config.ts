import { isAbsolute } from 'node:path';
import { loadRuntimeProfile } from '../auth/runtime-profile';
import { loadOAuthConfig } from '../auth/oauth.config';
import { z } from 'zod';
export const REQUEST_BYTES = 64 * 1024;
export const RESPONSE_BYTES = 2 * 1024 * 1024;
export const UPSTREAM_TIMEOUT_MS = 5000;
export const CATALOG_CONFIG = Symbol('CATALOG_CONFIG');
const upstreamUrl = z
  .string()
  .url()
  .refine((value) => {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return false;
    }
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  }, 'Use a trusted HTTP(S) base URL without credentials, query or fragment');
const configSchema = z.object({
  DOCUMENT_BASE_URL: upstreamUrl,
  CODING_LABS_BASE_URL: upstreamUrl,
  PORT: z.coerce.number().int().min(1).max(65535).default(3011),
  NODE_ENV: z.string().optional(),
});
export function loadCatalogConfig(environment: NodeJS.ProcessEnv) {
  const parsed = configSchema.safeParse(environment);
  if (!parsed.success) {
    const fields = [
      ...new Set(
        parsed.error.issues.map((issue) => issue.path.join('.') || 'NODE_ENV')
      ),
    ];
    throw new Error(
      `Invalid local catalog configuration: ${fields.join(', ')}`
    );
  }
  return {
    documentBaseUrl: parsed.data.DOCUMENT_BASE_URL.replace(/\/$/, ''),
    codingLabsBaseUrl: parsed.data.CODING_LABS_BASE_URL.replace(/\/$/, ''),
    publishing:
      environment.PUBLISHING_ENABLED === 'true'
        ? {
            assessmentBaseUrl: upstreamUrl
              .parse(environment.ASSESSMENT_BASE_URL)
              .replace(/\/$/, ''),
            uploaderBaseUrl: upstreamUrl
              .parse(environment.UPLOADER_BASE_URL)
              .replace(/\/$/, ''),
            journalDirectory: z
              .string()
              .min(1)
              .refine(
                isAbsolute,
                'Use an absolute publishing journal directory'
              )
              .parse(environment.PUBLISHING_JOURNAL_DIRECTORY),
            model: environment.PUBLISHING_MODEL,
            apiKey: environment.OPENAI_API_KEY,
          }
        : undefined,
    port: parsed.data.PORT,
    auth: loadOAuthConfig(environment),
    runtime: loadRuntimeProfile(environment),
  };
}
type LoadedConfig = ReturnType<typeof loadCatalogConfig>;
export type CatalogConfig = Omit<LoadedConfig, 'publishing'> & {
  publishing?: LoadedConfig['publishing'];
};
