import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { computeHealthStatus, type HealthStatus } from '@/features/admin/admin-health';
import {
  getAdminRepository,
  type AdminDashboardSnapshot,
  type AdminRepository,
} from '@/features/admin/admin.repository';
import { BuaButton } from '@/ui/controls/bua-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { useTheme } from '@/ui/theme/theme-provider';

type LoadState = 'loading' | 'denied' | 'error' | 'ready';

type AdminDashboardScreenProps = {
  onBack: () => void;
  loadRepository?: () => Promise<AdminRepository>;
};

const healthCopy: Record<HealthStatus, { title: string; tone: 'success' | 'coaching' | 'error' }> = {
  ok: { title: 'All systems normal', tone: 'success' },
  warning: { title: 'Attention: sync backlog building up', tone: 'coaching' },
  critical: { title: 'Attention: failures detected', tone: 'error' },
};

function formatStat(value: number | null): string {
  return value === null ? '—' : String(value);
}

function formatSeconds(value: number | null): string {
  if (value === null) return '—';
  if (value < 60) return `${Math.round(value)}s`;
  if (value < 3600) return `${Math.round(value / 60)}m`;
  return `${Math.round(value / 3600)}h`;
}

export function AdminDashboardScreen({
  onBack,
  loadRepository = getAdminRepository,
}: AdminDashboardScreenProps) {
  const tokens = useTheme();
  const [state, setState] = useState<LoadState>('loading');
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const repository = await loadRepository();
        const allowed = await repository.isAdmin();
        if (cancelled) return;
        if (!allowed) {
          setState('denied');
          return;
        }
        const data = await repository.getDashboardSnapshot();
        if (!cancelled) {
          setSnapshot(data);
          setState('ready');
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : String(error));
          setState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRepository]);

  const handleRefresh = async () => {
    setState('loading');
    try {
      const repository = await loadRepository();
      const allowed = await repository.isAdmin();
      if (!allowed) {
        setState('denied');
        return;
      }
      const data = await repository.getDashboardSnapshot();
      setSnapshot(data);
      setState('ready');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setState('error');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ backgroundColor: tokens.color.paper }}
    >
      <Text accessibilityRole="header" style={[tokens.typography.h1, { color: tokens.color.ink }]}>
        Admin monitoring
      </Text>

      {state === 'loading' ? (
        <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>Loading…</Text>
      ) : null}

      {state === 'denied' ? (
        <FeedbackPanel
          tone="error"
          title="Administrator access required"
          message="This account does not have administrator access."
        />
      ) : null}

      {state === 'error' ? (
        <FeedbackPanel
          tone="error"
          title="Could not load the dashboard"
          message={errorMessage ?? 'An unknown error occurred.'}
        />
      ) : null}

      {state === 'ready' && snapshot ? (
        <>
          <FeedbackPanel
            tone={healthCopy[computeHealthStatus(snapshot)].tone}
            title={healthCopy[computeHealthStatus(snapshot)].title}
            message={`${snapshot.pendingSyncOperations} pending · ${snapshot.failedSyncOperations} failed sync operations`}
          />
          <View style={styles.grid}>
            {(
              [
                ['Total users', formatStat(snapshot.totalUsers)],
                ['Active users (7d)', formatStat(snapshot.activeUsers7d)],
                ['Lesson completions today', formatStat(snapshot.lessonCompletionsToday)],
                ['Pending sync operations', formatStat(snapshot.pendingSyncOperations)],
                ['Failed sync operations', formatStat(snapshot.failedSyncOperations)],
                ['Oldest pending sync age', formatSeconds(snapshot.oldestPendingSyncSeconds)],
                ['Error events (24h)', formatStat(snapshot.errorEvents24h)],
                ['Average streak (days)', formatStat(snapshot.averageStreakDays)],
              ] satisfies readonly (readonly [string, string])[]
            ).map(([label, value]) => (
              <View
                key={label}
                style={[styles.card, { backgroundColor: tokens.color.selectionSurface }]}
              >
                <Text style={[tokens.typography.h2, { color: tokens.color.aloe }]}>{value}</Text>
                <Text style={[tokens.typography.bodySmall, { color: tokens.color.ink }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <BuaButton label="Refresh" variant="outline" onPress={handleRefresh} />
      <BuaButton label="Back" variant="outline" onPress={onBack} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, gap: 6, minWidth: '47%', padding: 16 },
  content: { gap: 16, padding: 24, paddingBottom: 48 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
