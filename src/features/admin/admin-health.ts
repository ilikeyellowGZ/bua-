import type { AdminDashboardSnapshot } from '@/features/admin/admin.repository';

export type HealthStatus = 'ok' | 'warning' | 'critical';

const STALE_SYNC_THRESHOLD_SECONDS = 60 * 60;

export function computeHealthStatus(snapshot: AdminDashboardSnapshot): HealthStatus {
  if ((snapshot.failedSyncOperations ?? 0) > 0 || (snapshot.errorEvents24h ?? 0) > 0) {
    return 'critical';
  }
  if (
    (snapshot.oldestPendingSyncSeconds ?? 0) > STALE_SYNC_THRESHOLD_SECONDS ||
    (snapshot.pendingSyncOperations ?? 0) > 0
  ) {
    return 'warning';
  }
  return 'ok';
}
