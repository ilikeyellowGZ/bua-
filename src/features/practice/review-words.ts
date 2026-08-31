import { buaLessons } from '@/content/course-catalog';
import type { SpacedRepetitionItem } from '@/types/domain';

export type ReviewWord = { zulu: string; english: string };

const activityIndex = new Map(
  buaLessons.flatMap((lesson) => lesson.activities.map((activity) => [activity.id, activity])),
);

/**
 * Resolves spaced-repetition due items (which key on activity id) back to the
 * isiZulu/English pair they were teaching, so a personalized review lesson
 * can be built from real content the learner has already seen. Only
 * "listen" and "phrase-builder" activities carry a genuine translation pair
 * (other kinds reuse the same hero phrase without a fresh gloss), so those
 * are the reliable source; everything else is skipped rather than guessed.
 */
export function resolveDueWords(dueItems: readonly SpacedRepetitionItem[]): ReviewWord[] {
  const seen = new Set<string>();
  const words: ReviewWord[] = [];

  for (const item of dueItems) {
    const activity = activityIndex.get(item.itemId);
    if (!activity) continue;

    const word =
      activity.kind === 'listen' && activity.translation
        ? { zulu: activity.prompt, english: activity.translation }
        : activity.kind === 'phrase-builder' && activity.answer
          ? { zulu: activity.answer, english: activity.prompt }
          : null;
    if (!word || seen.has(word.zulu)) continue;

    seen.add(word.zulu);
    words.push(word);
  }

  return words;
}
