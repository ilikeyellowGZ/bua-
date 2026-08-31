import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const readMigration = (name: string) =>
  readFileSync(resolve(process.cwd(), 'supabase', 'migrations', name), 'utf8').toLowerCase();

describe('Supabase migration security contract', () => {
  const core = readMigration('202608210001_bua_core.sql');
  const rls = readMigration('202608210002_bua_rls.sql');
  const functions = readMigration('202608210003_bua_functions.sql');
  const liveIdentity = readMigration('202608220001_live_identity.sql');
  const progress = readMigration('202608220002_bua_progress.sql');
  const accountDeletion = readMigration('202608220003_bua_account_deletion.sql');
  const adminMonitoring = readMigration('202608220004_bua_admin_monitoring.sql');

  it('uses timezone-aware timestamps, constraints, and indexed ownership keys', () => {
    expect(core).not.toMatch(/\btimestamp\b(?!tz)/);
    expect(core).toContain('owner_id uuid not null references auth.users');
    expect(core).toContain('create index attempts_owner_id_idx');
    expect(core).toContain('create index lesson_completions_owner_id_idx');
    expect(core).toContain('create index sync_operations_pending_idx');
    expect(core).toContain("where status in ('pending', 'failed')");
  });

  it('enables and forces RLS for every exposed table', () => {
    const tables = [
      'profiles',
      'courses',
      'units',
      'lessons',
      'activities',
      'lesson_runs',
      'attempts',
      'lesson_completions',
      'reminders',
      'sync_operations',
      'entitlements',
      'institution_memberships',
    ];

    for (const table of tables) {
      expect(rls).toContain(`alter table public.${table} enable row level security`);
      expect(rls).toContain(`alter table public.${table} force row level security`);
    }
  });

  it('caches auth.uid in policies and denies client authority-table writes', () => {
    expect(rls).not.toMatch(/using \(auth\.uid\(\)/);
    expect(rls).toContain('(select auth.uid()) = owner_id');
    expect(rls).toContain('grant select on public.lesson_completions, public.entitlements');
    expect(rls).not.toMatch(/grant\s+insert[^;]+public\.entitlements/s);
    expect(rls).not.toMatch(/grant\s+insert[^;]+public\.institution_memberships/s);
  });

  it('hardens security-definer functions and keeps operations idempotent', () => {
    expect(functions.match(/security definer/g)).toHaveLength(2);
    expect(functions.match(/set search_path = ''/g)).toHaveLength(2);
    expect(functions).toContain('on conflict (lesson_run_id) do nothing');
    expect(functions).toContain('owner_id = caller_id');
    expect(functions).toContain('acknowledged_at = coalesce(acknowledged_at, now())');
    expect(functions).toContain('revoke all on function');
  });

  it('creates exactly one profile for each auth user', () => {
    expect(liveIdentity).toContain('alter table public.profiles');
    expect(liveIdentity).toContain('add column if not exists onboarding_completed');
    expect(liveIdentity).toContain('create or replace function public.handle_new_user()');
    expect(liveIdentity).toContain('security definer');
    expect(liveIdentity).toContain("set search_path = ''");
    expect(liveIdentity).toContain('on conflict (id) do nothing');
    expect(liveIdentity).toContain('create trigger on_auth_user_created');
    expect(liveIdentity).toContain('after insert on auth.users');
  });

  it('enforces RLS and idempotent replay for the progress-tracking tables', () => {
    for (const table of ['progress_events', 'review_schedule']) {
      expect(progress).toContain(`alter table public.${table} enable row level security`);
      expect(progress).toContain(`alter table public.${table} force row level security`);
    }
    expect(progress).toContain('(select auth.uid()) = owner_id');
    expect(progress).toContain('security definer');
    expect(progress).toContain("set search_path = ''");
    expect(progress).toContain('on conflict (id) do nothing');
    expect(progress).toContain('get diagnostics inserted = row_count');
    expect(progress).toContain('revoke all on function public.apply_progress_update');
  });

  it('adds an idempotent, RLS-scoped column for GDPR-style account deletion requests', () => {
    expect(accountDeletion).toContain('alter table public.profiles');
    expect(accountDeletion).toContain('add column if not exists deletion_requested_at timestamptz');
  });

  it('gates admin aggregates behind is_admin() and never grants raw cross-user row access', () => {
    expect(adminMonitoring).toContain('alter table public.app_error_events enable row level security');
    expect(adminMonitoring).toContain('alter table public.app_error_events force row level security');
    expect(adminMonitoring).toContain('(select auth.uid()) = owner_id');

    // The dashboard is a single SECURITY DEFINER aggregate RPC gated by is_admin() —
    // there must be no RLS policy granting admins broader row-level SELECT access.
    expect(adminMonitoring).not.toMatch(/create policy[^;]*is_admin/s);
    expect(adminMonitoring.match(/security definer/g)).toHaveLength(2);
    expect(adminMonitoring.match(/set search_path = ''/g)).toHaveLength(2);
    expect(adminMonitoring).toContain('if not public.is_admin() then');
    expect(adminMonitoring).toContain("raise exception 'administrator access required'");
    expect(adminMonitoring).toContain('revoke all on function public.is_admin');
    expect(adminMonitoring).toContain('revoke all on function public.admin_dashboard_snapshot');
  });
});
