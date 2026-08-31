export const localDatabaseName = 'bua.db';

export const localMigrations = [
  {
    version: 1,
    sql: `
      pragma journal_mode = wal;
      pragma foreign_keys = on;
      create table if not exists local_content (
        id text primary key not null,
        kind text not null,
        version integer not null,
        payload text not null,
        updated_at text not null
      );

      create table if not exists onboarding_drafts (
        owner_id text primary key not null,
        schema_version integer not null,
        payload text not null,
        updated_at text not null
      );

      create table if not exists local_lesson_runs (
        id text primary key not null,
        owner_id text not null,
        lesson_id text not null,
        current_activity_id text,
        status text not null,
        payload text not null,
        updated_at text not null
      );
      create index if not exists local_lesson_runs_owner_idx
        on local_lesson_runs (owner_id, updated_at);

      create table if not exists local_attempts (
        id text primary key not null,
        owner_id text not null,
        lesson_run_id text not null,
        activity_id text not null,
        status text not null,
        created_at text not null
      );
      create index if not exists local_attempts_run_idx
        on local_attempts (lesson_run_id, created_at);

      create table if not exists local_completions (
        id text primary key not null,
        owner_id text not null,
        lesson_run_id text not null unique,
        lesson_id text not null,
        active_learning_seconds integer not null,
        completed_at text not null
      );

      create table if not exists local_sync_operations (
        id text primary key not null,
        owner_id text not null,
        kind text not null,
        aggregate_id text not null,
        payload text not null,
        status text not null,
        attempt_count integer not null default 0,
        next_attempt_at integer not null,
        acknowledged_at integer,
        unique (owner_id, kind, aggregate_id)
      );
      create index if not exists local_sync_pending_idx
        on local_sync_operations (next_attempt_at)
        where status in ('pending', 'failed');

      create table if not exists local_downloads (
        id text primary key not null,
        content_pack_id text not null,
        version integer not null,
        checksum text not null,
        local_uri text,
        status text not null,
        updated_at text not null
      );

      create table if not exists local_reminders (
        id text primary key not null,
        owner_id text not null unique,
        payload text not null,
        updated_at text not null
      );

      create table if not exists entitlement_cache (
        owner_id text primary key not null,
        payload text not null,
        verified_at text not null,
        expires_at text
      );

      pragma user_version = 1;
    `,
  },
  {
    version: 2,
    sql: `
      create table if not exists local_progress (
        owner_id text primary key not null,
        total_xp integer not null default 0,
        current_streak_days integer not null default 0,
        longest_streak_days integer not null default 0,
        last_activity_local_date text not null default '',
        updated_at text not null
      );

      create table if not exists local_review_schedule (
        owner_id text not null,
        item_id text not null,
        next_review_at text not null,
        interval_days integer not null,
        ease_factor real not null,
        repetitions integer not null default 0,
        updated_at text not null,
        primary key (owner_id, item_id)
      );
      create index if not exists local_review_schedule_due_idx
        on local_review_schedule (owner_id, next_review_at);

      pragma user_version = 2;
    `,
  },
] as const;
