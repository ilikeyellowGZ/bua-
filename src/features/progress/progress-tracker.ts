import type { LocalPersistence, LocalProgress, LocalReviewItem } from '@/infra/local/database';
import { pendingOperation, syncOperationId } from '@/features/lesson-runner/progress.repository';
import { applyStreak, scheduleNextReview, xpForLesson } from '@/features/progress/scheduling';
import type { Lesson, Progress, ProgressUpdate, SpacedRepetitionItem } from '@/types/domain';

const emptyProgress = (ownerId: string): LocalProgress => ({
  ownerId,
  totalXp: 0,
  currentStreakDays: 0,
  longestStreakDays: 0,
  lastActivityLocalDate: '',
  updatedAt: new Date(0).toISOString(),
});

function toProgress(stored: LocalProgress): Progress {
  return {
    ownerId: stored.ownerId,
    totalXP: stored.totalXp,
    streak: {
      currentDays: stored.currentStreakDays,
      longestDays: stored.longestStreakDays,
      lastCompletedLocalDate: stored.lastActivityLocalDate,
    },
  };
}

function toSpacedRepetitionItem(stored: LocalReviewItem): SpacedRepetitionItem {
  return {
    itemId: stored.itemId,
    ownerId: stored.ownerId,
    nextReviewAt: stored.nextReviewAt,
    intervalDays: stored.intervalDays,
    easeFactor: stored.easeFactor,
    repetitions: stored.repetitions,
  };
}

export type ProgressTracker = {
  getProgress(ownerId: string): Promise<Progress>;
  getCompletedLessonIds(ownerId: string): Promise<string[]>;
  recordLessonCompletion(
    ownerId: string,
    lessonRunId: string,
    lesson: Lesson,
    completedAtIso: string,
  ): Promise<ProgressUpdate>;
  scheduleReview(
    ownerId: string,
    itemId: string,
    performanceScore: number,
    now?: Date,
  ): Promise<SpacedRepetitionItem>;
  getDueReviews(ownerId: string, at?: Date): Promise<SpacedRepetitionItem[]>;
};

export function createProgressTracker(persistence: LocalPersistence): ProgressTracker {
  return {
    async getProgress(ownerId) {
      const stored = await persistence.getProgress(ownerId);
      return toProgress(stored ?? emptyProgress(ownerId));
    },
    async getCompletedLessonIds(ownerId) {
      return persistence.listCompletedLessonIds(ownerId);
    },
    async recordLessonCompletion(ownerId, lessonRunId, lesson, completedAtIso) {
      return persistence.transaction(async (store) => {
        const stored = (await store.getProgress(ownerId)) ?? emptyProgress(ownerId);
        const operationId = syncOperationId(ownerId, 'profile', lessonRunId);
        const alreadyAwarded = await store.getSyncOperation(operationId);
        if (alreadyAwarded) {
          return { progress: toProgress(stored), xpAwarded: 0, streakExtended: false };
        }

        const activityLocalDate = completedAtIso.slice(0, 10);
        const streak = applyStreak(stored, activityLocalDate);
        const xpAwarded = xpForLesson(lesson);
        const updated: LocalProgress = {
          ownerId,
          totalXp: stored.totalXp + xpAwarded,
          currentStreakDays: streak.currentStreakDays,
          longestStreakDays: streak.longestStreakDays,
          lastActivityLocalDate: streak.lastActivityLocalDate,
          updatedAt: completedAtIso,
        };
        await store.upsertProgress(updated);
        await store.upsertSyncOperation(
          pendingOperation(ownerId, 'profile', lessonRunId, {
            ownerId,
            xpAwarded,
            currentStreakDays: updated.currentStreakDays,
            longestStreakDays: updated.longestStreakDays,
            lastActivityLocalDate: updated.lastActivityLocalDate,
          }),
        );
        return {
          progress: toProgress(updated),
          xpAwarded,
          streakExtended: streak.currentStreakDays > stored.currentStreakDays,
        };
      });
    },
    async scheduleReview(ownerId, itemId, performanceScore, now = new Date()) {
      return persistence.transaction(async (store) => {
        const existing = await store.getReviewItem(ownerId, itemId);
        const outcome = scheduleNextReview(existing, performanceScore, now);
        const updated: LocalReviewItem = {
          ownerId,
          itemId,
          nextReviewAt: outcome.nextReviewAt,
          intervalDays: outcome.intervalDays,
          easeFactor: outcome.easeFactor,
          repetitions: outcome.repetitions,
          updatedAt: now.toISOString(),
        };
        await store.upsertReviewItem(updated);
        return toSpacedRepetitionItem(updated);
      });
    },
    async getDueReviews(ownerId, at = new Date()) {
      const items = await persistence.listDueReviewItems(ownerId, at.toISOString());
      return items.map(toSpacedRepetitionItem);
    },
  };
}
