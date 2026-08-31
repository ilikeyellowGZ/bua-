import { pickDailyReminderCopy } from '@/features/notifications/notification-content';

describe('pickDailyReminderCopy', () => {
  it('returns a non-empty title and body', () => {
    const copy = pickDailyReminderCopy(new Date('2026-08-31T12:00:00.000Z'));
    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.body.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same date', () => {
    const date = new Date('2026-08-31T12:00:00.000Z');
    expect(pickDailyReminderCopy(date)).toEqual(pickDailyReminderCopy(date));
  });

  it('varies across different days of the week', () => {
    const sunday = pickDailyReminderCopy(new Date('2026-08-30T12:00:00.000Z'));
    const monday = pickDailyReminderCopy(new Date('2026-08-31T12:00:00.000Z'));
    const tuesday = pickDailyReminderCopy(new Date('2026-09-01T12:00:00.000Z'));
    const copies = [sunday, monday, tuesday];
    expect(new Set(copies.map((copy) => copy.title)).size).toBeGreaterThan(1);
  });
});
