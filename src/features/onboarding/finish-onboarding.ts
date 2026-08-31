import {
  notificationScheduler,
  type NotificationScheduler,
} from '@/features/notifications/notification-scheduler';
import { updateOnboardingDraft } from '@/features/onboarding/update-draft';
import { getSupabaseClient } from '@/infra/supabase/client';
import type { GoalKind } from '@/types/domain';

export type SupabaseProfileClient = Pick<ReturnType<typeof getSupabaseClient>, 'from'>;

type FinishOnboardingOptions = {
  client?: SupabaseProfileClient;
  scheduler?: NotificationScheduler;
};

/**
 * Commits the collected onboarding draft: marks it complete locally (so cold
 * start can skip straight to /learn), syncs the chosen daily goal, language,
 * and goal onto the real profile row outside demo mode, and schedules the
 * daily reminder if the user opted into one during onboarding.
 */
export async function finishOnboarding(
  goal: GoalKind,
  { client, scheduler = notificationScheduler }: FinishOnboardingOptions = {},
): Promise<void> {
  const draft = await updateOnboardingDraft({ goal, completed: true });

  if (process.env.EXPO_PUBLIC_DEMO_MODE === 'false') {
    const supabase = client ?? getSupabaseClient();
    const { error } = await supabase.from('profiles').update({
      daily_goal_minutes: draft.dailyTargetMinutes,
      goal: draft.goal,
      ...(draft.languageCode ? { language_code: draft.languageCode } : {}),
      onboarding_completed: true,
    });
    if (error) throw new Error(error.message);
  }

  if (draft.reminderEnabled) {
    const permission = await scheduler.requestPermission();
    if (permission === 'granted') {
      await scheduler.syncDailyReminder({
        enabled: true,
        localTime: draft.reminderLocalTime,
      });
    }
  }
}
