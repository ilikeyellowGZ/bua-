import { createMemoryPersistence } from '@/infra/local/database';
import { createProgressTracker } from '@/features/progress/progress-tracker';
import type { Lesson } from '@/types/domain';

const ownerId = '11111111-1111-4111-8111-111111111111';

const lesson: Lesson = {
  id: 'lesson-introduce-yourself',
  unitId: 'unit-1',
  title: 'Introduce Yourself',
  durationMinutes: 5,
  level: 'Intermediate',
  activities: [
    { id: 'activity-1', kind: 'listen', order: 0, required: true, prompt: 'Sawubona' },
    { id: 'activity-2', kind: 'speak', order: 1, required: true, prompt: 'Sawubona' },
  ],
};

describe('ProgressTracker', () => {
  it('awards XP and starts a streak on the first lesson completion', async () => {
    const persistence = createMemoryPersistence();
    const tracker = createProgressTracker(persistence);

    const update = await tracker.recordLessonCompletion(
      ownerId,
      'run-1',
      lesson,
      '2026-08-31T10:00:00.000Z',
    );

    expect(update.xpAwarded).toBe(40);
    expect(update.streakExtended).toBe(true);
    expect(update.progress).toEqual({
      ownerId,
      totalXP: 40,
      streak: { currentDays: 1, longestDays: 1, lastCompletedLocalDate: '2026-08-31' },
    });
  });

  it('persists progress across repository instances', async () => {
    const persistence = createMemoryPersistence();
    const first = createProgressTracker(persistence);
    await first.recordLessonCompletion(ownerId, 'run-1', lesson, '2026-08-31T10:00:00.000Z');

    const restarted = createProgressTracker(persistence);
    expect(await restarted.getProgress(ownerId)).toMatchObject({ totalXP: 40 });
  });

  it('accumulates XP and extends the streak across consecutive days', async () => {
    const persistence = createMemoryPersistence();
    const tracker = createProgressTracker(persistence);

    await tracker.recordLessonCompletion(ownerId, 'run-1', lesson, '2026-08-30T10:00:00.000Z');
    const update = await tracker.recordLessonCompletion(
      ownerId,
      'run-2',
      lesson,
      '2026-08-31T10:00:00.000Z',
    );

    expect(update.progress.totalXP).toBe(80);
    expect(update.progress.streak.currentDays).toBe(2);
    expect(update.streakExtended).toBe(true);
  });

  it('resets the streak after a missed day but keeps the longest streak on record', async () => {
    const persistence = createMemoryPersistence();
    const tracker = createProgressTracker(persistence);

    await tracker.recordLessonCompletion(ownerId, 'run-1', lesson, '2026-08-01T10:00:00.000Z');
    await tracker.recordLessonCompletion(ownerId, 'run-2', lesson, '2026-08-02T10:00:00.000Z');
    const update = await tracker.recordLessonCompletion(
      ownerId,
      'run-3',
      lesson,
      '2026-08-31T10:00:00.000Z',
    );

    expect(update.progress.streak.currentDays).toBe(1);
    expect(update.progress.streak.longestDays).toBe(2);
    expect(update.streakExtended).toBe(false);
  });

  it('enqueues exactly one idempotent profile sync operation per lesson run', async () => {
    const persistence = createMemoryPersistence();
    const tracker = createProgressTracker(persistence);

    await tracker.recordLessonCompletion(ownerId, 'run-1', lesson, '2026-08-31T10:00:00.000Z');
    await tracker.recordLessonCompletion(ownerId, 'run-1', lesson, '2026-08-31T10:05:00.000Z');

    const operations = await persistence.listSyncOperations();
    expect(operations).toHaveLength(1);
    expect(operations[0]).toMatchObject({
      kind: 'profile',
      aggregateId: 'run-1',
      status: 'pending',
    });
  });

  it('lists completed lesson ids for the owner, deduplicated across repeat runs', async () => {
    const persistence = createMemoryPersistence();
    const tracker = createProgressTracker(persistence);
    const completion = (id: string, forOwnerId: string, lessonId: string) => ({
      id,
      ownerId: forOwnerId,
      lessonRunId: id,
      lessonId,
      activeLearningSeconds: 60,
      completedAt: '2026-08-31T10:00:00.000Z',
    });

    await persistence.insertCompletionOnce(completion('run-1', ownerId, 'lesson-introduce-yourself'));
    await persistence.insertCompletionOnce(completion('run-1', ownerId, 'lesson-introduce-yourself'));
    await persistence.insertCompletionOnce(completion('run-2', ownerId, 'lesson-two'));
    await persistence.insertCompletionOnce(completion('run-3', 'someone-else', 'lesson-introduce-yourself'));

    const completed = await tracker.getCompletedLessonIds(ownerId);
    expect(new Set(completed)).toEqual(new Set(['lesson-introduce-yourself', 'lesson-two']));
  });

  it('schedules spaced repetition reviews using the configured interval sequence', async () => {
    const persistence = createMemoryPersistence();
    const tracker = createProgressTracker(persistence);
    const now = new Date('2026-08-31T00:00:00.000Z');

    const firstReview = await tracker.scheduleReview(ownerId, 'activity-1', 0.9, now);
    expect(firstReview.repetitions).toBe(1);

    const dueBeforeInterval = await tracker.getDueReviews(ownerId, now);
    expect(dueBeforeInterval).toHaveLength(0);

    const dueAfterInterval = await tracker.getDueReviews(
      ownerId,
      new Date(now.getTime() + firstReview.intervalDays * 24 * 60 * 60 * 1000),
    );
    expect(dueAfterInterval.map((item) => item.itemId)).toContain('activity-1');
  });
});
