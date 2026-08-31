import { generateLesson, generateLessonsForTopic, LESSONS_PER_TOPIC } from '@/content/lesson-generator';
import { lessonSchema } from '@/content/schemas';
import { topics } from '@/content/vocabulary-bank';

describe('lesson generator', () => {
  it('produces a schema-valid lesson for every topic and lesson index', () => {
    for (const topic of topics) {
      for (let lessonIndex = 0; lessonIndex < LESSONS_PER_TOPIC; lessonIndex += 1) {
        const lesson = generateLesson(topic, `unit-${topic.id}`, lessonIndex);
        expect(() => lessonSchema.parse(lesson)).not.toThrow();
        expect(lesson.activities).toHaveLength(8);
        expect(lesson.level).toBe(topic.level);
      }
    }
  });

  it('is deterministic: the same topic and index always produces the same lesson', () => {
    const topic = topics[0]!;
    const first = generateLesson(topic, 'unit-numbers', 1);
    const second = generateLesson(topic, 'unit-numbers', 1);
    expect(second).toEqual(first);
  });

  it('produces a different hero phrase for each lesson index in a topic', () => {
    const topic = topics[0]!;
    const lessons = generateLessonsForTopic(topic, 'unit-numbers');
    const prompts = lessons.map(
      (lesson) => lesson.activities.find((activity) => activity.kind === 'listen')!.prompt,
    );
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it('never shows picture-match art for the wrong word', () => {
    for (const topic of topics) {
      for (let lessonIndex = 0; lessonIndex < LESSONS_PER_TOPIC; lessonIndex += 1) {
        const lesson = generateLesson(topic, `unit-${topic.id}`, lessonIndex);
        const pictureMatch = lesson.activities.find((activity) => activity.kind === 'picture-match')!;
        const correctChoice = pictureMatch.choices!.find((choice) => choice.correct)!;
        const correctVocab = topic.vocab.find(
          (entry) => entry.english.toLowerCase() === correctChoice.label.toLowerCase(),
        )!;
        expect(correctChoice.imageKey).toBe(correctVocab.imageKey);
        // Every choice's art (if any) must belong to that same choice's word, never a neighbor's.
        for (const choice of pictureMatch.choices!) {
          const vocab = topic.vocab.find(
            (entry) => entry.english.toLowerCase() === choice.label.toLowerCase(),
          )!;
          expect(choice.imageKey).toBe(vocab.imageKey);
        }
      }
    }
  });

  it('gives comprehension exactly one correct choice matching the hero phrase meaning', () => {
    const topic = topics[0]!;
    const lesson = generateLesson(topic, 'unit-numbers', 0);
    const comprehension = lesson.activities.find((activity) => activity.kind === 'comprehension')!;
    const correctChoices = comprehension.choices!.filter((choice) => choice.correct);
    expect(correctChoices).toHaveLength(1);
    expect(correctChoices[0]!.label).toBe(comprehension.answer);
  });
});
