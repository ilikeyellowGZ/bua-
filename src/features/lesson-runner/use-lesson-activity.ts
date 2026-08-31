import { useEffect } from 'react';

import { getLessonById } from '@/content/course-catalog';
import { getOwnerId } from '@/features/auth/session';
import { getLessonRunStore } from '@/features/lesson-runner/default-lesson-run-store';
import type { Activity, ActivityKind, Lesson } from '@/types/domain';

export function getActivityByKind(lesson: Lesson, kind: ActivityKind): Activity {
  const activity = lesson.activities.find((candidate) => candidate.kind === kind);
  if (!activity) throw new Error(`Lesson "${lesson.id}" has no "${kind}" activity.`);
  return activity;
}

export function useLessonActivity(lessonId: string, kind: ActivityKind) {
  const lesson = getLessonById(lessonId);
  if (!lesson) throw new Error(`Unknown lesson: ${lessonId}`);
  const activity = getActivityByKind(lesson, kind);

  useEffect(() => {
    (async () => {
      const [ownerId, store] = await Promise.all([getOwnerId(), getLessonRunStore()]);
      store.start(ownerId, lesson);
    })();
  }, [lesson]);

  const recordAndContinue = async (performanceScore: number, onContinue: () => void) => {
    const [ownerId, store] = await Promise.all([getOwnerId(), getLessonRunStore()]);
    store.start(ownerId, lesson);
    await store.recordAttempt(activity.id, performanceScore);
    onContinue();
  };

  return { lesson, activity, recordAndContinue };
}
