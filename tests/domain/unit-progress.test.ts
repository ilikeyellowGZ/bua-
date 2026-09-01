import { computePathItems } from '@/features/learning-path/unit-progress';
import type { Lesson, Unit } from '@/types/domain';

const units: Unit[] = [
  { id: 'unit-a', courseId: 'course-1', title: 'Unit A', order: 1 },
  { id: 'unit-b', courseId: 'course-1', title: 'Unit B', order: 2 },
  { id: 'unit-c', courseId: 'course-1', title: 'Unit C', order: 3 },
];

const lesson = (id: string, unitId: string): Lesson => ({
  id,
  unitId,
  title: id,
  durationMinutes: 10,
  level: 'Beginner',
  activities: [],
});

const lessons: Lesson[] = [
  lesson('lesson-a1', 'unit-a'),
  lesson('lesson-b1', 'unit-b'),
  lesson('lesson-b2', 'unit-b'),
  lesson('lesson-c1', 'unit-c'),
];

describe('computePathItems', () => {
  it('marks a unit complete only once every one of its lessons is completed', () => {
    const items = computePathItems(units, lessons, ['lesson-a1', 'lesson-b1']);

    expect(items.map((item) => [item.unitId, item.state])).toEqual([
      ['unit-a', 'complete'],
      ['unit-b', 'active'],
      ['unit-c', 'locked'],
    ]);
    expect(items[1]).toMatchObject({ completedLessons: 1, totalLessons: 2 });
  });

  it('unlocks the first unit as active when nothing is completed yet', () => {
    const items = computePathItems(units, lessons, []);
    expect(items.map((item) => item.state)).toEqual(['active', 'locked', 'locked']);
  });

  it('marks every unit complete once all lessons are done', () => {
    const items = computePathItems(units, lessons, [
      'lesson-a1',
      'lesson-b1',
      'lesson-b2',
      'lesson-c1',
    ]);
    expect(items.map((item) => item.state)).toEqual(['complete', 'complete', 'complete']);
  });

  it('orders units by their declared order regardless of input array order', () => {
    const shuffled = [units[2]!, units[0]!, units[1]!];
    const items = computePathItems(shuffled, lessons, []);
    expect(items.map((item) => item.unitId)).toEqual(['unit-a', 'unit-b', 'unit-c']);
  });

  it('unlocks every unit before the placement starting index even if not completed', () => {
    const items = computePathItems(units, lessons, [], 2);
    expect(items.map((item) => item.state)).toEqual(['active', 'active', 'active']);
  });

  it('still locks units past the placement index once a real incomplete unit is hit', () => {
    const fourUnits = [...units, { id: 'unit-d', courseId: 'course-1', title: 'Unit D', order: 4 }];
    const fourLessons = [...lessons, lesson('lesson-d1', 'unit-d')];
    const items = computePathItems(fourUnits, fourLessons, [], 2);
    expect(items.map((item) => item.state)).toEqual(['active', 'active', 'active', 'locked']);
  });
});
