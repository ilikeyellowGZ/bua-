begin;

create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (id, email)
values ('33333333-3333-4333-8333-333333333333', 'owner@example.test');
insert into public.profiles (id, display_name)
values ('33333333-3333-4333-8333-333333333333', 'Owner');
insert into public.lesson_runs (id, owner_id, lesson_id, status)
values ('run-idempotent', '33333333-3333-4333-8333-333333333333', 'lesson-introduce-yourself', 'active');
insert into public.sync_operations (id, owner_id, kind, aggregate_id, payload)
values (
  'operation-idempotent',
  '33333333-3333-4333-8333-333333333333',
  'completion',
  'run-idempotent',
  '{}'::jsonb
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

select lives_ok(
  $$select public.complete_lesson_once(
    'completion-first', 'run-idempotent', 'lesson-introduce-yourself', 720, '2026-08-21T10:00:00Z'
  )$$,
  'first completion succeeds'
);

select lives_ok(
  $$select public.complete_lesson_once(
    'completion-duplicate', 'run-idempotent', 'lesson-introduce-yourself', 999, '2026-08-21T11:00:00Z'
  )$$,
  'duplicate lesson completion returns the existing result'
);

select is(
  (select count(*) from public.lesson_completions where lesson_run_id = 'run-idempotent'),
  1::bigint,
  'only one completion is persisted per lesson run'
);

select ok(public.ack_sync_operation('operation-idempotent'), 'first acknowledgement succeeds');
select ok(public.ack_sync_operation('operation-idempotent'), 'repeated acknowledgement is harmless');

select * from finish();
rollback;
