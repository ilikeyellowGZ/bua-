import { buildDeterministicReviewLesson } from '@/features/practice/deterministic-review-lesson';
import { lessonSchema } from '@/content/schemas';

const words = [
  { zulu: 'Sawubona.', english: 'Hello.' },
  { zulu: 'Ngiyabonga.', english: 'Thank you.' },
  { zulu: 'Amanzi.', english: 'Water.' },
];

describe('buildDeterministicReviewLesson', () => {
  it('builds a schema-valid 8-activity lesson from the due words', () => {
    const lesson = buildDeterministicReviewLesson(words);
    expect(() => lessonSchema.parse(lesson)).not.toThrow();
    expect(lesson.activities).toHaveLength(8);
  });

  it('drills the first due word across listen, phrase-builder, dictation, pronunciation, and speak', () => {
    const lesson = buildDeterministicReviewLesson(words);
    const kinds = ['listen', 'dictation', 'pronunciation', 'speak'] as const;
    for (const kind of kinds) {
      const activity = lesson.activities.find((entry) => entry.kind === kind)!;
      expect(activity.kind === 'listen' ? activity.prompt : activity.answer).toBe('Sawubona.');
    }
  });

  it('throws rather than producing an invalid lesson with fewer than two words', () => {
    expect(() => buildDeterministicReviewLesson([words[0]!])).toThrow();
  });
});
