import { conversationTemplates, type Topic } from '@/content/vocabulary-bank';
import { lessonSchema } from '@/content/schemas';
import type { Lesson } from '@/types/domain';

const DURATION_MINUTES_BY_LEVEL: Record<Lesson['level'], number> = {
  Beginner: 12,
  Intermediate: 14,
  Advanced: 16,
};

function capitalize(word: string): string {
  return word.length > 0 ? `${word[0]?.toUpperCase()}${word.slice(1)}` : word;
}

/**
 * Deterministically composes a full 8-activity `Lesson` from a topic's
 * vocabulary/phrase bank — no randomness, so `generateLesson(topic, unitId, 2)`
 * always returns the same lesson. `lessonIndex` (0-based) selects which of the
 * topic's phrases/vocab becomes this lesson's focus, cycling with wraparound
 * so the topic's bank can back more lessons than it has distinct phrases for.
 *
 * The result is validated with `lessonSchema.parse` before returning, so a
 * malformed generated lesson fails loudly at catalog-build time rather than
 * silently reaching a learner.
 */
export function generateLesson(topic: Topic, unitId: string, lessonIndex: number): Lesson {
  const heroPhrase = topic.phrases[lessonIndex % topic.phrases.length];
  if (!heroPhrase) throw new Error(`Topic "${topic.id}" has no phrases to generate from.`);

  const pictureTarget = topic.vocab[(lessonIndex + 1) % topic.vocab.length];
  if (!pictureTarget) throw new Error(`Topic "${topic.id}" has no vocabulary to generate from.`);

  const conversation = conversationTemplates[lessonIndex % conversationTemplates.length];
  if (!conversation) throw new Error('No conversation templates available.');

  const otherPhrases = topic.phrases.filter((phrase) => phrase.id !== heroPhrase.id);
  const [comprehensionDistractorA, comprehensionDistractorB] = otherPhrases;

  const lessonId = `lesson-${topic.id}-${lessonIndex}`;
  const activityId = (kind: string) => `activity-${topic.id}-${lessonIndex}-${kind}`;

  const candidate = {
    id: lessonId,
    unitId,
    title: `${topic.title} ${lessonIndex + 1}`,
    durationMinutes: DURATION_MINUTES_BY_LEVEL[topic.level],
    level: topic.level,
    activities: [
      {
        id: activityId('listen'),
        kind: 'listen',
        order: 1,
        required: true,
        prompt: heroPhrase.zulu,
        translation: heroPhrase.english,
      },
      {
        id: activityId('phrase-builder'),
        kind: 'phrase-builder',
        order: 2,
        required: true,
        prompt: heroPhrase.english,
        answer: heroPhrase.zulu,
      },
      {
        id: activityId('picture-match'),
        kind: 'picture-match',
        order: 3,
        required: true,
        prompt: 'Tap the picture for:',
        answer: pictureTarget.zulu,
        choices: topic.vocab.map((entry) => ({
          id: `${activityId('picture-match')}-${entry.id}`,
          label: capitalize(entry.english),
          correct: entry.id === pictureTarget.id,
          ...(entry.imageKey ? { imageKey: entry.imageKey } : {}),
        })),
      },
      {
        id: activityId('conversation'),
        kind: 'conversation',
        order: 4,
        required: true,
        prompt: conversation.prompt,
        translation: conversation.translation,
        choices: [
          {
            id: `${activityId('conversation')}-correct`,
            label: conversation.correctReply,
            correct: true,
          },
          ...conversation.distractorReplies.map((label, index) => ({
            id: `${activityId('conversation')}-distractor-${index}`,
            label,
            correct: false,
          })),
        ],
      },
      {
        id: activityId('comprehension'),
        kind: 'comprehension',
        order: 5,
        required: true,
        prompt: `What does "${heroPhrase.zulu}" mean?`,
        answer: heroPhrase.english,
        choices: [
          { id: `${activityId('comprehension')}-correct`, label: heroPhrase.english, correct: true },
          ...[comprehensionDistractorA, comprehensionDistractorB]
            .filter((phrase): phrase is NonNullable<typeof phrase> => Boolean(phrase))
            .map((phrase, index) => ({
              id: `${activityId('comprehension')}-distractor-${index}`,
              label: phrase.english,
              correct: false,
            })),
        ],
      },
      {
        id: activityId('dictation'),
        kind: 'dictation',
        order: 6,
        required: true,
        prompt: 'Listen and type what you hear.',
        answer: heroPhrase.zulu,
      },
      {
        id: activityId('pronunciation'),
        kind: 'pronunciation',
        order: 7,
        required: true,
        prompt: 'Tap each part to practise.',
        answer: heroPhrase.zulu,
      },
      {
        id: activityId('speak'),
        kind: 'speak',
        order: 8,
        required: true,
        prompt: 'Say the phrase',
        answer: heroPhrase.zulu,
      },
    ],
  };

  return lessonSchema.parse(candidate);
}

/** How many lessons to materialize per topic in the static catalog today —
 * the generator itself supports any `lessonIndex`, so raising this later (or
 * calling `generateLesson` on demand for a personalized session) needs no
 * architecture change, just a higher/looser bound. */
export const LESSONS_PER_TOPIC = 4;

export function generateLessonsForTopic(topic: Topic, unitId: string): Lesson[] {
  return Array.from({ length: LESSONS_PER_TOPIC }, (_, lessonIndex) =>
    generateLesson(topic, unitId, lessonIndex),
  );
}
