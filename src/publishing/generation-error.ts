import { isAxiosError } from 'axios';

const messages: Record<string, string> = {
  MODEL_NOT_CONFIGURED:
    'Draft generation is not configured. Ask the server administrator to configure the model and API key.',
  GENERATION_IMAGE_LOOKUP_FAILED:
    'Draft generation could not load workshop images. Check your administrator session and the uploader service.',
  MODEL_TIMEOUT:
    'The AI model timed out while generating the draft. Try a narrower workshop brief.',
  MODEL_ACCESS_DENIED:
    'The AI provider denied model access. Ask the server administrator to check the API key and model permissions.',
  MODEL_QUOTA_EXHAUSTED:
    'The AI project has no available quota or credits. Check the API project billing before retrying.',
  MODEL_RATE_LIMITED:
    'The AI provider is rate limiting draft generation. Wait a moment and retry.',
  MODEL_REQUEST_REJECTED:
    'The AI provider rejected the generation request. Ask the server administrator to check the model and output format.',
  MODEL_UNAVAILABLE: 'The AI provider is unavailable. Try again later.',
  MODEL_OUTPUT_INCOMPLETE:
    'The AI model did not finish the draft. Try a narrower workshop brief.',
  MODEL_REFUSED:
    'The AI model declined this workshop brief. Revise the brief and retry.',
  GENERATED_DRAFT_INVALID:
    'The AI returned a draft that failed workshop validation. Try a narrower brief or generate again.',
};

export class GenerationError extends Error {
  constructor(
    public readonly code: string,
    public readonly fields: string[] = []
  ) {
    super(messages[code] ?? 'Workshop draft generation failed.');
  }
}

export function modelError(error: unknown): GenerationError {
  if (isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
      return new GenerationError('MODEL_TIMEOUT');
    const status = error.response?.status;
    if (status === 401 || status === 403)
      return new GenerationError('MODEL_ACCESS_DENIED');
    if (status === 429) {
      const body: unknown = error.response?.data;
      const code =
        body &&
        typeof body === 'object' &&
        'error' in body &&
        body.error &&
        typeof body.error === 'object' &&
        'code' in body.error
          ? body.error.code
          : undefined;
      return new GenerationError(
        code === 'insufficient_quota' || code === 'credit_balance_exhausted'
          ? 'MODEL_QUOTA_EXHAUSTED'
          : 'MODEL_RATE_LIMITED'
      );
    }
    if (status === 400) return new GenerationError('MODEL_REQUEST_REJECTED');
  }
  return new GenerationError('MODEL_UNAVAILABLE');
}
