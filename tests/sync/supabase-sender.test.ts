import { createMemoryPersistence } from '@/infra/local/database';
import {
  sendOperationToSupabase,
  type SupabaseSenderClient,
} from '@/features/sync/supabase-sender';

const ownerId = '11111111-1111-4111-8111-111111111111';

function mockClient(profileRow: Record<string, unknown>): SupabaseSenderClient {
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const rpc = jest.fn((name: string) => {
    if (name === 'apply_progress_update') {
      return Promise.resolve({ data: profileRow, error: null });
    }
    return Promise.resolve({ data: true, error: null });
  });
  return {
    from: jest.fn().mockReturnValue({ upsert }),
    rpc,
  } as unknown as SupabaseSenderClient;
}

const profileOperation = {
  id: `${ownerId}:profile:run-1`,
  ownerId,
  kind: 'profile' as const,
  aggregateId: 'run-1',
  payload: {
    ownerId,
    xpAwarded: 40,
    currentStreakDays: 3,
    longestStreakDays: 3,
    lastActivityLocalDate: '2026-08-31',
  },
  status: 'pending' as const,
  attemptCount: 0,
  nextAttemptAt: 0,
  acknowledgedAt: null,
};

describe('sendOperationToSupabase (profile sync)', () => {
  it('reports no conflict and mirrors the server-confirmed values locally when nothing raced', async () => {
    const persistence = createMemoryPersistence();
    const client = mockClient({
      total_xp: 40,
      streak_days: 3,
      longest_streak_days: 3,
      last_activity_local_date: '2026-08-31',
      updated_at: '2026-08-31T10:00:00.000Z',
    });

    const outcome = await sendOperationToSupabase(
      profileOperation,
      new AbortController().signal,
      persistence,
      { client },
    );

    expect(outcome).toEqual({ conflictResolved: false });
    expect(await persistence.getProgress(ownerId)).toMatchObject({
      totalXp: 40,
      currentStreakDays: 3,
      longestStreakDays: 3,
      lastActivityLocalDate: '2026-08-31',
    });
  });

  it('detects a last-write-wins conflict and corrects local progress to the server-resolved truth', async () => {
    const persistence = createMemoryPersistence();
    // Simulate a second device having already synced a fresher streak before this operation lands.
    const client = mockClient({
      total_xp: 90,
      streak_days: 5,
      longest_streak_days: 5,
      last_activity_local_date: '2026-09-02',
      updated_at: '2026-09-02T08:00:00.000Z',
    });

    const outcome = await sendOperationToSupabase(
      profileOperation,
      new AbortController().signal,
      persistence,
      { client },
    );

    expect(outcome).toEqual({ conflictResolved: true });
    expect(await persistence.getProgress(ownerId)).toMatchObject({
      totalXp: 90,
      currentStreakDays: 5,
      longestStreakDays: 5,
      lastActivityLocalDate: '2026-09-02',
    });
  });

  it('acknowledges the sync operation after a successful profile reconciliation', async () => {
    const persistence = createMemoryPersistence();
    const client = mockClient({
      total_xp: 40,
      streak_days: 3,
      longest_streak_days: 3,
      last_activity_local_date: '2026-08-31',
      updated_at: '2026-08-31T10:00:00.000Z',
    });

    await sendOperationToSupabase(profileOperation, new AbortController().signal, persistence, {
      client,
    });

    expect(client.rpc).toHaveBeenCalledWith(
      'ack_sync_operation',
      expect.objectContaining({ p_operation_id: profileOperation.id }),
    );
  });
});
