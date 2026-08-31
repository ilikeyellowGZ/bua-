import {
  createConsoleMonitoringService,
  createSentryMonitoringService,
  type SentryClient,
} from '@/features/monitoring/monitoring';

function mockSentry(): SentryClient {
  return {
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
  } as unknown as SentryClient;
}

describe('createSentryMonitoringService', () => {
  it('initializes Sentry once with the configured DSN', () => {
    const sentry = mockSentry();
    createSentryMonitoringService({ dsn: 'https://example.ingest.sentry.io/1', sentry });
    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://example.ingest.sentry.io/1' }),
    );
  });

  it('reports a captured error to Sentry with a suggested fix attached', () => {
    const sentry = mockSentry();
    const monitor = createSentryMonitoringService({ dsn: 'https://example.ingest.sentry.io/1', sentry });

    monitor.captureError(new Error('network request failed'), { operationId: 'op-1' });

    expect(sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({ operationId: 'op-1', suggestedFix: expect.any(String) }),
      }),
    );
  });

  it('also reports through the fallback service, so console/Supabase telemetry keeps working', () => {
    const sentry = mockSentry();
    const fallback = createConsoleMonitoringService();
    const spy = jest.spyOn(fallback, 'captureError');
    const monitor = createSentryMonitoringService({
      dsn: 'https://example.ingest.sentry.io/1',
      sentry,
      fallback,
    });

    monitor.captureError(new Error('boom'));

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('forwards the user id to Sentry, and clears it on sign-out', () => {
    const sentry = mockSentry();
    const monitor = createSentryMonitoringService({ dsn: 'https://example.ingest.sentry.io/1', sentry });

    monitor.setUser('user-1');
    expect(sentry.setUser).toHaveBeenCalledWith({ id: 'user-1' });

    monitor.setUser(null);
    expect(sentry.setUser).toHaveBeenCalledWith(null);
  });

  it('reports a captured message to Sentry', () => {
    const sentry = mockSentry();
    const monitor = createSentryMonitoringService({ dsn: 'https://example.ingest.sentry.io/1', sentry });

    monitor.captureMessage('quota nearly exhausted', { remaining: 2 });

    expect(sentry.captureMessage).toHaveBeenCalledWith(
      'quota nearly exhausted',
      expect.objectContaining({ extra: { remaining: 2 } }),
    );
  });
});
