import { z } from 'zod';

export const activityKindSchema = z.enum([
  'listen',
  'phrase-builder',
  'picture-match',
  'conversation',
  'comprehension',
  'dictation',
  'pronunciation',
  'speak',
  'sound-focus',
  'role-play',
]);

export const choiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  correct: z.boolean(),
  /** Key into the illustrated scene-art map; only a handful of vocabulary
   * concepts have bespoke art, so most choices omit this and render as a
   * text card instead. */
  imageKey: z.string().min(1).optional(),
});

export const activitySchema = z.object({
  id: z.string().min(1),
  kind: activityKindSchema,
  order: z.number().int().nonnegative(),
  required: z.boolean(),
  prompt: z.string().min(1),
  translation: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  choices: z.array(choiceSchema).min(2).optional(),
  audioAssetId: z.string().min(1).optional(),
});

export const lessonSchema = z
  .object({
    id: z.string().min(1),
    unitId: z.string().min(1),
    title: z.string().min(1),
    durationMinutes: z.number().int().positive(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    activities: z.array(activitySchema).min(1),
  })
  .superRefine((lesson, context) => {
    const ids = lesson.activities.map((activity) => activity.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: 'custom',
        message: 'Lesson activities must use unique activity IDs.',
        path: ['activities'],
      });
    }
  });

export const userProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  streakDays: z.number().int().nonnegative(),
  dailyGoalMinutes: z.number().int().positive(),
  reminderLocalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  startingLevelChoice: z.enum(['new', 'a-little', 'conversation']),
});

export const courseSchema = z.object({
  id: z.string().min(1),
  languageCode: z.string().min(2).max(3),
  languageName: z.string().min(1),
  title: z.string().min(1),
});

export const unitSchema = z.object({
  id: z.string().min(1),
  courseId: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int().positive(),
});

export const contentBundleSchema = z.object({
  schemaVersion: z.literal(1),
  user: userProfileSchema,
  course: courseSchema,
  unit: unitSchema,
  lesson: lessonSchema,
  phrases: z.array(z.string().min(1)).min(3),
  storyCharacter: z.string().min(1),
  featuredPracticeTitle: z.string().min(1),
});

export type ContentBundle = z.infer<typeof contentBundleSchema>;
