import { withTimeout } from '@/core/async/with-timeout';

describe('withTimeout', () => {
  it('resolves with the promise value when it settles before the timeout', async () => {
    await expect(withTimeout(Promise.resolve('real value'), 1000, 'fallback')).resolves.toBe(
      'real value',
    );
  });

  it('resolves with the fallback when the promise never settles in time', async () => {
    const neverSettles = new Promise<string>(() => undefined);
    await expect(withTimeout(neverSettles, 20, 'fallback')).resolves.toBe('fallback');
  });

  it('resolves with the fallback instead of rejecting when the promise rejects', async () => {
    await expect(
      withTimeout(Promise.reject(new Error('boom')), 1000, 'fallback'),
    ).resolves.toBe('fallback');
  });
});
