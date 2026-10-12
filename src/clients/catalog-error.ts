import { isAxiosError } from 'axios';
import { z } from 'zod';
import { toolErrorSchema } from '../tools/catalog.schemas';

type ErrorCode = z.infer<typeof toolErrorSchema>['error']['code'];
export class CatalogError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string
  ) {
    super(message);
  }
}
export function safeCatalogError(error: unknown): CatalogError {
  if (error instanceof CatalogError) return error;
  if (error instanceof z.ZodError)
    return new CatalogError(
      'UPSTREAM_INVALID_RESPONSE',
      'The catalog service returned invalid data.'
    );
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
      return new CatalogError(
        'UPSTREAM_TIMEOUT',
        'The catalog service timed out.'
      );
    if (error.response?.status === 404)
      return new CatalogError(
        'NOT_FOUND',
        'The requested catalog item was not found.'
      );
    if (error.response?.status === 401 || error.response?.status === 403)
      return new CatalogError(
        'FORBIDDEN',
        'The catalog service denied this read.'
      );
    return new CatalogError(
      'UPSTREAM_UNAVAILABLE',
      'The catalog service is unavailable.'
    );
  }
  return new CatalogError(
    'INTERNAL_ERROR',
    'The catalog request could not be completed.'
  );
}
