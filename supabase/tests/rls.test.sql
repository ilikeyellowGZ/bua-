begin;

create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'neo@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'lerato@example.test');

insert into public.profiles (id, display_name)
values
  ('11111111-1111-4111-8111-111111111111', 'Neo'),
  ('22222222-2222-4222-8222-222222222222', 'Lerato');

insert into public.lesson_runs (id, owner_id, lesson_id, status)
values
  ('run-neo', '11111111-1111-4111-8111-111111111111', 'lesson-introduce-yourself', 'active'),
  ('run-lerato', '22222222-2222-4222-8222-222222222222', 'lesson-introduce-yourself', 'active');

set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select results_eq(
  'select id from public.profiles order by id',
  array['11111111-1111-4111-8111-111111111111'::uuid],
  'a user can read only their profile'
);

select results_eq(
  'select id from public.lesson_runs order by id',
  array['run-neo'::text],
  'a user can read only their lesson runs'
);

select lives_ok(
  $$insert into public.attempts (id, owner_id, lesson_run_id, activity_id, status)
    values ('attempt-neo', '11111111-1111-4111-8111-111111111111', 'run-neo', 'activity-introduce-listen', 'correct')$$,
  'a user can add their own attempt'
);

select throws_ok(
  $$insert into public.attempts (id, owner_id, lesson_run_id, activity_id, status)
    values ('attempt-forged', '22222222-2222-4222-8222-222222222222', 'run-lerato', 'activity-introduce-listen', 'correct')$$,
  '42501',
  null,
  'a user cannot add another owner attempt'
);

select is_empty(
  'select id from public.entitlements',
  'a user cannot see another user entitlement'
);

select ok(
  not has_table_privilege('authenticated', 'public.entitlements', 'INSERT'),
  'clients cannot forge entitlements'
);

select ok(
  not has_table_privilege('authenticated', 'public.institution_memberships', 'INSERT'),
  'clients cannot forge institution memberships'
);

select results_eq(
  'select id from public.lessons order by id',
  array['lesson-introduce-yourself'::text],
  'authenticated users can read seeded lesson content'
);

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
select results_eq(
  'select id from public.lessons order by id',
  array['lesson-introduce-yourself'::text],
  'anonymous guests can read published lesson content'
);

select * from finish();
rollback;
