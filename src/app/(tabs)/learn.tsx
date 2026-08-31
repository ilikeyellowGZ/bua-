import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import { buaLessons, buaUnits } from '@/content/course-catalog';
import { getOwnerId } from '@/features/auth/session';
import { LearnScreen } from '@/features/learning-path/learn-screen';
import { startingUnitIndexFor } from '@/features/learning-path/starting-unit';
import { computePathItems, type PathItem } from '@/features/learning-path/unit-progress';
import { onboardingDraftRepository } from '@/features/onboarding/draft.repository';
import { getProgressTracker } from '@/features/progress/default-tracker';
import { generateQuickReviewLesson } from '@/features/practice/quick-review';

export default function LearnRoute() {
  const router = useRouter();
  const generating = useRef(false);
  const [path, setPath] = useState<PathItem[] | undefined>(undefined);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [ownerId, tracker, draft] = await Promise.all([
        getOwnerId(),
        getProgressTracker(),
        onboardingDraftRepository.load(),
      ]);
      const completed = await tracker.getCompletedLessonIds(ownerId);
      if (cancelled) return;
      const startingUnitIndex = startingUnitIndexFor(draft.startingLevelChoice);
      setCompletedLessonIds(new Set(completed));
      setPath(computePathItems(buaUnits, buaLessons, completed, startingUnitIndex));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onQuickReview = async () => {
    if (generating.current) return;
    generating.current = true;
    try {
      const ownerId = await getOwnerId();
      const lesson = await generateQuickReviewLesson(ownerId);
      if (lesson) {
        router.push({ pathname: '/lesson/[lessonId]/listen', params: { lessonId: lesson.id } });
      } else {
        router.push('/lesson/lesson-introduce-yourself/sound-focus');
      }
    } finally {
      generating.current = false;
    }
  };

  const onSelectUnit = (unitId: string) => {
    const unitLessons = buaLessons.filter((lesson) => lesson.unitId === unitId);
    const nextLesson =
      unitLessons.find((lesson) => !completedLessonIds.has(lesson.id)) ?? unitLessons[0];
    if (nextLesson) {
      router.push({ pathname: '/lesson/[lessonId]/listen', params: { lessonId: nextLesson.id } });
    }
  };

  return (
    <LearnScreen
      onContinueLesson={() => router.push('/lesson/lesson-introduce-yourself/listen')}
      onQuickReview={onQuickReview}
      onSelectUnit={onSelectUnit}
      path={path}
    />
  );
}
