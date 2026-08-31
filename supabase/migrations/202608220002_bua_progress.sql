alter table public.profiles
  add column if not exists total_xp integer not null default 0 check (total_xp >= 0),
  add column if not exists longest_streak_days integer not null default 0 check (longest_streak_days >= 0),
  add column if not exists last_activity_local_date date;

create table public.progress_events (
  id text primary key,
  owner_id uuid not null references auth.users (id) on delete cascade,
  xp_awarded integer not null check (xp_awarded >= 0),
  current_streak_days integer not null check (current_streak_days >= 0),
  longest_streak_days integer not null check (longest_streak_days >= 0),
  last_activity_local_date date not null,
  created_at timestamptz not null default now()
);
create index progress_events_owner_id_idx on public.progress_events (owner_id);

create table public.review_schedule (
  owner_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  next_review_at timestamptz not null,
  interval_days integer not null check (interval_days > 0),
  ease_factor numeric(3, 2) not null,
  repetitions integer not null default 0 check (repetitions >= 0),
  updated_at timestamptz not null default now(),
  primary key (owner_id, item_id)
);
create index review_schedule_due_idx on public.review_schedule (owner_id, next_review_at);

alter table public.progress_events enable row level security;
alter table public.progress_events force row level security;
alter table public.review_schedule enable row level security;
alter table public.review_schedule force row level security;

create policy progress_events_select_own on public.progress_events for select to authenticated
using ((select auth.uid()) = owner_id);

create policy review_schedule_select_own on public.review_schedule for select to authenticated
using ((select auth.uid()) = owner_id);
create policy review_schedule_insert_own on public.review_schedule for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy review_schedule_update_own on public.review_schedule for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

grant select on public.progress_events to authenticated;
grant select, insert, update on public.review_schedule to authenticated;

create or replace function public.apply_progress_update(
  p_event_id text,
  p_xp_awarded integer,
  p_current_streak_days integer,
  p_longest_streak_days integer,
  p_last_activity_local_date date
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  result public.profiles;
  inserted integer;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.progress_events (
    id, owner_id, xp_awarded, current_streak_days, longest_streak_days, last_activity_local_date
  )
  values (
    p_event_id, caller_id, p_xp_awarded, p_current_streak_days, p_longest_streak_days,
    p_last_activity_local_date
  )
  on conflict (id) do nothing;

  get diagnostics inserted = row_count;

  if inserted > 0 then
    update public.profiles
    set
      total_xp = total_xp + p_xp_awarded,
      streak_days = case
        when last_activity_local_date is null or p_last_activity_local_date >= last_activity_local_date
          then p_current_streak_days
        else streak_days
      end,
      longest_streak_days = greatest(longest_streak_days, p_longest_streak_days),
      last_activity_local_date = case
        when last_activity_local_date is null or p_last_activity_local_date >= last_activity_local_date
          then p_last_activity_local_date
        else last_activity_local_date
      end,
      updated_at = now()
    where id = caller_id;
  end if;

  select * into result from public.profiles where id = caller_id;
  return result;
end;
$$;

revoke all on function public.apply_progress_update(text, integer, integer, integer, date)
from public, anon;
grant execute on function public.apply_progress_update(text, integer, integer, integer, date)
to authenticated;
