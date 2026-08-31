import type { LocalPersistence } from '@/infra/local/database';
import { getLocalPersistence } from '@/infra/local/persistence-singleton';
import { getSupabaseClient } from '@/infra/supabase/client';

export type AdminDashboardSnapshot = {
  totalUsers: number | null;
  activeUsers7d: number | null;
  lessonCompletionsToday: number | null;
  pendingSyncOperations: number;
  failedSyncOperations: number;
  oldestPendingSyncSeconds: number | null;
  errorEvents24h: number | null;
  averageStreakDays: number | null;
};

export type AdminRepository = {
  isAdmin(): Promise<boolean>;
  getDashboardSnapshot(): Promise<AdminDashboardSnapshot>;
};

/**
 * Demo mode has no real multi-tenant boundary, so there is nothing to protect
 * by denying access locally. It reports only what is honestly knowable from
 * this device's own local state; cross-user aggregates are null, not faked.
 */
export function createDemoAdminRepository(persistence: LocalPersistence): AdminRepository {
  return {
    async isAdmin() {
      return true;
    },
    async getDashboardSnapshot() {
      const operations = await persistence.listSyncOperations();
      const pending = operations.filter((operation) => operation.status !== 'acknowledged');
      const failed = operations.filter((operation) => operation.status === 'failed');
      return {
        totalUsers: null,
        activeUsers7d: null,
        lessonCompletionsToday: null,
        pendingSyncOperations: pending.length,
        failedSyncOperations: failed.length,
        oldestPendingSyncSeconds: null,
        errorEvents24h: null,
        averageStreakDays: null,
      };
    },
  };
}

export type SupabaseAdminClient = Pick<ReturnType<typeof getSupabaseClient>, 'rpc'>;

type SupabaseAdminRepositoryOptions = {
  client?: SupabaseAdminClient;
};

export function createSupabaseAdminRepository({
  client = getSupabaseClient(),
}: SupabaseAdminRepositoryOptions = {}): AdminRepository {
  return {
    async isAdmin() {
      const { data, error } = await client.rpc('is_admin');
      if (error) return false;
      return Boolean(data);
    },
    async getDashboardSnapshot() {
      const { data, error } = await client.rpc('admin_dashboard_snapshot');
      if (error) throw new Error(error.message);
      const row = data?.[0];
      if (!row) throw new Error('Admin dashboard snapshot returned no data.');
      return {
        totalUsers: row.total_users,
        activeUsers7d: row.active_users_7d,
        lessonCompletionsToday: row.lesson_completions_today,
        pendingSyncOperations: row.pending_sync_operations,
        failedSyncOperations: row.failed_sync_operations,
        oldestPendingSyncSeconds: row.oldest_pending_sync_seconds,
        errorEvents24h: row.error_events_24h,
        averageStreakDays: row.average_streak_days,
      };
    },
  };
}

let adminRepositoryPromise: Promise<AdminRepository> | null = null;

export function getAdminRepository(): Promise<AdminRepository> {
  if (!adminRepositoryPromise) {
    adminRepositoryPromise =
      process.env.EXPO_PUBLIC_DEMO_MODE === 'false'
        ? Promise.resolve(createSupabaseAdminRepository())
        : getLocalPersistence().then(createDemoAdminRepository);
  }
  return adminRepositoryPromise;
}
