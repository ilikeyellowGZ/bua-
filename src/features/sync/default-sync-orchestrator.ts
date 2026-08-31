import { createAlwaysOnlineMonitor } from '@/features/sync/connectivity';
import { createSyncRepository } from '@/features/sync/repository';
import { createSyncOrchestrator, type SyncOrchestrator } from '@/features/sync/sync-orchestrator';
import { sendOperationToSupabase } from '@/features/sync/supabase-sender';
import { getLocalPersistence } from '@/infra/local/persistence-singleton';

let orchestratorPromise: Promise<SyncOrchestrator> | null = null;

export function getSyncOrchestrator(): Promise<SyncOrchestrator> {
  if (!orchestratorPromise) {
    orchestratorPromise = getLocalPersistence().then((persistence) => {
      const repository = createSyncRepository(persistence);
      return createSyncOrchestrator(
        repository,
        (operation, signal) => sendOperationToSupabase(operation, signal, persistence),
        createAlwaysOnlineMonitor(),
      );
    });
  }
  return orchestratorPromise;
}
