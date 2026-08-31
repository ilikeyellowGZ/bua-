import { createMemoryPersistence } from '@/infra/local/database';
import { createProgressRepository } from '@/features/lesson-runner/progress.repository';
import { reconcilePendingOperations } from '@/features/sync/reconcile';
import { createSyncRepository } from '@/features/sync/repository';

const ownerId = '11111111-1111-4111-8111-111111111111';

describe('offline-first progress and synchronization', () => {
  it('persists attempts locally before network work and restores after repository restart', async () => {
    const persistence = createMemoryPersistence();
    const first = createProgressRepository(persistence);

    await first.saveAttempt({
      id: 'attempt-local-1',
      ownerId,
      lessonRunId: 'run-local-1',
      activityId: 'activity-introduce-listen',
      status: 'correct',
      createdAt: '2026-08-21T10:00:00.000Z',
    });

    const restarted = createProgressRepository(persistence);
    expect(await restarted.getAttempts('run-local-1')).toHaveLength(1);
    expect(await persistence.listSyncOperations()).toEqual([
      expect.objectContaining({
        id: `${ownerId}:attempt:attempt-local-1`,
        status: 'pending',
      }),
    ]);
  });

  it('deduplicates local completion and its outbox operation by stable lesson run ID', async () => {
    const persistence = createMemoryPersistence();
    const repository = createProgressRepository(persistence);
    const completion = {
      id: 'completion-local-1',
      ownerId,
      lessonRunId: 'run-local-1',
      lessonId: 'lesson-introduce-yourself',
      activeLearningSeconds: 720,
      completedAt: '2026-08-21T10:12:00.000Z',
    };

    await repository.completeLesson(completion);
    await repository.completeLesson({ ...completion, id: 'completion-duplicate' });

    expect(await repository.getCompletion('run-local-1')).toMatchObject({
      id: 'completion-local-1',
    });
    expect(await persistence.listSyncOperations()).toHaveLength(1);
  });

  it('retries with bounded exponential backoff and acknowledges on success', async () => {
    const persistence = createMemoryPersistence();
    const sync = createSyncRepository(persistence, { now: () => 1_000, baseDelayMs: 1_000 });
    await sync.enqueue({
      id: 'operation-retry',
      ownerId,
      kind: 'attempt',
      aggregateId: 'attempt-retry',
      payload: {},
    });

    await sync.markFailed('operation-retry');
    expect(await sync.listPending(1_999)).toHaveLength(0);
    expect(await sync.listPending(2_000)).toHaveLength(1);

    await sync.acknowledge('operation-retry');
    expect(await sync.listPending(10_000)).toHaveLength(0);
  });

  it('cancels reconciliation and never acknowledges an unprocessed operation', async () => {
    const persistence = createMemoryPersistence();
    const sync = createSyncRepository(persistence, { now: () => 1_000 });
    await sync.enqueue({
      id: 'operation-cancelled',
      ownerId,
      kind: 'attempt',
      aggregateId: 'attempt-cancelled',
      payload: {},
    });
    const controller = new AbortController();
    controller.abort();

    const result = await reconcilePendingOperations(controller.signal, sync, async () => {
      throw new Error('must not be called');
    });

    expect(result).toEqual({ acknowledged: 0, failed: 0, conflictsResolved: 0, cancelled: true });
    expect(await sync.listPending(1_000)).toHaveLength(1);
  });

  it('acknowledges a server-synced operation exactly once', async () => {
    const persistence = createMemoryPersistence();
    const sync = createSyncRepository(persistence, { now: () => 1_000 });
    await sync.enqueue({
      id: 'operation-success',
      ownerId,
      kind: 'completion',
      aggregateId: 'run-success',
      payload: {},
    });
    const send = jest.fn().mockResolvedValue(undefined);

    expect(await reconcilePendingOperations(new AbortController().signal, sync, send)).toEqual({
      acknowledged: 1,
      failed: 0,
      conflictsResolved: 0,
      cancelled: false,
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(await sync.listPending(2_000)).toHaveLength(0);
  });

  it('reports a real send failure to monitoring before marking the operation failed', async () => {
    const persistence = createMemoryPersistence();
    const sync = createSyncRepository(persistence, { now: () => 1_000 });
    await sync.enqueue({
      id: 'operation-broken',
      ownerId,
      kind: 'attempt',
      aggregateId: 'attempt-broken',
      payload: {},
    });
    const send = jest.fn().mockRejectedValue(new Error('network unreachable'));
    const captureError = jest.fn();

    const result = await reconcilePendingOperations(new AbortController().signal, sync, send, {
      captureError,
    });

    expect(result).toEqual({ acknowledged: 0, failed: 1, conflictsResolved: 0, cancelled: false });
    expect(captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ operationId: 'operation-broken', kind: 'attempt' }),
    );
  });
});
