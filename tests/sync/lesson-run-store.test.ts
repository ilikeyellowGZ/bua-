import { createMemoryPersistence } from '@/infra/local/database';
import { createLessonRunStore } from '@/features/lesson-runner/lesson-run.store';
import { buaSeedContent } from '@/content/seed';

const ownerId = '11111111-1111-4111-8111-111111111111';

describe('LessonRunStore', () => {
  it('drives the lesson machine through every activity and reports a full completion summary', async () => {
    const persistence = createMemoryPersistence();
    const store = createLessonRunStore(persistence);

    const run = store.start(ownerId, buaSeedContent.lesson);
    expect(store.getActive()).toEqual(run);

    for (const activity of buaSeedContent.lesson.activities) {
      await store.recordAttempt(activity.id);
    }

    const summary = await store.complete();
    expect(summary).toMatchObject({
      activitiesCompleted: buaSeedContent.lesson.activities.length,
      xpAwarded: buaSeedContent.lesson.activities.length * 10, // Beginner multiplier is 1x
      currentStreakDays: 1,
    });
    expect(summary?.activeLearningSeconds).toBeGreaterThanOrEqual(0);
    expect(store.getActive()).toBeNull();
  });

  it('persists an attempt for every recorded activity, keyed to the lesson run', async () => {
    const persistence = createMemoryPersistence();
    const store = createLessonRunStore(persistence);
    const run = store.start(ownerId, buaSeedContent.lesson);

    await store.recordAttempt('activity-introduce-listen');
    await store.recordAttempt('activity-introduce-phrase-builder');

    const attempts = await persistence.listAttempts(run.lessonRunId);
    expect(attempts.map((attempt) => attempt.activityId)).toEqual([
      'activity-introduce-listen',
      'activity-introduce-phrase-builder',
    ]);
    expect(attempts.every((attempt) => attempt.status === 'correct')).toBe(true);
  });

  it('resumes the same run across repeated start calls for the same owner and lesson', () => {
    const persistence = createMemoryPersistence();
    const store = createLessonRunStore(persistence);

    const first = store.start(ownerId, buaSeedContent.lesson);
    const second = store.start(ownerId, buaSeedContent.lesson);

    expect(second).toBe(first);
  });

  it('returns null from complete() when no lesson run is active', async () => {
    const persistence = createMemoryPersistence();
    const store = createLessonRunStore(persistence);
    expect(await store.complete()).toBeNull();
  });

  it('raises a clear error when recording an attempt with no active run', async () => {
    const persistence = createMemoryPersistence();
    const store = createLessonRunStore(persistence);
    await expect(store.recordAttempt('activity-introduce-listen')).rejects.toThrow(
      'No active lesson run.',
    );
  });
});
