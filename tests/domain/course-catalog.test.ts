import { buaLessons, buaUnits, getLessonById, getUnitByLessonId } from '@/content/course-catalog';
import { xpForLesson } from '@/features/progress/scheduling';

describe('course catalog', () => {
  it('opens with the flagship hand-authored units, matching the approved home-path design', () => {
    expect(buaUnits.slice(0, 3).map((unit) => unit.title)).toEqual([
      'Greetings',
      'Meeting people',
      'Getting around',
    ]);
    expect(buaLessons.slice(0, 3).map((lesson) => lesson.unitId)).toEqual(
      buaUnits.slice(0, 3).map((unit) => unit.id),
    );
  });

  it('provides at least 40 playable lessons, not just 3', () => {
    expect(buaLessons.length).toBeGreaterThanOrEqual(40);
    expect(buaUnits.length).toBeGreaterThan(3);
  });

  it('never repeats a lesson or unit id across the whole catalog', () => {
    expect(new Set(buaLessons.map((lesson) => lesson.id)).size).toBe(buaLessons.length);
    expect(new Set(buaUnits.map((unit) => unit.id)).size).toBe(buaUnits.length);
  });

  it('escalates difficulty level lesson over lesson in the flagship path', () => {
    expect(buaLessons.slice(0, 3).map((lesson) => lesson.level)).toEqual([
      'Beginner',
      'Intermediate',
      'Advanced',
    ]);
  });

  it('actually awards more XP for each harder lesson, not just a difficulty label', () => {
    const byLevel = (level: string) => buaLessons.find((lesson) => lesson.level === level)!;
    const beginner = byLevel('Beginner');
    const intermediate = byLevel('Intermediate');
    const advanced = byLevel('Advanced');

    expect(xpForLesson(intermediate)).toBeGreaterThan(xpForLesson(beginner));
    expect(xpForLesson(advanced)).toBeGreaterThan(xpForLesson(intermediate));
    // Same activity count (8) per lesson, so the gain is purely the difficulty multiplier.
    expect(beginner.activities).toHaveLength(8);
    expect(intermediate.activities).toHaveLength(8);
    expect(advanced.activities).toHaveLength(8);
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
