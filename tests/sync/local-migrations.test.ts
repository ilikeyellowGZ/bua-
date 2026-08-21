import { localMigrations } from '@/infra/local/migrations';

describe('local SQLite migrations', () => {
  it('creates every local-first data seam and the pending outbox index', () => {
    const sql = localMigrations
      .map((migration) => migration.sql)
      .join('\n')
      .toLowerCase();
    for (const table of [
      'local_content',
      'onboarding_drafts',
      'local_lesson_runs',
      'local_attempts',
      'local_completions',
      'local_sync_operations',
      'local_downloads',
      'local_reminders',
      'entitlement_cache',
    ]) {
      expect(sql).toContain(`create table if not exists ${table}`);
    }
    expect(sql).toContain("where status in ('pending', 'failed')");
    expect(sql).toContain('pragma journal_mode = wal');
  });
});
