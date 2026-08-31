import { createActor, type Actor } from 'xstate';

import type { LocalPersistence } from '@/infra/local/database';
import { createProgressRepository } from '@/features/lesson-runner/progress.repository';
import { createLessonMachine } from '@/features/lesson-runner/lesson.machine';
import { createProgressTracker } from '@/features/progress/progress-tracker';
import type { Lesson } from '@/types/domain';

type LessonActor = Actor<ReturnType<typeof createLessonMachine>>;

export type ActiveLessonRun = {
  lessonRunId: string;
  lesson: Lesson;
  ownerId: string;
  startedAt: number;
};

export type LessonRunCompletion = {
  activeLearningSeconds: number;
  activitiesCompleted: number;
  xpAwarded: number;
  currentStreakDays: number;
};

export type LessonRunStore = {
  start(ownerId: string, lesson: Lesson): ActiveLessonRun;
  getActive(): ActiveLessonRun | null;
  recordAttempt(activityId: string): Promise<void>;
  complete(completedAtIso?: string): Promise<LessonRunCompletion | null>;
};

export function createLessonRunStore(persistence: LocalPersistence): LessonRunStore {
  const progressRepository = createProgressRepository(persistence);
  const progressTracker = createProgressTracker(persistence);

  let active: ActiveLessonRun | null = null;
  let actor: LessonActor | null = null;

  function startActor(lesson: Lesson): LessonActor {
    actor?.stop();
    const next = createActor(createLessonMachine({ lesson }));
    next.start();
    next.send({ type: 'HYDRATE' });
    next.send({ type: 'START' });
    actor = next;
    return next;
  }

  function stopActor() {
    actor?.stop();
    actor = null;
  }

  return {
    start(ownerId, lesson) {
      if (active && active.ownerId === ownerId && active.lesson.id === lesson.id) return active;
      active = {
        lessonRunId: globalThis.crypto.randomUUID(),
        lesson,
        ownerId,
        startedAt: Date.now(),
      };
      startActor(lesson);
      return active;
    },
    getActive() {
      return active;
    },
    async recordAttempt(activityId) {
      const run = active;
      if (!run) throw new Error('No active lesson run.');
      const machine = actor ?? startActor(run.lesson);

      const attemptId = globalThis.crypto.randomUUID();
      machine.send({ type: 'SUBMIT', attemptId, outcome: 'correct' });
      machine.send({ type: 'CONTINUE' });

      await progressRepository.saveAttempt({
        id: attemptId,
        ownerId: run.ownerId,
        lessonRunId: run.lessonRunId,
        activityId,
        status: 'correct',
        createdAt: new Date().toISOString(),
      });
    },
    async complete(completedAtIso = new Date().toISOString()) {
      const run = active;
      if (!run) return null;

      const activitiesCompleted = actor?.getSnapshot().context.completedActivityIds.length ?? 0;
      const activeLearningSeconds = Math.max(0, Math.round((Date.now() - run.startedAt) / 1000));

      await progressRepository.completeLesson({
        id: globalThis.crypto.randomUUID(),
        ownerId: run.ownerId,
        lessonRunId: run.lessonRunId,
        lessonId: run.lesson.id,
        activeLearningSeconds,
        completedAt: completedAtIso,
      });
      const update = await progressTracker.recordLessonCompletion(
        run.ownerId,
        run.lessonRunId,
        run.lesson,
        completedAtIso,
      );

      stopActor();
      active = null;

      return {
        activeLearningSeconds,
        activitiesCompleted,
        xpAwarded: update.xpAwarded,
        currentStreakDays: update.progress.streak.currentDays,
      };
    },
  };
}
