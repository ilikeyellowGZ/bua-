import { conversationTemplates } from '@/content/vocabulary-bank';
import { lessonSchema } from '@/content/schemas';
import type { ReviewWord } from '@/features/practice/review-words';
import type { Lesson } from '@/types/domain';

function capitalize(word: string): string {
  return word.length > 0 ? `${word[0]?.toUpperCase()}${word.slice(1)}` : word;
}

/**
 * Builds a review lesson directly from the learner's own due words, without
 * calling an AI provider — used when EXPO_PUBLIC_DEMO_MODE is on, or as a
 * fallback if the AI-generated version fails or doesn't validate. Same
 * 8-activity shape as `generateLesson`, but built from arbitrary due words
 * rather than a fixed topic bank.
 */
export function buildDeterministicReviewLesson(words: readonly ReviewWord[]): Lesson {
  if (words.length < 2) {
    throw new Error('A review lesson needs at least two distinct due words.');
  }
  const hero = words[0]!;
  const pictureTarget = words[1]!;
  const pictureDistractors = words.filter((word) => word !== pictureTarget).slice(0, 3);
  const pictureChoices = [pictureTarget, ...pictureDistractors];

  const comprehensionDistractors = words.filter((word) => word !== hero).slice(0, 2);
  const conversation = conversationTemplates[0]!;

  const candidate = {
    id: `lesson-review-${Date.now()}`,
    unitId: 'unit-review',
    title: 'Quick review',
    durationMinutes: 8,
    level: 'Beginner' as const,
    activities: [
      {
        id: 'activity-review-listen',
        kind: 'listen',
        order: 1,
        required: true,
        prompt: hero.zulu,
        translation: hero.english,
      },
      {
        id: 'activity-review-phrase-builder',
        kind: 'phrase-builder',
        order: 2,
        required: true,
        prompt: hero.english,
        answer: hero.zulu,
      },
      {
        id: 'activity-review-picture-match',
        kind: 'picture-match',
        order: 3,
        required: true,
        prompt: 'Tap the picture for:',
        answer: pictureTarget.zulu,
        choices: pictureChoices.map((word, index) => ({
          id: `choice-review-picture-${index}`,
          label: capitalize(word.english),
          correct: word === pictureTarget,
        })),
      },
      {
        id: 'activity-review-conversation',
        kind: 'conversation',
        order: 4,
        required: true,
        prompt: conversation.prompt,
        translation: conversation.translation,
        choices: [
          { id: 'choice-review-conversation-correct', label: conversation.correctReply, correct: true },
          ...conversation.distractorReplies.map((label, index) => ({
            id: `choice-review-conversation-distractor-${index}`,
            label,
            correct: false,
          })),
        ],
      },
      {
        id: 'activity-review-comprehension',
        kind: 'comprehension',
        order: 5,
        required: true,
        prompt: `What does "${hero.zulu}" mean?`,
        answer: hero.english,
        choices: [
          { id: 'choice-review-comprehension-correct', label: hero.english, correct: true },
          ...comprehensionDistractors.map((word, index) => ({
            id: `choice-review-comprehension-distractor-${index}`,
            label: word.english,
            correct: false,
          })),
        ],
      },
      {
        id: 'activity-review-dictation',
        kind: 'dictation',
        order: 6,
        required: true,
        prompt: 'Listen and type what you hear.',
        answer: hero.zulu,
      },
      {
        id: 'activity-review-pronunciation',
        kind: 'pronunciation',
        order: 7,
        required: true,
        prompt: 'Tap each part to practise.',
        answer: hero.zulu,
      },
      {
        id: 'activity-review-speak',
        kind: 'speak',
        order: 8,
        required: true,
        prompt: 'Say the phrase',
        answer: hero.zulu,
      },
    ],
  };

  return lessonSchema.parse(candidate);
}
