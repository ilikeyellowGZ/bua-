import AsyncStorage from '@react-native-async-storage/async-storage';

import { onboardingDraftRepository } from '@/features/onboarding/draft.repository';
import { finishOnboarding, type SupabaseProfileClient } from '@/features/onboarding/finish-onboarding';
import type { NotificationScheduler } from '@/features/notifications/notification-scheduler';

function fakeScheduler(permission: 'granted' | 'denied' | 'blocked' = 'granted') {
  const requestPermission = jest.fn().mockResolvedValue(permission);
  const syncDailyReminder = jest.fn().mockResolvedValue(undefined);
  return { requestPermission, syncDailyReminder } as unknown as NotificationScheduler & {
    requestPermission: jest.Mock;
    syncDailyReminder: jest.Mock;
  };
}

describe('finishOnboarding', () => {
  const originalDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE;

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_DEMO_MODE = originalDemoMode;
  });

  it('never constructs a real Supabase client in demo mode when no client override is given', async () => {
    process.env.EXPO_PUBLIC_DEMO_MODE = 'true';

    // No `client` passed here — this is the real call shape used by
    // src/app/(onboarding)/goal.tsx. Regression test for a bug where the
    // `client = getSupabaseClient()` default parameter evaluated eagerly on
    // every call (JS evaluates default params at call time, before the
    // function body's demo-mode guard runs), throwing a ConfigurationError
    // whenever real Supabase env vars weren't configured, even in demo mode.
    await expect(finishOnboarding('everyday', { scheduler: fakeScheduler() })).resolves.toBeUndefined();
  });

  it('marks the local draft complete without contacting the server in demo mode', async () => {
    process.env.EXPO_PUBLIC_DEMO_MODE = 'true';
    const update = jest.fn();
    const client = { from: jest.fn().mockReturnValue({ update }) } as unknown as SupabaseProfileClient;

    await finishOnboarding('everyday', { client, scheduler: fakeScheduler() });

    expect(update).not.toHaveBeenCalled();
    await expect(onboardingDraftRepository.load()).resolves.toMatchObject({
      goal: 'everyday',
      completed: true,
    });
  });

  it('syncs the daily goal, goal, and completion flag onto the real profile outside demo mode', async () => {
    process.env.EXPO_PUBLIC_DEMO_MODE = 'false';
    await onboardingDraftRepository.save({
      ...(await onboardingDraftRepository.load()),
      languageCode: 'zu',
      dailyTargetMinutes: 15,
    });
    const update = jest.fn().mockResolvedValue({ error: null });
    const client = { from: jest.fn().mockReturnValue({ update }) } as unknown as SupabaseProfileClient;

    await finishOnboarding('campus', { client, scheduler: fakeScheduler() });

    expect(client.from).toHaveBeenCalledWith('profiles');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        daily_goal_minutes: 15,
        goal: 'campus',
        language_code: 'zu',
        onboarding_completed: true,
      }),
    );
  });

  it('surfaces a Supabase error instead of silently marking onboarding complete on the server', async () => {
    process.env.EXPO_PUBLIC_DEMO_MODE = 'false';
    const update = jest.fn().mockResolvedValue({ error: { message: 'not authenticated' } });
    const client = { from: jest.fn().mockReturnValue({ update }) } as unknown as SupabaseProfileClient;

    await expect(
      finishOnboarding('family', { client, scheduler: fakeScheduler() }),
    ).rejects.toThrow('not authenticated');
  });

  it('schedules the daily reminder once notification permission is granted', async () => {
    process.env.EXPO_PUBLIC_DEMO_MODE = 'true';
    await onboardingDraftRepository.save({
      ...(await onboardingDraftRepository.load()),
      reminderEnabled: true,
      reminderLocalTime: '08:15',
    });
    const client = {
      from: jest.fn().mockReturnValue({ update: jest.fn() }),
    } as unknown as SupabaseProfileClient;
    const scheduler = fakeScheduler('granted');

    await finishOnboarding('everyday', { client, scheduler });

    expect(scheduler.requestPermission).toHaveBeenCalledTimes(1);
    expect(scheduler.syncDailyReminder).toHaveBeenCalledWith({
      enabled: true,
      localTime: '08:15',
    });
  });

  it('does not schedule a reminder when the user opted out during onboarding', async () => {
    process.env.EXPO_PUBLIC_DEMO_MODE = 'true';
    await onboardingDraftRepository.save({
      ...(await onboardingDraftRepository.load()),
      reminderEnabled: false,
    });
    const client = {
      from: jest.fn().mockReturnValue({ update: jest.fn() }),
    } as unknown as SupabaseProfileClient;
    const scheduler = fakeScheduler('granted');

    await finishOnboarding('everyday', { client, scheduler });

    expect(scheduler.requestPermission).not.toHaveBeenCalled();
    expect(scheduler.syncDailyReminder).not.toHaveBeenCalled();
  });

  it('does not schedule a reminder when notification permission is denied', async () => {
    process.env.EXPO_PUBLIC_DEMO_MODE = 'true';
    await onboardingDraftRepository.save({
      ...(await onboardingDraftRepository.load()),
      reminderEnabled: true,
    });
    const client = {
      from: jest.fn().mockReturnValue({ update: jest.fn() }),
    } as unknown as SupabaseProfileClient;
    const scheduler = fakeScheduler('denied');

    await finishOnboarding('everyday', { client, scheduler });

    expect(scheduler.syncDailyReminder).not.toHaveBeenCalled();
  });
});
