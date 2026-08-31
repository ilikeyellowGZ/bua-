import { applyStreak, scheduleNextReview, xpForLesson } from '@/features/progress/scheduling';
import type { Lesson } from '@/types/domain';

const activity = (id: string) => ({
  id,
  kind: 'listen' as const,
  order: 0,
  required: true,
  prompt: 'Sawubona',
});

const lessonWithLevel = (level: Lesson['level'], activityCount: number): Lesson => ({
  id: 'lesson-1',
  unitId: 'unit-1',
  title: 'Greetings',
  durationMinutes: 5,
  level,
  activities: Array.from({ length: activityCount }, (_, index) => activity(`activity-${index}`)),
});

describe('xpForLesson', () => {
  it('awards base XP per activity at the easy (Beginner) multiplier', () => {
    expect(xpForLesson(lessonWithLevel('Beginner', 3))).toBe(30);
  });

  it('doubles XP for the medium (Intermediate) multiplier', () => {
    expect(xpForLesson(lessonWithLevel('Intermediate', 3))).toBe(60);
  });

  it('triples XP for the hard (Advanced) multiplier', () => {
    expect(xpForLesson(lessonWithLevel('Advanced', 3))).toBe(90);
  });

  it('keeps base XP consistent for lessons of equal size and difficulty', () => {
    const first = lessonWithLevel('Intermediate', 4);
    const second = { ...lessonWithLevel('Intermediate', 4), id: 'lesson-2', title: 'Different' };
    expect(xpForLesson(first)).toBe(xpForLesson(second));
  });
});

describe('applyStreak', () => {
  const base = { currentStreakDays: 0, longestStreakDays: 0, lastActivityLocalDate: '' };

  it('starts a new streak at 1 day for a first-ever activity', () => {
    expect(applyStreak(base, '2026-08-31')).toEqual({
      currentStreakDays: 1,
      longestStreakDays: 1,
      lastActivityLocalDate: '2026-08-31',
    });
  });

  it('extends the streak when activity occurs on the very next local day', () => {
    const previous = {
      currentStreakDays: 4,
      longestStreakDays: 4,
      lastActivityLocalDate: '2026-08-30',
    };
    expect(applyStreak(previous, '2026-08-31')).toEqual({
      currentStreakDays: 5,
      longestStreakDays: 5,
      lastActivityLocalDate: '2026-08-31',
    });
  });

  it('does not double-count a second activity on the same local day', () => {
    const previous = {
      currentStreakDays: 5,
      longestStreakDays: 5,
      lastActivityLocalDate: '2026-08-31',
    };
    expect(applyStreak(previous, '2026-08-31')).toEqual({
      currentStreakDays: 5,
      longestStreakDays: 5,
      lastActivityLocalDate: '2026-08-31',
    });
  });

  it('resets the streak to 1 after skipping a full day', () => {
    const previous = {
      currentStreakDays: 12,
      longestStreakDays: 12,
      lastActivityLocalDate: '2026-08-20',
    };
    expect(applyStreak(previous, '2026-08-31')).toEqual({
      currentStreakDays: 1,
      longestStreakDays: 12,
      lastActivityLocalDate: '2026-08-31',
    });
  });

  it('preserves the longest streak on record after a reset', () => {
    const previous = {
      currentStreakDays: 30,
      longestStreakDays: 30,
      lastActivityLocalDate: '2026-01-01',
    };
    const result = applyStreak(previous, '2026-08-31');
    expect(result.currentStreakDays).toBe(1);
    expect(result.longestStreakDays).toBe(30);
  });
});

describe('scheduleNextReview', () => {
  const now = new Date('2026-08-31T00:00:00.000Z');

  it('schedules the first interval one day out for a passing first review', () => {
    const outcome = scheduleNextReview(null, 1, now);
    expect(outcome.repetitions).toBe(1);
    expect(outcome.intervalDays).toBeGreaterThanOrEqual(1);
    expect(new Date(outcome.nextReviewAt).getTime()).toBeGreaterThan(now.getTime());
  });

  it('advances through the configured interval sequence on repeated passes', () => {
    const first = scheduleNextReview(null, 0.9, now);
    const second = scheduleNextReview(first, 0.9, now);
    const third = scheduleNextReview(second, 0.9, now);

    expect(first.repetitions).toBe(1);
    expect(second.repetitions).toBe(2);
    expect(third.repetitions).toBe(3);
    expect(second.intervalDays).toBeGreaterThan(first.intervalDays);
    expect(third.intervalDays).toBeGreaterThan(second.intervalDays);
  });

  it('resets repetitions and schedules a same-day retry after a failing score', () => {
    const passed = scheduleNextReview(null, 0.9, now);
    const failed = scheduleNextReview(passed, 0.2, now);

    expect(failed.repetitions).toBe(0);
    expect(failed.intervalDays).toBe(1);
  });

  it('keeps the ease factor within the configured bounds', () => {
    let item = scheduleNextReview(null, 1, now);
    for (let i = 0; i < 20; i += 1) {
      item = scheduleNextReview(item, 1, now);
    }
    expect(item.easeFactor).toBeLessThanOrEqual(2.5);
    expect(item.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});
