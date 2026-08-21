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
  upsertSyncOperation(operation: LocalSyncOperation): Promise<void>;
  getSyncOperation(id: string): Promise<LocalSyncOperation | null>;
  listSyncOperations(): Promise<LocalSyncOperation[]>;
  updateSyncOperation(operation: LocalSyncOperation): Promise<void>;
};

type MemoryState = {
  attempts: Map<string, LocalAttempt>;
  completions: Map<string, LocalCompletion>;
  operations: Map<string, LocalSyncOperation>;
};

const clone = <T>(value: T): T => structuredClone(value);

function memoryStore(state: MemoryState): LocalPersistence {
  return {
    async transaction(work) {
      const draft: MemoryState = {
        attempts: clone(state.attempts),
        completions: clone(state.completions),
        operations: clone(state.operations),
      };
      const result = await work(memoryStore(draft));
      state.attempts = draft.attempts;
      state.completions = draft.completions;
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
  return memoryStore({ attempts: new Map(), completions: new Map(), operations: new Map() });
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
