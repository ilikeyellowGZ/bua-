import { registerEphemeralLesson } from '@/content/course-catalog';
import { generateAiReviewLesson } from '@/features/practice/ai-review-lesson';
import { buildDeterministicReviewLesson } from '@/features/practice/deterministic-review-lesson';
import { resolveDueWords } from '@/features/practice/review-words';
import { getProgressTracker } from '@/features/progress/default-tracker';
import type { ProgressTracker } from '@/features/progress/progress-tracker';
import type { Lesson } from '@/types/domain';

type QuickReviewOptions = {
  tracker?: ProgressTracker;
  generateAi?: typeof generateAiReviewLesson;
  isDemoMode?: boolean;
};

/**
 * Builds a personalized review lesson from the learner's own spaced-
 * repetition due items and registers it so it can be opened through the
 * normal `/lesson/[lessonId]/*` routes. Returns null when there aren't
 * enough due items yet to build a meaningful review (the caller should fall
 * back to something else, e.g. the general practice screen).
 *
 * Real mode calls the `generate-lesson` Edge Function (OpenAI-backed) so two
 * learners with different mistakes get genuinely different AI-written
 * content; demo mode — and any real-mode failure — falls back to composing
 * the review deterministically from the same due words, so this never
 * leaves the learner stuck without a review lesson.
 */
export async function generateQuickReviewLesson(
  ownerId: string,
  {
    tracker,
    generateAi = generateAiReviewLesson,
    isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE !== 'false',
  }: QuickReviewOptions = {},
): Promise<Lesson | null> {
  const resolvedTracker = tracker ?? (await getProgressTracker());
  const dueItems = await resolvedTracker.getDueReviews(ownerId);
  const words = resolveDueWords(dueItems);
  if (words.length < 2) return null;

  let lesson: Lesson;
  if (!isDemoMode) {
    try {
      lesson = await generateAi(words, 'Beginner');
    } catch {
      lesson = buildDeterministicReviewLesson(words);
    }
  } else {
    lesson = buildDeterministicReviewLesson(words);
  }

  registerEphemeralLesson(lesson);
  return lesson;
}
