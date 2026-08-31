export type NotificationCopy = { title: string; body: string };

/**
 * Rotates through a small pool of on-brand reminder copy so the daily nudge
 * doesn't feel identical every day. Deterministic (keyed by day of week)
 * rather than random, so it stays testable.
 */
const DAILY_REMINDER_COPY: readonly NotificationCopy[] = [
  {
    title: 'Sawubona! 👋',
    body: 'Your isiZulu practice is ready. Five minutes keeps your streak alive.',
  },
  {
    title: 'Keep your streak going',
    body: 'Thandi has today’s lesson ready whenever you are.',
  },
  {
    title: 'Time to speak isiZulu',
    body: 'A quick lesson today goes a long way. Sawubona!',
  },
];

export function pickDailyReminderCopy(date: Date = new Date()): NotificationCopy {
  const index = date.getDay() % DAILY_REMINDER_COPY.length;
  return DAILY_REMINDER_COPY[index]!;
}
