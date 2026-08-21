import type {
  LocalAttempt,
  LocalCompletion,
  LocalPersistence,
  LocalSyncOperation,
} from '@/infra/local/database';

const pendingOperation = (
  ownerId: string,
  kind: LocalSyncOperation['kind'],
  aggregateId: string,
  payload: Record<string, unknown>,
): LocalSyncOperation => ({
  id: `${ownerId}:${kind}:${aggregateId}`,
  ownerId,
  kind,
  aggregateId,
  payload,
  status: 'pending',
  attemptCount: 0,
  nextAttemptAt: 0,
  acknowledgedAt: null,
});

export type ProgressRepository = {
  saveAttempt(attempt: LocalAttempt): Promise<void>;
  getAttempts(lessonRunId: string): Promise<LocalAttempt[]>;
  completeLesson(completion: LocalCompletion): Promise<LocalCompletion>;
  getCompletion(lessonRunId: string): Promise<LocalCompletion | null>;
};

export function createProgressRepository(persistence: LocalPersistence): ProgressRepository {
  return {
    async saveAttempt(attempt) {
      await persistence.transaction(async (store) => {
        await store.upsertAttempt(attempt);
        await store.upsertSyncOperation(
          pendingOperation(attempt.ownerId, 'attempt', attempt.id, { ...attempt }),
        );
      });
    },
    getAttempts(lessonRunId) {
      return persistence.listAttempts(lessonRunId);
    },
    async completeLesson(completion) {
      return persistence.transaction(async (store) => {
        const stored = await store.insertCompletionOnce(completion);
        await store.upsertSyncOperation(
          pendingOperation(completion.ownerId, 'completion', completion.lessonRunId, {
            ...stored,
          }),
        );
        return stored;
      });
    },
    getCompletion(lessonRunId) {
      return persistence.getCompletion(lessonRunId);
    },
  };
}
