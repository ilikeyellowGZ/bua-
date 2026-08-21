import type { Lesson } from '@/types/domain';

export type LessonProgress = {
  completed: number;
  total: number;
  ratio: number;
};

export function calculateLessonProgress(
  lesson: Lesson,
  completedActivityIds: readonly string[],
): LessonProgress {
  const completedSet = new Set(completedActivityIds);
  const requiredActivities = lesson.activities.filter((activity) => activity.required);
  const completed = requiredActivities.filter((activity) => completedSet.has(activity.id)).length;
  const total = requiredActivities.length;

  return {
    completed,
    total,
    ratio: total === 0 ? 1 : completed / total,
  };
}
