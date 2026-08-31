import type { Lesson, Unit } from '@/types/domain';

export type PathItemState = 'complete' | 'active' | 'locked';

export type PathItem = {
  unitId: string;
  title: string;
  unitLabel: string;
  state: PathItemState;
  completedLessons: number;
  totalLessons: number;
};

/**
 * Derives each unit's home-path state from real completion data: a unit is
 * "complete" once every one of its lessons has been completed, "active" if
 * it's reachable but not yet complete, and "locked" otherwise. Units are
 * walked in `order`, so progress unlocks sequentially the same way the
 * original hand-authored 3-unit path did.
 *
 * `startingUnitIndex` (0-based, from the learner's onboarding placement —
 * see starting-unit.ts) marks every unit before it as reachable regardless
 * of completion, so a learner who places as "conversation" isn't forced to
 * click through beginner units they've already tested out of.
 */
export function computePathItems(
  units: readonly Unit[],
  lessons: readonly Lesson[],
  completedLessonIds: readonly string[],
  startingUnitIndex = 0,
): PathItem[] {
  const completedSet = new Set(completedLessonIds);
  const sortedUnits = [...units].sort((left, right) => left.order - right.order);
  let frontierOpen = true;

  return sortedUnits.map((unit, index) => {
    const unitLessons = lessons.filter((lesson) => lesson.unitId === unit.id);
    const completedLessons = unitLessons.filter((lesson) => completedSet.has(lesson.id)).length;
    const isComplete = unitLessons.length > 0 && completedLessons === unitLessons.length;
    const placementUnlocked = index < startingUnitIndex;

    const state: PathItemState = isComplete
      ? 'complete'
      : frontierOpen || placementUnlocked
        ? 'active'
        : 'locked';
    if (!isComplete && !placementUnlocked) frontierOpen = false;

    return {
      unitId: unit.id,
      title: unit.title,
      unitLabel: `Unit ${index + 1}`,
      state,
      completedLessons,
      totalLessons: unitLessons.length,
    };
  });
}
