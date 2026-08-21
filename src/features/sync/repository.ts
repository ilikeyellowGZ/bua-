import type { LocalPersistence, LocalSyncOperation } from '@/infra/local/database';

export type EnqueueSyncOperation = Pick<
  LocalSyncOperation,
  'id' | 'ownerId' | 'kind' | 'aggregateId' | 'payload'
>;

export type SyncRepository = {
  enqueue(operation: EnqueueSyncOperation): Promise<void>;
  listPending(now?: number): Promise<LocalSyncOperation[]>;
  markFailed(id: string): Promise<void>;
  acknowledge(id: string): Promise<void>;
};

type SyncRepositoryOptions = {
  now?: () => number;
  baseDelayMs?: number;
  maximumDelayMs?: number;
};

export function createSyncRepository(
  persistence: LocalPersistence,
  { now = Date.now, baseDelayMs = 1_000, maximumDelayMs = 300_000 }: SyncRepositoryOptions = {},
): SyncRepository {
  return {
    async enqueue(operation) {
      await persistence.upsertSyncOperation({
        ...operation,
        status: 'pending',
        attemptCount: 0,
        nextAttemptAt: now(),
        acknowledgedAt: null,
      });
    },
    async listPending(at = now()) {
      return (await persistence.listSyncOperations())
        .filter((operation) => operation.status !== 'acknowledged' && operation.nextAttemptAt <= at)
        .sort((left, right) => left.nextAttemptAt - right.nextAttemptAt);
    },
    async markFailed(id) {
      const operation = await persistence.getSyncOperation(id);
      if (!operation || operation.status === 'acknowledged') return;
      const attemptCount = operation.attemptCount + 1;
      const delay = Math.min(maximumDelayMs, baseDelayMs * 2 ** (attemptCount - 1));
      await persistence.updateSyncOperation({
        ...operation,
        status: 'failed',
        attemptCount,
        nextAttemptAt: now() + delay,
      });
    },
    async acknowledge(id) {
      const operation = await persistence.getSyncOperation(id);
      if (!operation) return;
      await persistence.updateSyncOperation({
        ...operation,
        status: 'acknowledged',
        acknowledgedAt: operation.acknowledgedAt ?? now(),
      });
    },
  };
}
