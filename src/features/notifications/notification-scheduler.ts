import type * as Notifications from 'expo-notifications';

import { pickDailyReminderCopy } from '@/features/notifications/notification-content';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'blocked';

export type ReminderPreference = {
  enabled: boolean;
  /** "HH:MM" in 24-hour local time, e.g. the onboarding-collected reminderLocalTime. */
  localTime: string;
};

export type NotificationScheduler = {
  requestPermission(): Promise<NotificationPermissionStatus>;
  /** Cancels any existing daily reminder, then reschedules it if enabled. Idempotent. */
  syncDailyReminder(preference: ReminderPreference): Promise<void>;
};

export const DAILY_REMINDER_ID = 'bua-daily-reminder';

/**
 * Lazily required: expo-notifications' native binding isn't available under
 * Jest.
 */
function loadExpoNotifications(): typeof Notifications {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-notifications');
}

export function parseLocalTime(localTime: string): { hour: number; minute: number } {
  const [hourPart, minutePart] = localTime.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  return {
    hour: Number.isFinite(hour) ? hour : 19,
    minute: Number.isFinite(minute) ? minute : 30,
  };
}

export function createNotificationScheduler(): NotificationScheduler {
  return {
    async requestPermission() {
      const expoNotifications = loadExpoNotifications();
      const existing = await expoNotifications.getPermissionsAsync();
      if (existing.granted) return 'granted';
      if (!existing.canAskAgain) return 'blocked';

      const requested = await expoNotifications.requestPermissionsAsync();
      if (requested.granted) return 'granted';
      return requested.canAskAgain ? 'denied' : 'blocked';
    },

    async syncDailyReminder(preference) {
      const expoNotifications = loadExpoNotifications();
      await expoNotifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => undefined);
      if (!preference.enabled) return;

      const { hour, minute } = parseLocalTime(preference.localTime);
      const { title, body } = pickDailyReminderCopy();
      await expoNotifications.scheduleNotificationAsync({
        identifier: DAILY_REMINDER_ID,
        content: { title, body },
        trigger: { type: expoNotifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
      });
    },
  };
}

export const notificationScheduler: NotificationScheduler = createNotificationScheduler();
