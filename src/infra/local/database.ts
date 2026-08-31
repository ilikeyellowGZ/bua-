import { localDatabaseName, localMigrations } from '@/infra/local/migrations';

export type LocalAttempt = {
  id: string;
  ownerId: string;
  lessonRunId: string;
  activityId: string;
  status: string;
  createdAt: string;
};

export type LocalCompletion = {
  id: string;
  ownerId: string;
  lessonRunId: string;
  lessonId: string;
  activeLearningSeconds: number;
  completedAt: string;
};

export type LocalProgress = {
  ownerId: string;
  totalXp: number;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityLocalDate: string;
  updatedAt: string;
};

export type LocalReviewItem = {
  ownerId: string;
  itemId: string;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  updatedAt: string;
};

export type LocalSyncOperation = {
  id: string;
  ownerId: string;
  kind: 'attempt' | 'completion' | 'profile' | 'reminder' | 'purchase';
  aggregateId: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'failed' | 'acknowledged';
  attemptCount: number;
  nextAttemptAt: number;
  acknowledgedAt: number | null;
};

export type LocalPersistence = {
  transaction<T>(work: (store: LocalPersistence) => Promise<T>): Promise<T>;
  upsertAttempt(attempt: LocalAttempt): Promise<void>;
  listAttempts(lessonRunId: string): Promise<LocalAttempt[]>;
  insertCompletionOnce(completion: LocalCompletion): Promise<LocalCompletion>;
  getCompletion(lessonRunId: string): Promise<LocalCompletion | null>;
  getProgress(ownerId: string): Promise<LocalProgress | null>;
  upsertProgress(progress: LocalProgress): Promise<void>;
  upsertReviewItem(item: LocalReviewItem): Promise<void>;
  getReviewItem(ownerId: string, itemId: string): Promise<LocalReviewItem | null>;
  listDueReviewItems(ownerId: string, at: string): Promise<LocalReviewItem[]>;
  upsertSyncOperation(operation: LocalSyncOperation): Promise<void>;
  getSyncOperation(id: string): Promise<LocalSyncOperation | null>;
  listSyncOperations(): Promise<LocalSyncOperation[]>;
  updateSyncOperation(operation: LocalSyncOperation): Promise<void>;
};

type MemoryState = {
  attempts: Map<string, LocalAttempt>;
  completions: Map<string, LocalCompletion>;
  progress: Map<string, LocalProgress>;
  reviewItems: Map<string, LocalReviewItem>;
  operations: Map<string, LocalSyncOperation>;
};

const reviewItemKey = (ownerId: string, itemId: string) => `${ownerId}:${itemId}`;

const clone = <T>(value: T): T => structuredClone(value);

function memoryStore(state: MemoryState): LocalPersistence {
  return {
    async transaction(work) {
      const draft: MemoryState = {
        attempts: clone(state.attempts),
        completions: clone(state.completions),
        progress: clone(state.progress),
        reviewItems: clone(state.reviewItems),
        operations: clone(state.operations),
      };
      const result = await work(memoryStore(draft));
      state.attempts = draft.attempts;
      state.completions = draft.completions;
      state.progress = draft.progress;
      state.reviewItems = draft.reviewItems;
      state.operations = draft.operations;
      return result;
    },
    async upsertAttempt(attempt) {
      if (!state.attempts.has(attempt.id)) state.attempts.set(attempt.id, clone(attempt));
    },
    async listAttempts(lessonRunId) {
      return [...state.attempts.values()]
        .filter((attempt) => attempt.lessonRunId === lessonRunId)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        .map(clone);
    },
    async insertCompletionOnce(completion) {
      const existing = [...state.completions.values()].find(
        (candidate) => candidate.lessonRunId === completion.lessonRunId,
      );
      if (existing) return clone(existing);
      state.completions.set(completion.id, clone(completion));
      return clone(completion);
    },
    async getCompletion(lessonRunId) {
      const result = [...state.completions.values()].find(
        (completion) => completion.lessonRunId === lessonRunId,
      );
      return result ? clone(result) : null;
    },
    async getProgress(ownerId) {
      const result = state.progress.get(ownerId);
      return result ? clone(result) : null;
    },
    async upsertProgress(progress) {
      state.progress.set(progress.ownerId, clone(progress));
    },
    async upsertReviewItem(item) {
      state.reviewItems.set(reviewItemKey(item.ownerId, item.itemId), clone(item));
    },
    async getReviewItem(ownerId, itemId) {
      const result = state.reviewItems.get(reviewItemKey(ownerId, itemId));
      return result ? clone(result) : null;
    },
    async listDueReviewItems(ownerId, at) {
      return [...state.reviewItems.values()]
        .filter((item) => item.ownerId === ownerId && item.nextReviewAt <= at)
        .sort((left, right) => left.nextReviewAt.localeCompare(right.nextReviewAt))
        .map(clone);
    },
    async upsertSyncOperation(operation) {
      const existing = [...state.operations.values()].find(
        (candidate) =>
          candidate.ownerId === operation.ownerId &&
          candidate.kind === operation.kind &&
          candidate.aggregateId === operation.aggregateId,
      );
      if (!existing) state.operations.set(operation.id, clone(operation));
    },
    async getSyncOperation(id) {
      const operation = state.operations.get(id);
      return operation ? clone(operation) : null;
    },
    async listSyncOperations() {
      return [...state.operations.values()].map(clone);
    },
    async updateSyncOperation(operation) {
      state.operations.set(operation.id, clone(operation));
    },
  };
}

