import { z } from 'zod';

import type { LocalSyncOperation } from '@/infra/local/database';
import type { Database, Json } from '@/infra/supabase/database.types';
import { getSupabaseClient } from '@/infra/supabase/client';

const attemptPayloadSchema = z.object({
  id: z.string(),
  ownerId: z.string().uuid(),
  lessonRunId: z.string(),
  activityId: z.string(),
  status: z.string(),
  createdAt: z.string().datetime(),
});

const completionPayloadSchema = z.object({
  id: z.string(),
  ownerId: z.string().uuid(),
  lessonRunId: z.string(),
  lessonId: z.string(),
  activeLearningSeconds: z.number().int().nonnegative(),
  completedAt: z.string().datetime(),
});

const profilePayloadSchema = z.object({
  ownerId: z.string().uuid(),
  xpAwarded: z.number().int().nonnegative(),
  currentStreakDays: z.number().int().nonnegative(),
  longestStreakDays: z.number().int().nonnegative(),
  lastActivityLocalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const jsonPayloadSchema = z.record(z.string(), z.json());

function assertSuccess(result: { error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
}

export async function sendOperationToSupabase(
  operation: LocalSyncOperation,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) throw new DOMException('Synchronization cancelled.', 'AbortError');
  const client = getSupabaseClient();
  const payload = jsonPayloadSchema.parse(operation.payload) as Json;
  assertSuccess(
    await client.from('sync_operations').upsert(
      {
        id: operation.id,
        owner_id: operation.ownerId,
        kind: operation.kind,
        aggregate_id: operation.aggregateId,
        payload,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    ),
  );

  if (operation.kind === 'attempt') {
    const attempt = attemptPayloadSchema.parse(operation.payload);
    assertSuccess(
      await client.from('attempts').upsert(
        {
          id: attempt.id,
          owner_id: attempt.ownerId,
          lesson_run_id: attempt.lessonRunId,
          activity_id: attempt.activityId,
          status: attempt.status,
          created_at: attempt.createdAt,
          updated_at: attempt.createdAt,
        },
        { onConflict: 'id', ignoreDuplicates: true },
      ),
    );
  } else if (operation.kind === 'completion') {
    const completion = completionPayloadSchema.parse(operation.payload);
    assertSuccess(
      await client.rpc('complete_lesson_once', {
        p_completion_id: completion.id,
        p_lesson_run_id: completion.lessonRunId,
        p_lesson_id: completion.lessonId,
        p_active_learning_seconds: completion.activeLearningSeconds,
        p_completed_at: completion.completedAt,
      }),
    );
  } else if (operation.kind === 'profile') {
    const profile = profilePayloadSchema.parse(operation.payload);
    assertSuccess(
      await client.rpc('apply_progress_update', {
        p_event_id: operation.id,
        p_xp_awarded: profile.xpAwarded,
        p_current_streak_days: profile.currentStreakDays,
        p_longest_streak_days: profile.longestStreakDays,
        p_last_activity_local_date: profile.lastActivityLocalDate,
      }),
    );
  } else if (operation.kind === 'purchase') {
    throw new Error('Purchase entitlement synchronization requires server verification.');
  }

  if (signal.aborted) throw new DOMException('Synchronization cancelled.', 'AbortError');
  assertSuccess(await client.rpc('ack_sync_operation', { p_operation_id: operation.id }));
}

export type SupabaseSyncDatabase = Database;
