import {
  createNotificationScheduler,
  parseLocalTime,
  DAILY_REMINDER_ID,
} from '@/features/notifications/notification-scheduler';

const mockScheduleNotificationAsync = jest.fn().mockResolvedValue('notification-id');
const mockCancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined);
const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  getPermissionsAsync: mockGetPermissionsAsync,
  requestPermissionsAsync: mockRequestPermissionsAsync,
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  cancelScheduledNotificationAsync: mockCancelScheduledNotificationAsync,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockScheduleNotificationAsync.mockResolvedValue('notification-id');
  mockCancelScheduledNotificationAsync.mockResolvedValue(undefined);
});

describe('parseLocalTime', () => {
  it('parses an "HH:MM" string', () => {
    expect(parseLocalTime('08:15')).toEqual({ hour: 8, minute: 15 });
  });

  it('falls back to 19:30 for an unparseable string', () => {
    expect(parseLocalTime('not-a-time')).toEqual({ hour: 19, minute: 30 });
  });
});

describe('createNotificationScheduler', () => {
  it('returns granted immediately if permission is already granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: true });
    const scheduler = createNotificationScheduler();

    expect(await scheduler.requestPermission()).toBe('granted');
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('prompts for permission when not yet granted, and reports the result', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
    mockRequestPermissionsAsync.mockResolvedValue({ granted: true });
    const scheduler = createNotificationScheduler();

    expect(await scheduler.requestPermission()).toBe('granted');
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('reports "blocked" when the user can no longer be asked', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false });
    const scheduler = createNotificationScheduler();

    expect(await scheduler.requestPermission()).toBe('blocked');
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('schedules a daily reminder at the requested local time using a stable identifier', async () => {
    const scheduler = createNotificationScheduler();

    await scheduler.syncDailyReminder({ enabled: true, localTime: '08:15' });

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(DAILY_REMINDER_ID);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: DAILY_REMINDER_ID,
        trigger: { type: 'daily', hour: 8, minute: 15 },
        content: expect.objectContaining({
          title: expect.any(String),
          body: expect.any(String),
        }),
      }),
    );
  });

  it('only cancels, and does not reschedule, when the reminder is disabled', async () => {
    const scheduler = createNotificationScheduler();

    await scheduler.syncDailyReminder({ enabled: false, localTime: '08:15' });

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith(DAILY_REMINDER_ID);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
