import type { LocalSyncOperation } from '@/infra/local/database';
import type { SyncRepository } from '@/features/sync/repository';
import { monitoringService, type MonitoringService } from '@/features/monitoring/monitoring';

export type SendOutcome = { conflictResolved?: boolean };

export type ReconcileResult = {
  acknowledged: number;
  failed: number;
  conflictsResolved: number;
  cancelled: boolean;
};

export async function reconcilePendingOperations(
  signal: AbortSignal,
  repository: SyncRepository,
  send: (operation: LocalSyncOperation, signal: AbortSignal) => Promise<SendOutcome | void>,
  monitor: Pick<MonitoringService, 'captureError'> = monitoringService,
): Promise<ReconcileResult> {
  const result: ReconcileResult = {
    acknowledged: 0,
    failed: 0,
    conflictsResolved: 0,
    cancelled: false,
  };
  if (signal.aborted) return { ...result, cancelled: true };

  for (const operation of await repository.listPending()) {
    if (signal.aborted) return { ...result, cancelled: true };
    try {
      const outcome = await send(operation, signal);
      if (signal.aborted) return { ...result, cancelled: true };
      await repository.acknowledge(operation.id);
      result.acknowledged += 1;
      if (outcome?.conflictResolved) result.conflictsResolved += 1;
    } catch (error) {
      if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
        return { ...result, cancelled: true };
      }
      monitor.captureError(error, {
        operationId: operation.id,
        kind: operation.kind,
        attemptCount: operation.attemptCount,
      });
      await repository.markFailed(operation.id);
      result.failed += 1;
    }
  }
  return result;
}
