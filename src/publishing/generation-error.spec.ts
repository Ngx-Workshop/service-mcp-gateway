import { modelError } from './generation-error';

describe('safe generation errors', () => {
  it.each([
    [{ code: 'ECONNABORTED' }, 'MODEL_TIMEOUT'],
    [{ response: { status: 401 } }, 'MODEL_ACCESS_DENIED'],
    [{ response: { status: 400 } }, 'MODEL_REQUEST_REJECTED'],
    [{ response: { status: 429 } }, 'MODEL_RATE_LIMITED'],
    [
      {
        response: {
          status: 429,
          data: { error: { code: 'insufficient_quota' } },
        },
      },
      'MODEL_QUOTA_EXHAUSTED',
    ],
    [
      {
        response: {
          status: 429,
          data: { error: { code: 'credit_balance_exhausted' } },
        },
      },
      'MODEL_QUOTA_EXHAUSTED',
    ],
    [{ response: { status: 500 } }, 'MODEL_UNAVAILABLE'],
  ])(
    'classifies provider failures without disclosing upstream data',
    (details, code) => {
      const error = modelError({
        ...details,
        isAxiosError: true,
        message: 'private key and provider body',
      });
      expect(error.code).toBe(code);
      expect(error.message).not.toContain('private');
    }
  );
  it('handles unknown errors safely', () => {
    expect(modelError(new Error('private details')).code).toBe(
      'MODEL_UNAVAILABLE'
    );
  });
});
