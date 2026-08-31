import { createConsoleMonitoringService } from '@/features/monitoring/monitoring';

describe('createConsoleMonitoringService', () => {
  it('logs a captured error with its message, stack, and context', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const monitor = createConsoleMonitoringService();

    monitor.captureError(new Error('boom'), { operationId: 'op-1' });

    expect(spy).toHaveBeenCalledWith(
      '[bua:monitoring] error',
      'boom',
      expect.objectContaining({ operationId: 'op-1', stack: expect.any(String) }),
    );
    spy.mockRestore();
  });

  it('normalizes a non-Error thrown value into a message', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const monitor = createConsoleMonitoringService();

    monitor.captureError('a plain string was thrown');

    expect(spy).toHaveBeenCalledWith(
      '[bua:monitoring] error',
      'a plain string was thrown',
      expect.anything(),
    );
    spy.mockRestore();
  });

  it('logs a message with context', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const monitor = createConsoleMonitoringService();

    monitor.captureMessage('quota nearly exhausted', { remaining: 2 });

    expect(spy).toHaveBeenCalledWith('[bua:monitoring] message', 'quota nearly exhausted', {
      remaining: 2,
    });
    spy.mockRestore();
  });

  it('logs the signed-in user id, and a clear signed-out marker when null', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    const monitor = createConsoleMonitoringService();

    monitor.setUser('user-123');
    expect(spy).toHaveBeenLastCalledWith('[bua:monitoring] user', 'user-123');

    monitor.setUser(null);
    expect(spy).toHaveBeenLastCalledWith('[bua:monitoring] user', 'signed-out');
    spy.mockRestore();
  });
});
