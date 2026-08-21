import type { LocalSyncOperation } from '@/infra/local/database';
import type { SyncRepository } from '@/features/sync/repository';

export type ReconcileResult = {
  acknowledged: number;
  failed: number;
  cancelled: boolean;
};

export async function reconcilePendingOperations(
  signal: AbortSignal,
  repository: SyncRepository,
  send: (operation: LocalSyncOperation, signal: AbortSignal) => Promise<void>,
): Promise<ReconcileResult> {
  const result: ReconcileResult = { acknowledged: 0, failed: 0, cancelled: false };
  if (signal.aborted) return { ...result, cancelled: true };

  for (const operation of await repository.listPending()) {
    if (signal.aborted) return { ...result, cancelled: true };
    try {
      await send(operation, signal);
      if (signal.aborted) return { ...result, cancelled: true };
      await repository.acknowledge(operation.id);
      result.acknowledged += 1;
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        return { ...result, cancelled: true };
      }
      await repository.markFailed(operation.id);
      result.failed += 1;
    }
  }
  return result;
}
