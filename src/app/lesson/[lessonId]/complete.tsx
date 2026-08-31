import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { LessonCompleteScreen } from '@/features/lesson-runner/screens';
import { getOwnerId } from '@/features/auth/session';
import { getLessonRunStore } from '@/features/lesson-runner/default-lesson-run-store';
import { getProgressTracker } from '@/features/progress/default-tracker';

type CompletionSummary = {
  activeMinutes: number;
  activitiesCompleted: number;
  currentStreakDays: number;
  xpAwarded: number;
};

export default function CompleteRoute() {
  const router = useRouter();
  const [summary, setSummary] = useState<CompletionSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ownerId = await getOwnerId();
      const store = await getLessonRunStore();
      const result = await store.complete();
      if (cancelled) return;

      if (result) {
        setSummary({
          activeMinutes: Math.max(1, Math.round(result.activeLearningSeconds / 60)),
          activitiesCompleted: result.activitiesCompleted,
          currentStreakDays: result.currentStreakDays,
          xpAwarded: result.xpAwarded,
        });
        return;
      }

      const tracker = await getProgressTracker();
      const progress = await tracker.getProgress(ownerId);
      if (!cancelled) {
        setSummary({
          activeMinutes: 0,
          activitiesCompleted: 0,
          currentStreakDays: progress.streak.currentDays,
          xpAwarded: 0,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!summary) return null;

  return (
    <LessonCompleteScreen
      activeMinutes={summary.activeMinutes}
      activitiesCompleted={summary.activitiesCompleted}
      currentStreakDays={summary.currentStreakDays}
      xpAwarded={summary.xpAwarded}
      onBackHome={() => router.replace('/learn')}
      onKeepLearning={() => router.replace('/learn')}
    />
  );
}
