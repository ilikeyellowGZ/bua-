import { useEffect } from 'react';

import { buaSeedContent } from '@/content/seed';
import { getOwnerId } from '@/features/auth/session';
import { getLessonRunStore } from '@/features/lesson-runner/default-lesson-run-store';

export function useLessonActivity(activityId: string) {
  useEffect(() => {
    (async () => {
      const [ownerId, store] = await Promise.all([getOwnerId(), getLessonRunStore()]);
      if (!store.getActive()) store.start(ownerId, buaSeedContent.lesson);
    })();
  }, []);

  const recordAndContinue = async (onContinue: () => void) => {
    const [ownerId, store] = await Promise.all([getOwnerId(), getLessonRunStore()]);
    if (!store.getActive()) store.start(ownerId, buaSeedContent.lesson);
    await store.recordAttempt(activityId);
    onContinue();
  };

  return { recordAndContinue };
}
