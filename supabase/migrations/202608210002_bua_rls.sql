alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.courses enable row level security;
alter table public.courses force row level security;
alter table public.units enable row level security;
alter table public.units force row level security;
alter table public.lessons enable row level security;
alter table public.lessons force row level security;
alter table public.activities enable row level security;
alter table public.activities force row level security;
alter table public.lesson_runs enable row level security;
alter table public.lesson_runs force row level security;
alter table public.attempts enable row level security;
alter table public.attempts force row level security;
alter table public.lesson_completions enable row level security;
alter table public.lesson_completions force row level security;
alter table public.reminders enable row level security;
alter table public.reminders force row level security;
alter table public.sync_operations enable row level security;
alter table public.sync_operations force row level security;
alter table public.entitlements enable row level security;
alter table public.entitlements force row level security;
alter table public.institution_memberships enable row level security;
alter table public.institution_memberships force row level security;

create policy profiles_select_own on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy courses_read_published on public.courses for select to anon, authenticated
using (published);
create policy units_read_published on public.units for select to anon, authenticated
using (published);
create policy lessons_read_published on public.lessons for select to anon, authenticated
using (published);
create policy activities_read_published on public.activities for select to anon, authenticated
using (published);

create policy lesson_runs_select_own on public.lesson_runs for select to authenticated
using ((select auth.uid()) = owner_id);
create policy lesson_runs_insert_own on public.lesson_runs for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy lesson_runs_update_own on public.lesson_runs for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy attempts_select_own on public.attempts for select to authenticated
using ((select auth.uid()) = owner_id);
create policy attempts_insert_own on public.attempts for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy attempts_update_own on public.attempts for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy lesson_completions_select_own on public.lesson_completions for select to authenticated
using ((select auth.uid()) = owner_id);

create policy reminders_select_own on public.reminders for select to authenticated
using ((select auth.uid()) = owner_id);
create policy reminders_insert_own on public.reminders for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy reminders_update_own on public.reminders for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy sync_operations_select_own on public.sync_operations for select to authenticated
using ((select auth.uid()) = owner_id);
create policy sync_operations_insert_own on public.sync_operations for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy entitlements_select_own on public.entitlements for select to authenticated
using ((select auth.uid()) = owner_id);
create policy institution_memberships_select_own on public.institution_memberships for select to authenticated
using ((select auth.uid()) = owner_id);

revoke all on all tables in schema public from anon, authenticated;
grant select on public.courses, public.units, public.lessons, public.activities to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.lesson_runs, public.attempts, public.reminders to authenticated;
grant select, insert on public.sync_operations to authenticated;
grant select on public.lesson_completions, public.entitlements, public.institution_memberships to authenticated;
