create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  language_code text not null default 'zu',
  goal text check (goal in ('colleagues', 'family', 'campus', 'everyday')),
  daily_goal_minutes smallint not null default 10 check (daily_goal_minutes between 1 and 240),
  streak_days integer not null default 0 check (streak_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id text primary key,
  language_code text not null,
  language_name text not null,
  title text not null,
  published boolean not null default false,
  content_version integer not null default 1 check (content_version > 0),
  created_at timestamptz not null default now()
);

create table public.units (
  id text primary key,
  course_id text not null references public.courses (id) on delete cascade,
  title text not null,
  sort_order integer not null check (sort_order > 0),
  published boolean not null default false,
  unique (course_id, sort_order)
);
create index units_course_id_idx on public.units (course_id);

create table public.lessons (
  id text primary key,
  unit_id text not null references public.units (id) on delete cascade,
  title text not null,
  duration_minutes smallint not null check (duration_minutes > 0),
  level text not null check (level in ('Beginner', 'Intermediate', 'Advanced')),
  sort_order integer not null check (sort_order > 0),
  published boolean not null default false,
  unique (unit_id, sort_order)
);
create index lessons_unit_id_idx on public.lessons (unit_id);

create table public.activities (
  id text primary key,
  lesson_id text not null references public.lessons (id) on delete cascade,
  kind text not null check (
    kind in (
      'listen', 'phrase-builder', 'picture-match', 'conversation', 'comprehension',
      'dictation', 'pronunciation', 'speak', 'sound-focus', 'role-play'
    )
  ),
  sort_order integer not null check (sort_order > 0),
  required boolean not null default true,
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  published boolean not null default false,
  unique (lesson_id, sort_order)
);
create index activities_lesson_id_idx on public.activities (lesson_id);

create table public.lesson_runs (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (id),
  status text not null check (status in ('active', 'paused', 'completed', 'abandoned')),
  current_activity_id text references public.activities (id),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);
create index lesson_runs_owner_id_idx on public.lesson_runs (owner_id);
create index lesson_runs_lesson_id_idx on public.lesson_runs (lesson_id);
create index lesson_runs_owner_active_idx on public.lesson_runs (owner_id, updated_at desc)
where status in ('active', 'paused');

create table public.attempts (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  lesson_run_id text not null,
  activity_id text not null references public.activities (id),
  status text not null check (
    status in ('started', 'answered', 'correct', 'incorrect', 'skipped', 'queued-for-sync', 'synced')
  ),
  answer jsonb,
  score numeric(5, 4) check (score between 0 and 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (lesson_run_id, owner_id)
    references public.lesson_runs (id, owner_id) on delete cascade
);
create index attempts_owner_id_idx on public.attempts (owner_id);
create index attempts_lesson_run_id_idx on public.attempts (lesson_run_id);
create index attempts_activity_id_idx on public.attempts (activity_id);

create table public.lesson_completions (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  lesson_run_id text not null unique,
  lesson_id text not null references public.lessons (id),
  active_learning_seconds integer not null check (active_learning_seconds >= 0),
  completed_at timestamptz not null,
  foreign key (lesson_run_id, owner_id)
    references public.lesson_runs (id, owner_id) on delete cascade
);
create index lesson_completions_owner_id_idx on public.lesson_completions (owner_id);
create index lesson_completions_lesson_id_idx on public.lesson_completions (lesson_id);

create table public.reminders (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  local_time time not null,
  time_zone text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (owner_id)
);
create index reminders_owner_id_idx on public.reminders (owner_id);

create table public.sync_operations (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('attempt', 'completion', 'profile', 'reminder', 'purchase')),
  aggregate_id text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'processing', 'acknowledged', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  unique (owner_id, kind, aggregate_id)
);
create index sync_operations_owner_id_idx on public.sync_operations (owner_id);
create index sync_operations_pending_idx on public.sync_operations (owner_id, next_attempt_at)
where status in ('pending', 'failed');

create table public.entitlements (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  status text not null check (status in ('active', 'expired', 'revoked')),
  source text not null check (source in ('apple', 'google', 'institution', 'demo')),
  valid_until timestamptz,
  verified_at timestamptz not null,
  unique (owner_id, product_id)
);
create index entitlements_owner_id_idx on public.entitlements (owner_id);

create table public.institution_memberships (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  institution_id text not null,
  role text not null default 'learner' check (role in ('learner', 'educator', 'administrator')),
  verified_at timestamptz not null,
  unique (owner_id, institution_id)
);
create index institution_memberships_owner_id_idx on public.institution_memberships (owner_id);
