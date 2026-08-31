import { createMemoryPersistence } from '@/infra/local/database';
import { createSyncRepository } from '@/features/sync/repository';
import { createSyncOrchestrator } from '@/features/sync/sync-orchestrator';
import type { ConnectivityMonitor, ConnectivityListener } from '@/features/sync/connectivity';

const ownerId = '11111111-1111-4111-8111-111111111111';

function createFakeConnectivity(initialOnline: boolean) {
  let online = initialOnline;
  const listeners = new Set<ConnectivityListener>();
  const monitor: ConnectivityMonitor = {
    async isOnline() {
      return online;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return {
    monitor,
    emit(next: boolean) {
      online = next;
      for (const listener of listeners) listener(next);
    },
    listenerCount: () => listeners.size,
  };
}

async function seedPendingOperation(repository: ReturnType<typeof createSyncRepository>) {
  await repository.enqueue({
    id: 'operation-1',
    ownerId,
    kind: 'attempt',
    aggregateId: 'attempt-1',
    payload: {},
  });
}

describe('SyncOrchestrator', () => {
  it('syncs immediately on start when already online', async () => {
    const repository = createSyncRepository(createMemoryPersistence());
    await seedPendingOperation(repository);
    const send = jest.fn().mockResolvedValue(undefined);
    const { monitor } = createFakeConnectivity(true);

    const orchestrator = createSyncOrchestrator(repository, send, monitor);
    const stop = orchestrator.start();
    await new Promise((resolve) => setImmediate(resolve));

    expect(send).toHaveBeenCalledTimes(1);
    stop();
  });

  it('does not sync on start while offline, but syncs on the offline-to-online transition', async () => {
    const repository = createSyncRepository(createMemoryPersistence());
    await seedPendingOperation(repository);
    const send = jest.fn().mockResolvedValue(undefined);
    const { monitor, emit } = createFakeConnectivity(false);

    const orchestrator = createSyncOrchestrator(repository, send, monitor);
    const stop = orchestrator.start();
    await new Promise((resolve) => setImmediate(resolve));
    expect(send).not.toHaveBeenCalled();

    emit(true);
    await new Promise((resolve) => setImmediate(resolve));
    expect(send).toHaveBeenCalledTimes(1);
    stop();
  });

  it('does not re-sync on a repeated online notification with no offline transition in between', async () => {
    const repository = createSyncRepository(createMemoryPersistence());
    await seedPendingOperation(repository);
    const send = jest.fn().mockResolvedValue(undefined);
    const { monitor, emit } = createFakeConnectivity(true);

    const orchestrator = createSyncOrchestrator(repository, send, monitor);
    const stop = orchestrator.start();
    await new Promise((resolve) => setImmediate(resolve));
    expect(send).toHaveBeenCalledTimes(1);

    emit(true);
    await new Promise((resolve) => setImmediate(resolve));
    expect(send).toHaveBeenCalledTimes(1);
    stop();
  });

  it('shares one in-flight reconciliation pass across concurrent syncNow calls', async () => {
    const repository = createSyncRepository(createMemoryPersistence());
    await seedPendingOperation(repository);
    let resolveSend: () => void = () => undefined;
    const send = jest.fn().mockImplementation(
      () => new Promise<void>((resolve) => (resolveSend = resolve)),
    );
    const { monitor } = createFakeConnectivity(true);
    const orchestrator = createSyncOrchestrator(repository, send, monitor);

    const first = orchestrator.syncNow();
    const second = orchestrator.syncNow();
    await new Promise((resolve) => setImmediate(resolve));
    resolveSend();
    await Promise.all([first, second]);

    expect(send).toHaveBeenCalledTimes(1);
  });

  it('stops listening and aborts in-flight work once stopped', async () => {
    const repository = createSyncRepository(createMemoryPersistence());
    await seedPendingOperation(repository);
    const send = jest.fn().mockResolvedValue(undefined);
    const { monitor, emit, listenerCount } = createFakeConnectivity(false);

    const orchestrator = createSyncOrchestrator(repository, send, monitor);
    const stop = orchestrator.start();
    expect(listenerCount()).toBe(1);

    stop();
    expect(listenerCount()).toBe(0);

    emit(true);
    await new Promise((resolve) => setImmediate(resolve));
    expect(send).not.toHaveBeenCalled();
  });
});
