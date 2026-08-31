import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';

import { LessonCompleteScreen } from '@/features/lesson-runner/screens';
import { getOwnerId } from '@/features/auth/session';
import { getLessonRunStore } from '@/features/lesson-runner/default-lesson-run-store';
import { getProgressTracker } from '@/features/progress/default-tracker';
import { withTimeout } from '@/core/async/with-timeout';

type CompletionSummary = {
  activeMinutes: number;
  activitiesCompleted: number;
  currentStreakDays: number;
  xpAwarded: number;
};

const DEFAULT_SUMMARY: CompletionSummary = {
  activeMinutes: 0,
  activitiesCompleted: 0,
  currentStreakDays: 0,
  xpAwarded: 0,
};

const PERSISTENCE_TIMEOUT_MS = 8000;

async function loadCompletionSummary(): Promise<CompletionSummary> {
  const ownerId = await getOwnerId();
  const store = await getLessonRunStore();
  const result = await store.complete();

  if (result) {
    return {
      activeMinutes: Math.max(1, Math.round(result.activeLearningSeconds / 60)),
      activitiesCompleted: result.activitiesCompleted,
      currentStreakDays: result.currentStreakDays,
      xpAwarded: result.xpAwarded,
    };
  }

  const tracker = await getProgressTracker();
  const progress = await tracker.getProgress(ownerId);
  return {
    activeMinutes: 0,
    activitiesCompleted: 0,
    currentStreakDays: progress.streak.currentDays,
    xpAwarded: 0,
  };
}

export default function CompleteRoute() {
  const router = useRouter();
  const [summary, setSummary] = useState<CompletionSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Local persistence should resolve almost instantly, but never let a
    // stalled read (or a broken platform-specific storage backend) leave
    // this screen blank forever — fall back to a safe zero-state summary.
    withTimeout(loadCompletionSummary(), PERSISTENCE_TIMEOUT_MS, DEFAULT_SUMMARY).then((result) => {
      if (!cancelled) setSummary(result);
    });

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
