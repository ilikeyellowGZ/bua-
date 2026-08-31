import type { Lesson } from '@/types/domain';

const XP_MULTIPLIER_BY_LEVEL: Record<Lesson['level'], number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

const BASE_XP_PER_ACTIVITY = 10;

export function xpForLesson(lesson: Lesson): number {
  return lesson.activities.length * BASE_XP_PER_ACTIVITY * XP_MULTIPLIER_BY_LEVEL[lesson.level];
}

export type StreakInput = {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityLocalDate: string;
};

export type StreakOutcome = {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityLocalDate: string;
};

function daysBetweenLocalDates(fromLocalDate: string, toLocalDate: string): number {
  const from = Date.parse(`${fromLocalDate}T00:00:00.000Z`);
  const to = Date.parse(`${toLocalDate}T00:00:00.000Z`);
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function applyStreak(previous: StreakInput, activityLocalDate: string): StreakOutcome {
  const hasPriorActivity = previous.lastActivityLocalDate !== '';
  const gapDays = hasPriorActivity
    ? daysBetweenLocalDates(previous.lastActivityLocalDate, activityLocalDate)
    : null;

  let currentStreakDays: number;
  if (gapDays === null || gapDays > 1) {
    currentStreakDays = 1;
  } else if (gapDays === 1) {
    currentStreakDays = previous.currentStreakDays + 1;
  } else {
    currentStreakDays = Math.max(previous.currentStreakDays, 1);
  }

  return {
    currentStreakDays,
    longestStreakDays: Math.max(previous.longestStreakDays, currentStreakDays),
    lastActivityLocalDate: activityLocalDate,
  };
}

const REVIEW_INTERVALS_DAYS = [1, 7, 30] as const;
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;
const DEFAULT_EASE_FACTOR = 2.0;
const PASSING_PERFORMANCE = 0.6;
const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type ReviewScheduleInput = {
  easeFactor: number;
  repetitions: number;
} | null;

export type ReviewScheduleOutcome = {
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string;
};

export function scheduleNextReview(
  previous: ReviewScheduleInput,
  performanceScore: number,
  now: Date,
): ReviewScheduleOutcome {
  const passed = performanceScore >= PASSING_PERFORMANCE;
  const repetitions = passed ? (previous?.repetitions ?? 0) + 1 : 0;
  const previousEase = previous?.easeFactor ?? DEFAULT_EASE_FACTOR;
  const easeFactor = clamp(
    previousEase + (performanceScore - PASSING_PERFORMANCE) * 0.4,
    MIN_EASE_FACTOR,
    MAX_EASE_FACTOR,
  );
  const baseIntervalDays =
    REVIEW_INTERVALS_DAYS[Math.min(repetitions, REVIEW_INTERVALS_DAYS.length - 1)] ??
    REVIEW_INTERVALS_DAYS[0];
  const intervalDays = passed ? Math.round(baseIntervalDays * easeFactor) : 1;
  const nextReviewAt = new Date(now.getTime() + intervalDays * DAY_MS).toISOString();

  return { intervalDays, easeFactor, repetitions, nextReviewAt };
}
