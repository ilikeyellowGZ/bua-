create or replace function public.complete_lesson_once(
  p_completion_id text,
  p_lesson_run_id text,
  p_lesson_id text,
  p_active_learning_seconds integer,
  p_completed_at timestamptz default now()
)
returns public.lesson_completions
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  result public.lesson_completions;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_active_learning_seconds < 0 then
    raise exception 'Active learning seconds must be non-negative' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.lesson_runs
    where id = p_lesson_run_id
      and owner_id = caller_id
      and lesson_id = p_lesson_id
  ) then
    raise exception 'Lesson run not found for caller' using errcode = '42501';
  end if;

  insert into public.lesson_completions (
    id, owner_id, lesson_run_id, lesson_id, active_learning_seconds, completed_at
  )
  values (
    p_completion_id, caller_id, p_lesson_run_id, p_lesson_id,
    p_active_learning_seconds, p_completed_at
  )
  on conflict (lesson_run_id) do nothing
  returning * into result;

  if result.id is null then
    select * into result
    from public.lesson_completions
    where lesson_run_id = p_lesson_run_id and owner_id = caller_id;
  end if;

  update public.lesson_runs
  set status = 'completed', updated_at = now()
  where id = p_lesson_run_id and owner_id = caller_id;

  return result;
end;
$$;

create or replace function public.ack_sync_operation(p_operation_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  affected integer;
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.sync_operations
  set status = 'acknowledged', acknowledged_at = coalesce(acknowledged_at, now())
  where id = p_operation_id and owner_id = caller_id;

  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

revoke all on function public.complete_lesson_once(text, text, text, integer, timestamptz)
from public, anon;
revoke all on function public.ack_sync_operation(text) from public, anon;
grant execute on function public.complete_lesson_once(text, text, text, integer, timestamptz)
to authenticated;
grant execute on function public.ack_sync_operation(text) to authenticated;
