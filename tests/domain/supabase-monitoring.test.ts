import {
  createConsoleMonitoringService,
  createSupabaseMonitoringService,
  type SupabaseMonitoringClient,
} from '@/features/monitoring/monitoring';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'info').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

function mockClient() {
  const insert = jest.fn().mockResolvedValue({ error: null });
  const from = jest.fn().mockReturnValue({ insert });
  return { client: { from } as unknown as SupabaseMonitoringClient, insert, from };
}

describe('createSupabaseMonitoringService', () => {
  it('does not persist remotely before a user has been set', () => {
    const { client, insert } = mockClient();
    const monitor = createSupabaseMonitoringService({ client });

    monitor.captureError(new Error('too early'));

    expect(insert).not.toHaveBeenCalled();
  });

  it('persists a captured error to app_error_events once a user is set', async () => {
    const { client, from, insert } = mockClient();
    const monitor = createSupabaseMonitoringService({ client });

    monitor.setUser('user-1');
    monitor.captureError(new Error('boom'), { operationId: 'op-1' });
    await new Promise((resolve) => setImmediate(resolve));

    expect(from).toHaveBeenCalledWith('app_error_events');
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: 'user-1', kind: 'error', summary: 'boom' }),
    );
  });

  it('persists a captured message with kind "message"', async () => {
    const { client, insert } = mockClient();
    const monitor = createSupabaseMonitoringService({ client });

    monitor.setUser('user-1');
    monitor.captureMessage('quota nearly exhausted');
    await new Promise((resolve) => setImmediate(resolve));

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'message', summary: 'quota nearly exhausted' }),
    );
  });

  it('stops persisting remotely after the user is cleared', async () => {
    const { client, insert } = mockClient();
    const monitor = createSupabaseMonitoringService({ client });

    monitor.setUser('user-1');
    monitor.setUser(null);
    monitor.captureError(new Error('after sign-out'));
    await new Promise((resolve) => setImmediate(resolve));

    expect(insert).not.toHaveBeenCalled();
  });

  it('falls back to console reporting instead of throwing when the remote insert fails', async () => {
    const insert = jest.fn().mockResolvedValue({ error: { message: 'insert denied' } });
    const client = { from: jest.fn().mockReturnValue({ insert }) } as unknown as SupabaseMonitoringClient;
    const fallback = createConsoleMonitoringService();
    const spy = jest.spyOn(fallback, 'captureError');
    const monitor = createSupabaseMonitoringService({ client, fallback });

    monitor.setUser('user-1');
    monitor.captureError(new Error('boom'));
    await new Promise((resolve) => setImmediate(resolve));

    expect(spy).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ originalSummary: 'boom' }));
  });

  it('always reports to the console fallback synchronously regardless of user state', () => {
    const { client } = mockClient();
    const fallback = createConsoleMonitoringService();
    const spy = jest.spyOn(fallback, 'captureError');
    const monitor = createSupabaseMonitoringService({ client, fallback });

    monitor.captureError(new Error('boom'));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
