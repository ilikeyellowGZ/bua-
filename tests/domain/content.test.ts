import { buaSeedContent } from '@/content/seed';
import { contentBundleSchema } from '@/content/schemas';

describe('Bua seeded domain content', () => {
  it('validates the exact Neo isiZulu demo fixture', () => {
    const content = contentBundleSchema.parse(buaSeedContent);

    expect(content.user).toMatchObject({
      id: 'user-neo-demo',
      displayName: 'Neo',
      streakDays: 4,
      dailyGoalMinutes: 10,
      reminderLocalTime: '19:30',
      startingLevelChoice: 'a-little',
    });
    expect(content.course).toMatchObject({ languageCode: 'zu', languageName: 'isiZulu' });
    expect(content.lesson).toMatchObject({
      id: 'lesson-introduce-yourself',
      title: 'Introduce yourself',
      durationMinutes: 12,
      level: 'Beginner',
    });
    expect(content.lesson.activities.map((activity) => activity.kind)).toEqual([
      'listen',
      'phrase-builder',
      'picture-match',
      'conversation',
      'comprehension',
      'dictation',
      'pronunciation',
      'speak',
    ]);
    expect(content.lesson.activities).toHaveLength(8);
    expect(content.phrases).toEqual(
      expect.arrayContaining(['Sawubona', 'Igama lami nguNeo', 'Ngiyabonga']),
    );
    expect(content.storyCharacter).toBe('Lerato');
    expect(content.featuredPracticeTitle).toBe('At the taxi rank');
  });

  it('rejects duplicate stable activity IDs', () => {
    const duplicate = structuredClone(buaSeedContent);
    duplicate.lesson.activities[1]!.id = duplicate.lesson.activities[0]!.id;

    expect(() => contentBundleSchema.parse(duplicate)).toThrow(/unique activity IDs/i);
  });
});
