import type { ConnectivityMonitor } from '@/features/sync/connectivity';
import { reconcilePendingOperations, type ReconcileResult, type SendOutcome } from '@/features/sync/reconcile';
import type { SyncRepository } from '@/features/sync/repository';
import type { LocalSyncOperation } from '@/infra/local/database';

export type SyncOrchestrator = {
  /** Runs a reconciliation pass now. Concurrent calls share the same in-flight pass. */
  syncNow(): Promise<ReconcileResult>;
  /** Syncs once immediately if online, then again on every offline→online transition. */
  start(): () => void;
};

export function createSyncOrchestrator(
  repository: SyncRepository,
  send: (operation: LocalSyncOperation, signal: AbortSignal) => Promise<SendOutcome | void>,
  connectivity: ConnectivityMonitor,
): SyncOrchestrator {
  let inFlight: Promise<ReconcileResult> | null = null;
  let controller: AbortController | null = null;

  const syncNow = (): Promise<ReconcileResult> => {
    if (inFlight) return inFlight;
    controller = new AbortController();
    const signal = controller.signal;
    inFlight = reconcilePendingOperations(signal, repository, send).finally(() => {
      inFlight = null;
      controller = null;
    });
    return inFlight;
  };

  return {
    syncNow,
    start() {
      let previousOnline: boolean | null = null;
      let stopped = false;

      const unsubscribe = connectivity.subscribe((online) => {
        if (stopped) return;
        if (online && previousOnline !== true) void syncNow();
        previousOnline = online;
      });

      void connectivity.isOnline().then((online) => {
        if (stopped) return;
        previousOnline = online;
        if (online) void syncNow();
      });

      return () => {
        stopped = true;
        unsubscribe();
        controller?.abort();
      };
    },
  };
}
