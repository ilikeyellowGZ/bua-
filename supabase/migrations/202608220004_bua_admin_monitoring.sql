create or replace function public.is_admin(p_user_id uuid default (select auth.uid()))
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.institution_memberships
    where owner_id = p_user_id and role = 'administrator'
  );
$$;

revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;

create table public.app_error_events (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('error', 'message')),
  summary text not null check (char_length(summary) between 1 and 500),
  context jsonb not null default '{}'::jsonb check (jsonb_typeof(context) = 'object'),
  occurred_at timestamptz not null default now()
);
create index app_error_events_owner_id_idx on public.app_error_events (owner_id);
create index app_error_events_occurred_at_idx on public.app_error_events (occurred_at desc);

alter table public.app_error_events enable row level security;
alter table public.app_error_events force row level security;

create policy app_error_events_insert_own on public.app_error_events for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy app_error_events_select_own on public.app_error_events for select to authenticated
using ((select auth.uid()) = owner_id);

grant select, insert on public.app_error_events to authenticated;

create or replace function public.admin_dashboard_snapshot()
returns table (
  total_users bigint,
  active_users_7d bigint,
  lesson_completions_today bigint,
  pending_sync_operations bigint,
  failed_sync_operations bigint,
  oldest_pending_sync_seconds numeric,
  error_events_24h bigint,
  average_streak_days numeric
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.profiles),
    (select count(distinct owner_id) from public.lesson_completions
      where completed_at >= now() - interval '7 days'),
    (select count(*) from public.lesson_completions
      where completed_at >= date_trunc('day', now())),
    (select count(*) from public.sync_operations where status in ('pending', 'failed')),
    (select count(*) from public.sync_operations where status = 'failed'),
    (select extract(epoch from (now() - min(created_at)))
      from public.sync_operations where status in ('pending', 'failed')),
    (select count(*) from public.app_error_events
      where occurred_at >= now() - interval '24 hours'),
    (select coalesce(avg(streak_days), 0) from public.profiles);
end;
$$;

revoke all on function public.admin_dashboard_snapshot() from public, anon;
grant execute on function public.admin_dashboard_snapshot() to authenticated;
