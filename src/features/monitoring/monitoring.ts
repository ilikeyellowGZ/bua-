import { getSupabaseClient } from '@/infra/supabase/client';

export type MonitoringContext = Record<string, unknown>;

export type MonitoringService = {
  captureError(error: unknown, context?: MonitoringContext): void;
  captureMessage(message: string, context?: MonitoringContext): void;
  setUser(userId: string | null): void;
};

/**
 * Console-based fallback: always available, no credentials required. A real
 * provider-backed implementation (e.g. Sentry) can satisfy the same interface
 * once EXPO_PUBLIC_SENTRY_DSN is configured, without changing call sites.
 */
export function createConsoleMonitoringService(): MonitoringService {
  return {
    captureError(error, context = {}) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      console.error('[bua:monitoring] error', normalized.message, {
        ...context,
        stack: normalized.stack,
      });
    },
    captureMessage(message, context = {}) {
      console.warn('[bua:monitoring] message', message, context);
    },
    setUser(userId) {
      console.info('[bua:monitoring] user', userId ?? 'signed-out');
    },
  };
}

export type SupabaseMonitoringClient = Pick<ReturnType<typeof getSupabaseClient>, 'from'>;

type SupabaseMonitoringOptions = {
  client?: SupabaseMonitoringClient;
  fallback?: MonitoringService;
};

/**
 * Wraps the console fallback and additionally persists error/message events to
 * app_error_events so the admin dashboard's error-rate telemetry reflects real
 * production activity. Requires setUser() to have run at least once; capture
 * calls before that stay console-only rather than failing.
 */
export function createSupabaseMonitoringService({
  client = getSupabaseClient(),
  fallback = createConsoleMonitoringService(),
}: SupabaseMonitoringOptions = {}): MonitoringService {
  let currentUserId: string | null = null;

  const persist = (kind: 'error' | 'message', summary: string, context: MonitoringContext) => {
    const ownerId = currentUserId;
    if (!ownerId) return;
    void (async () => {
      try {
        const { error } = await client.from('app_error_events').insert({
          id: globalThis.crypto.randomUUID(),
          owner_id: ownerId,
          kind,
          summary: summary.slice(0, 500),
          context: context as never,
        });
        if (error) fallback.captureError(new Error(error.message), { originalSummary: summary });
      } catch (persistError) {
        fallback.captureError(persistError, { originalSummary: summary });
      }
    })();
  };

  return {
    captureError(error, context = {}) {
      fallback.captureError(error, context);
      const normalized = error instanceof Error ? error : new Error(String(error));
      persist('error', normalized.message, context);
    },
    captureMessage(message, context = {}) {
      fallback.captureMessage(message, context);
      persist('message', message, context);
    },
    setUser(userId) {
      fallback.setUser(userId);
      currentUserId = userId;
    },
  };
}

export const monitoringService: MonitoringService =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'false'
    ? createSupabaseMonitoringService()
    : createConsoleMonitoringService();
