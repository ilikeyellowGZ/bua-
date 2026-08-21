import { createActor } from 'xstate';

import { buaSeedContent } from '@/content/seed';
import { createLessonMachine } from '@/features/lesson-runner/lesson.machine';
import { calculateLessonProgress } from '@/features/lesson-runner/progress';

describe('lesson runner state machine', () => {
  it('guards duplicate submissions and requires an explicit continue', () => {
    const actor = createActor(createLessonMachine({ lesson: buaSeedContent.lesson })).start();
    actor.send({ type: 'HYDRATE' });
    actor.send({ type: 'START' });

    expect(actor.getSnapshot().value).toBe('awaiting_input');
    actor.send({ type: 'SUBMIT', attemptId: 'attempt-1', outcome: 'correct' });
    expect(actor.getSnapshot().value).toBe('feedback_correct');
    expect(actor.getSnapshot().context.attempts).toHaveLength(1);

    actor.send({ type: 'SUBMIT', attemptId: 'attempt-1', outcome: 'correct' });
    expect(actor.getSnapshot().context.attempts).toHaveLength(1);
    expect(actor.getSnapshot().context.activityIndex).toBe(0);

    actor.send({ type: 'CONTINUE' });
    expect(actor.getSnapshot().value).toBe('awaiting_input');
    expect(actor.getSnapshot().context.activityIndex).toBe(1);
    expect(actor.getSnapshot().context.completedActivityIds).toEqual(['activity-introduce-listen']);
  });

  it('keeps completed progress while allowing a calm retry', () => {
    const actor = createActor(createLessonMachine({ lesson: buaSeedContent.lesson })).start();
    actor.send({ type: 'HYDRATE' });
    actor.send({ type: 'START' });
    actor.send({ type: 'SUBMIT', attemptId: 'attempt-wrong', outcome: 'incorrect' });

    expect(actor.getSnapshot().value).toBe('feedback_retry');
    actor.send({ type: 'RETRY' });
    expect(actor.getSnapshot().value).toBe('awaiting_input');
    expect(actor.getSnapshot().context.activityIndex).toBe(0);
    expect(actor.getSnapshot().context.completedActivityIds).toHaveLength(0);
  });

  it('restores and resumes an audio interruption explicitly', () => {
    const actor = createActor(
      createLessonMachine({
        lesson: buaSeedContent.lesson,
        restored: {
          activityIndex: 3,
          completedActivityIds: buaSeedContent.lesson.activities
            .slice(0, 3)
            .map((activity) => activity.id),
          attempts: [],
        },
      }),
    ).start();
    actor.send({ type: 'HYDRATE' });
    actor.send({ type: 'START' });
    actor.send({ type: 'AUDIO_INTERRUPTED' });

    expect(actor.getSnapshot().value).toBe('paused_for_audio_interruption');
    actor.send({ type: 'RESUME' });
    expect(actor.getSnapshot().value).toBe('awaiting_input');
    expect(actor.getSnapshot().context.activityIndex).toBe(3);
  });

  it('derives progress only from completed required activities', () => {
    expect(calculateLessonProgress(buaSeedContent.lesson, [])).toEqual({
      completed: 0,
      total: 8,
      ratio: 0,
    });
    expect(
      calculateLessonProgress(
        buaSeedContent.lesson,
        buaSeedContent.lesson.activities.slice(0, 3).map((activity) => activity.id),
      ),
    ).toEqual({ completed: 3, total: 8, ratio: 0.375 });
  });
});