export function createMemoryPersistence(): LocalPersistence {
  return memoryStore({
    attempts: new Map(),
    completions: new Map(),
    progress: new Map(),
    reviewItems: new Map(),
    operations: new Map(),
  });
}

export async function openBuaDatabase(): Promise<LocalPersistence> {
  const { openDatabaseAsync } = await import('expo-sqlite');
  const database = await openDatabaseAsync(localDatabaseName);
  const versionRow = await database.getFirstAsync<{ user_version: number }>('pragma user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  for (const migration of localMigrations) {
    if (migration.version > currentVersion) await database.execAsync(migration.sql);
  }

  const persistence: LocalPersistence = {
    async transaction(work) {
      let result: unknown;
      await database.withTransactionAsync(async () => {
        result = await work(persistence);
      });
      return result as never;
    },
    async upsertAttempt(attempt) {
      await database.runAsync(
        `insert into local_attempts (id, owner_id, lesson_run_id, activity_id, status, created_at)
         values (?, ?, ?, ?, ?, ?) on conflict (id) do nothing`,
        attempt.id,
        attempt.ownerId,
        attempt.lessonRunId,
        attempt.activityId,
        attempt.status,
        attempt.createdAt,
      );
    },
    async listAttempts(lessonRunId) {
      const rows = await database.getAllAsync<{
        id: string;
        owner_id: string;
        lesson_run_id: string;
        activity_id: string;
        status: string;
        created_at: string;
      }>('select * from local_attempts where lesson_run_id = ? order by created_at', lessonRunId);
      return rows.map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        lessonRunId: row.lesson_run_id,
        activityId: row.activity_id,
        status: row.status,
        createdAt: row.created_at,
      }));
    },
    async insertCompletionOnce(completion) {
      await database.runAsync(
        `insert into local_completions
          (id, owner_id, lesson_run_id, lesson_id, active_learning_seconds, completed_at)
         values (?, ?, ?, ?, ?, ?) on conflict (lesson_run_id) do nothing`,
        completion.id,
        completion.ownerId,
        completion.lessonRunId,
        completion.lessonId,
        completion.activeLearningSeconds,
        completion.completedAt,
      );
      const stored = await persistence.getCompletion(completion.lessonRunId);
      if (!stored) throw new Error('Completion transaction did not persist.');
      return stored;
    },
    async getCompletion(lessonRunId) {
      const row = await database.getFirstAsync<{
        id: string;
        owner_id: string;
        lesson_run_id: string;
        lesson_id: string;
        active_learning_seconds: number;
        completed_at: string;
      }>('select * from local_completions where lesson_run_id = ?', lessonRunId);
      return row
        ? {
            id: row.id,
            ownerId: row.owner_id,
            lessonRunId: row.lesson_run_id,
            lessonId: row.lesson_id,
            activeLearningSeconds: row.active_learning_seconds,
            completedAt: row.completed_at,
          }
        : null;
    },
    async getProgress(ownerId) {
      const row = await database.getFirstAsync<{
        owner_id: string;
        total_xp: number;
        current_streak_days: number;
        longest_streak_days: number;
        last_activity_local_date: string;
        updated_at: string;
      }>('select * from local_progress where owner_id = ?', ownerId);
      return row
        ? {
            ownerId: row.owner_id,
            totalXp: row.total_xp,
            currentStreakDays: row.current_streak_days,
            longestStreakDays: row.longest_streak_days,
            lastActivityLocalDate: row.last_activity_local_date,
            updatedAt: row.updated_at,
          }
        : null;
    },
    async upsertProgress(progress) {
      await database.runAsync(
        `insert into local_progress
          (owner_id, total_xp, current_streak_days, longest_streak_days, last_activity_local_date, updated_at)
         values (?, ?, ?, ?, ?, ?)
         on conflict (owner_id) do update set
           total_xp = excluded.total_xp,
           current_streak_days = excluded.current_streak_days,
           longest_streak_days = excluded.longest_streak_days,
           last_activity_local_date = excluded.last_activity_local_date,
           updated_at = excluded.updated_at`,
        progress.ownerId,
        progress.totalXp,
        progress.currentStreakDays,
        progress.longestStreakDays,
        progress.lastActivityLocalDate,
        progress.updatedAt,
      );
    },
    async upsertReviewItem(item) {
      await database.runAsync(
        `insert into local_review_schedule
          (owner_id, item_id, next_review_at, interval_days, ease_factor, repetitions, updated_at)
         values (?, ?, ?, ?, ?, ?, ?)
         on conflict (owner_id, item_id) do update set
           next_review_at = excluded.next_review_at,
           interval_days = excluded.interval_days,
           ease_factor = excluded.ease_factor,
           repetitions = excluded.repetitions,
           updated_at = excluded.updated_at`,
        item.ownerId,
        item.itemId,
        item.nextReviewAt,
        item.intervalDays,
        item.easeFactor,
        item.repetitions,
        item.updatedAt,
      );
    },
    async getReviewItem(ownerId, itemId) {
      const row = await database.getFirstAsync<{
        owner_id: string;
        item_id: string;
        next_review_at: string;
        interval_days: number;
        ease_factor: number;
        repetitions: number;
        updated_at: string;
      }>(
        'select * from local_review_schedule where owner_id = ? and item_id = ?',
        ownerId,
        itemId,
      );
      return row
        ? {
            ownerId: row.owner_id,
            itemId: row.item_id,
            nextReviewAt: row.next_review_at,
            intervalDays: row.interval_days,
            easeFactor: row.ease_factor,
            repetitions: row.repetitions,
            updatedAt: row.updated_at,
          }
        : null;
    },
    async listDueReviewItems(ownerId, at) {
      const rows = await database.getAllAsync<{
        owner_id: string;
        item_id: string;
        next_review_at: string;
        interval_days: number;
        ease_factor: number;
        repetitions: number;
        updated_at: string;
      }>(
        'select * from local_review_schedule where owner_id = ? and next_review_at <= ? order by next_review_at',
        ownerId,
        at,
      );
      return rows.map((row) => ({
        ownerId: row.owner_id,
        itemId: row.item_id,
        nextReviewAt: row.next_review_at,
        intervalDays: row.interval_days,
        easeFactor: row.ease_factor,
        repetitions: row.repetitions,
        updatedAt: row.updated_at,
      }));
    },
    async upsertSyncOperation(operation) {
      await database.runAsync(
        `insert into local_sync_operations
          (id, owner_id, kind, aggregate_id, payload, status, attempt_count, next_attempt_at, acknowledged_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)
         on conflict (owner_id, kind, aggregate_id) do nothing`,
        operation.id,
        operation.ownerId,
        operation.kind,
        operation.aggregateId,
        JSON.stringify(operation.payload),
        operation.status,
        operation.attemptCount,
        operation.nextAttemptAt,
        operation.acknowledgedAt,
      );
    },
    async getSyncOperation(id) {
      const rows = await persistence.listSyncOperations();
      return rows.find((operation) => operation.id === id) ?? null;
    },
    async listSyncOperations() {
      const rows = await database.getAllAsync<{
        id: string;
        owner_id: string;
        kind: LocalSyncOperation['kind'];
        aggregate_id: string;
        payload: string;
        status: LocalSyncOperation['status'];
        attempt_count: number;
        next_attempt_at: number;
        acknowledged_at: number | null;
      }>('select * from local_sync_operations order by next_attempt_at, id');
      return rows.map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        kind: row.kind,
        aggregateId: row.aggregate_id,
        payload: JSON.parse(row.payload) as Record<string, unknown>,
        status: row.status,
        attemptCount: row.attempt_count,
        nextAttemptAt: row.next_attempt_at,
        acknowledgedAt: row.acknowledged_at,
      }));
    },
    async updateSyncOperation(operation) {
      await database.runAsync(
        `update local_sync_operations
         set status = ?, attempt_count = ?, next_attempt_at = ?, acknowledged_at = ?
         where id = ?`,
        operation.status,
        operation.attemptCount,
        operation.nextAttemptAt,
        operation.acknowledgedAt,
        operation.id,
      );
    },
  };
  return persistence;
}
