import { lessonSchema } from '@/content/schemas';
import type { ReviewWord } from '@/features/practice/review-words';
import { getSupabaseClient } from '@/infra/supabase/client';
import type { Lesson } from '@/types/domain';

type AiChoice = { label: string; correct: boolean };
type AiActivity = {
  kind: Lesson['activities'][number]['kind'];
  prompt: string;
  translation: string | null;
  answer: string | null;
  choices: AiChoice[] | null;
};
type AiLessonResponse = { title: string; activities: AiActivity[] };

export type SupabaseFunctionsClient = Pick<ReturnType<typeof getSupabaseClient>, 'functions'>;

/**
 * Calls the `generate-lesson` Supabase Edge Function, which asks an OpenAI
 * model to write a fresh review lesson around the learner's own due words
 * (see supabase/functions/generate-lesson). The AI's output is never trusted
 * as-is: it's reshaped into our activity/choice id convention and then
 * validated with `lessonSchema.parse`, which throws on anything malformed —
 * the caller is expected to fall back to the deterministic builder on error.
 */
export async function generateAiReviewLesson(
  words: readonly ReviewWord[],
  level: Lesson['level'],
  client: SupabaseFunctionsClient = getSupabaseClient(),
): Promise<Lesson> {
  const { data, error } = await client.functions.invoke<AiLessonResponse>('generate-lesson', {
    body: { words, level },
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error('generate-lesson returned no data.');

  const lessonId = `lesson-ai-review-${Date.now()}`;
  const candidate = {
    id: lessonId,
    unitId: 'unit-review',
    title: data.title,
    durationMinutes: 8,
    level,
    activities: data.activities.map((activity, index) => ({
      id: `${lessonId}-activity-${index}`,
      kind: activity.kind,
      order: index + 1,
      required: true,
      prompt: activity.prompt,
      ...(activity.translation ? { translation: activity.translation } : {}),
      ...(activity.answer ? { answer: activity.answer } : {}),
      ...(activity.choices
        ? {
            choices: activity.choices.map((choice, choiceIndex) => ({
              id: `${lessonId}-activity-${index}-choice-${choiceIndex}`,
              label: choice.label,
              correct: choice.correct,
            })),
          }
        : {}),
    })),
  };

  return lessonSchema.parse(candidate);
}
