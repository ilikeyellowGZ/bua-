import { createMemoryPersistence } from '@/infra/local/database';
import {
  createDemoAdminRepository,
  createSupabaseAdminRepository,
  type SupabaseAdminClient,
} from '@/features/admin/admin.repository';

describe('demo admin repository', () => {
  it('grants access locally, since there is no real multi-tenant boundary to protect on-device', async () => {
    const repository = createDemoAdminRepository(createMemoryPersistence());
    expect(await repository.isAdmin()).toBe(true);
  });

  it('reports only what is honestly knowable locally, leaving cross-user aggregates null', async () => {
    const persistence = createMemoryPersistence();
    const repository = createDemoAdminRepository(persistence);

    const snapshot = await repository.getDashboardSnapshot();

    expect(snapshot.totalUsers).toBeNull();
    expect(snapshot.activeUsers7d).toBeNull();
    expect(snapshot.errorEvents24h).toBeNull();
    expect(snapshot.pendingSyncOperations).toBe(0);
    expect(snapshot.failedSyncOperations).toBe(0);
  });

  it('counts real pending and failed sync operations from local persistence', async () => {
    const persistence = createMemoryPersistence();
    await persistence.upsertSyncOperation({
      id: 'op-1',
      ownerId: 'owner-1',
      kind: 'attempt',
      aggregateId: 'a-1',
      payload: {},
      status: 'pending',
      attemptCount: 0,
      nextAttemptAt: 0,
      acknowledgedAt: null,
    });
    await persistence.upsertSyncOperation({
      id: 'op-2',
      ownerId: 'owner-1',
      kind: 'attempt',
      aggregateId: 'a-2',
      payload: {},
      status: 'failed',
      attemptCount: 2,
      nextAttemptAt: 0,
      acknowledgedAt: null,
    });
    await persistence.upsertSyncOperation({
      id: 'op-3',
      ownerId: 'owner-1',
      kind: 'attempt',
      aggregateId: 'a-3',
      payload: {},
      status: 'acknowledged',
      attemptCount: 0,
      nextAttemptAt: 0,
      acknowledgedAt: 1,
    });

    const repository = createDemoAdminRepository(persistence);
    const snapshot = await repository.getDashboardSnapshot();

    expect(snapshot.pendingSyncOperations).toBe(2);
    expect(snapshot.failedSyncOperations).toBe(1);
  });
});

describe('Supabase admin repository', () => {
  it('reports admin access from is_admin()', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: true, error: null });
    const client = { rpc } as unknown as SupabaseAdminClient;
    const repository = createSupabaseAdminRepository({ client });

    expect(await repository.isAdmin()).toBe(true);
    expect(rpc).toHaveBeenCalledWith('is_admin');
  });

  it('denies admin access rather than throwing when the RPC errors', async () => {
    const rpc = jest.fn().mockResolvedValue({ data: null, error: { message: 'not authenticated' } });
    const client = { rpc } as unknown as SupabaseAdminClient;
    const repository = createSupabaseAdminRepository({ client });

    expect(await repository.isAdmin()).toBe(false);
  });

  it('maps the aggregate snapshot RPC row to the typed dashboard shape', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          total_users: 42,
          active_users_7d: 10,
          lesson_completions_today: 5,
          pending_sync_operations: 3,
          failed_sync_operations: 1,
          oldest_pending_sync_seconds: 120,
          error_events_24h: 2,
          average_streak_days: 4.5,
        },
      ],
      error: null,
    });
    const client = { rpc } as unknown as SupabaseAdminClient;
    const repository = createSupabaseAdminRepository({ client });

    expect(await repository.getDashboardSnapshot()).toEqual({
      totalUsers: 42,
      activeUsers7d: 10,
      lessonCompletionsToday: 5,
      pendingSyncOperations: 3,
      failedSyncOperations: 1,
      oldestPendingSyncSeconds: 120,
      errorEvents24h: 2,
      averageStreakDays: 4.5,
    });
  });

  it('surfaces a clear error when the RPC is denied (non-admin caller)', async () => {
    const rpc = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: 'Administrator access required' } });
    const client = { rpc } as unknown as SupabaseAdminClient;
    const repository = createSupabaseAdminRepository({ client });

    await expect(repository.getDashboardSnapshot()).rejects.toThrow('Administrator access required');
  });
});
