import { getLessonById } from '@/content/course-catalog';
import { generateQuickReviewLesson } from '@/features/practice/quick-review';
import type { ProgressTracker } from '@/features/progress/progress-tracker';
import type { SpacedRepetitionItem } from '@/types/domain';

function dueItem(itemId: string): SpacedRepetitionItem {
  return {
    itemId,
    ownerId: 'owner-1',
    nextReviewAt: new Date(0).toISOString(),
    intervalDays: 1,
    easeFactor: 2,
    repetitions: 1,
  };
}

function fakeTracker(itemIds: string[]): ProgressTracker {
  return {
    getDueReviews: jest.fn().mockResolvedValue(itemIds.map(dueItem)),
  } as unknown as ProgressTracker;
}

describe('generateQuickReviewLesson', () => {
  it('returns null when there are not enough due words to build a review lesson', async () => {
    const lesson = await generateQuickReviewLesson('owner-1', { tracker: fakeTracker([]) });
    expect(lesson).toBeNull();
  });

  it('builds the review deterministically in demo mode, without calling the AI generator', async () => {
    const generateAi = jest.fn();
    const tracker = fakeTracker(['activity-introduce-listen', 'activity-meeting-listen']);

    const lesson = await generateQuickReviewLesson('owner-1', {
      tracker,
      generateAi,
      isDemoMode: true,
    });

    expect(generateAi).not.toHaveBeenCalled();
    expect(lesson).not.toBeNull();
    expect(getLessonById(lesson!.id)).toEqual(lesson);
  });

  it('uses the AI-generated lesson outside demo mode when it succeeds', async () => {
    const aiLesson = { id: 'lesson-ai-review-1', unitId: 'unit-review' } as never;
    const generateAi = jest.fn().mockResolvedValue(aiLesson);
    const tracker = fakeTracker(['activity-introduce-listen', 'activity-meeting-listen']);

    const lesson = await generateQuickReviewLesson('owner-1', {
      tracker,
      generateAi,
      isDemoMode: false,
    });

    expect(generateAi).toHaveBeenCalledTimes(1);
    expect(lesson).toBe(aiLesson);
  });

  it('falls back to the deterministic lesson when the AI generator fails outside demo mode', async () => {
    const generateAi = jest.fn().mockRejectedValue(new Error('AI provider error'));
    const tracker = fakeTracker(['activity-introduce-listen', 'activity-meeting-listen']);

    const lesson = await generateQuickReviewLesson('owner-1', {
      tracker,
      generateAi,
      isDemoMode: false,
    });

    expect(generateAi).toHaveBeenCalledTimes(1);
    expect(lesson).not.toBeNull();
    expect(lesson!.title).toBe('Quick review');
  });
});
