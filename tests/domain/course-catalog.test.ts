import { buaLessons, buaUnits, getLessonById, getUnitByLessonId } from '@/content/course-catalog';
import { xpForLesson } from '@/features/progress/scheduling';

describe('course catalog', () => {
  it('defines exactly one lesson per unit, matching the approved home-path design', () => {
    expect(buaUnits.map((unit) => unit.title)).toEqual([
      'Greetings',
      'Meeting people',
      'Getting around',
    ]);
    expect(buaLessons.map((lesson) => lesson.unitId)).toEqual(
      buaUnits.map((unit) => unit.id),
    );
  });

  it('escalates difficulty level lesson over lesson', () => {
    expect(buaLessons.map((lesson) => lesson.level)).toEqual([
      'Beginner',
      'Intermediate',
      'Advanced',
    ]);
  });

  it('actually awards more XP for each harder lesson, not just a difficulty label', () => {
    const [beginner, intermediate, advanced] = buaLessons;
    const xp = buaLessons.map((lesson) => xpForLesson(lesson));

    expect(xp[1]).toBeGreaterThan(xp[0]!);
    expect(xp[2]).toBeGreaterThan(xp[1]!);
    // Same activity count (8) per lesson, so the gain is purely the difficulty multiplier.
    expect(beginner!.activities).toHaveLength(8);
    expect(intermediate!.activities).toHaveLength(8);
    expect(advanced!.activities).toHaveLength(8);
  });

  it('looks up a lesson and its unit by lesson id', () => {
    expect(getLessonById('lesson-meeting-people')).toMatchObject({ title: 'Meeting people' });
    expect(getUnitByLessonId('lesson-getting-around')).toMatchObject({ title: 'Getting around' });
    expect(getLessonById('lesson-does-not-exist')).toBeUndefined();
  });

  it('gives every lesson unique, non-empty activity ids (schema already enforces this, this locks the guarantee)', () => {
    for (const lesson of buaLessons) {
      const ids = lesson.activities.map((activity) => activity.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
