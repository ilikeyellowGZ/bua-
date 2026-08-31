import { computeHealthStatus } from '@/features/admin/admin-health';
import type { AdminDashboardSnapshot } from '@/features/admin/admin.repository';

const baseline: AdminDashboardSnapshot = {
  totalUsers: 100,
  activeUsers7d: 40,
  lessonCompletionsToday: 12,
  pendingSyncOperations: 0,
  failedSyncOperations: 0,
  oldestPendingSyncSeconds: null,
  errorEvents24h: 0,
  averageStreakDays: 3.2,
};

describe('computeHealthStatus', () => {
  it('reports ok when there is nothing pending, failed, or erroring', () => {
    expect(computeHealthStatus(baseline)).toBe('ok');
  });

  it('reports warning when sync operations are pending but nothing has failed yet', () => {
    expect(computeHealthStatus({ ...baseline, pendingSyncOperations: 3 })).toBe('warning');
  });

  it('reports warning when the oldest pending sync operation is stale', () => {
    expect(
      computeHealthStatus({ ...baseline, oldestPendingSyncSeconds: 60 * 60 * 2 }),
    ).toBe('warning');
  });

  it('reports critical when any sync operation has failed', () => {
    expect(computeHealthStatus({ ...baseline, failedSyncOperations: 1 })).toBe('critical');
  });

  it('reports critical when error events were captured in the last 24 hours', () => {
    expect(computeHealthStatus({ ...baseline, errorEvents24h: 5 })).toBe('critical');
  });

  it('treats null cross-user aggregates as zero rather than throwing', () => {
    expect(
      computeHealthStatus({ ...baseline, errorEvents24h: null, pendingSyncOperations: 0 }),
    ).toBe('ok');
  });
});
