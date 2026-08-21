import { assign, setup } from 'xstate';

import type { Lesson } from '@/types/domain';

export type LessonAttemptOutcome = 'correct' | 'incorrect' | 'partial';

export type LessonMachineAttempt = {
  id: string;
  activityId: string;
  outcome: LessonAttemptOutcome;
};

export type RestoredLessonState = {
  activityIndex: number;
  completedActivityIds: string[];
  attempts: LessonMachineAttempt[];
};

export type LessonMachineContext = RestoredLessonState & {
  lesson: Lesson;
  errorMessage: string | null;
};

type LessonMachineEvent =
  | { type: 'HYDRATE' }
  | { type: 'START' }
  | { type: 'SUBMIT'; attemptId: string; outcome: LessonAttemptOutcome }
  | { type: 'CONTINUE' }
  | { type: 'RETRY' }
  | { type: 'AUDIO_INTERRUPTED' }
  | { type: 'RESUME' }
  | { type: 'OFFLINE_AVAILABLE' }
  | { type: 'OFFLINE_MISSING_ASSET' }
  | { type: 'RECOVERABLE_ERROR'; message: string }
  | { type: 'RECOVER' }
  | { type: 'REQUEST_EXIT' }
  | { type: 'CANCEL_EXIT' }
  | { type: 'CONFIRM_EXIT' };

type LessonMachineInput = {
  lesson: Lesson;
  restored?: RestoredLessonState;
};

const activeEvents = {
  AUDIO_INTERRUPTED: { target: 'paused_for_audio_interruption' },
  OFFLINE_AVAILABLE: { target: 'offline_available' },
  OFFLINE_MISSING_ASSET: { target: 'offline_missing_asset' },
  RECOVERABLE_ERROR: {
    target: 'recoverable_error',
    actions: 'recordError',
  },
  REQUEST_EXIT: { target: 'exiting_confirmation' },
} as const;

const lessonMachineSetup = setup({
  types: {
    context: {} as LessonMachineContext,
    events: {} as LessonMachineEvent,
  },
  guards: {
    isNewAttempt: ({ context, event }) =>
      event.type === 'SUBMIT' &&
      !context.attempts.some((attempt) => attempt.id === event.attemptId),
    latestAttemptCorrect: ({ context }) => context.attempts.at(-1)?.outcome === 'correct',
    latestAttemptPartial: ({ context }) => context.attempts.at(-1)?.outcome === 'partial',
    isFinalActivity: ({ context }) => context.activityIndex >= context.lesson.activities.length - 1,
  },
  actions: {
    recordAttempt: assign({
      attempts: ({ context, event }) => {
        if (event.type !== 'SUBMIT') return context.attempts;
        const activity = context.lesson.activities[context.activityIndex];
        if (!activity || context.attempts.some((attempt) => attempt.id === event.attemptId)) {
          return context.attempts;
        }
        return [
          ...context.attempts,
          { id: event.attemptId, activityId: activity.id, outcome: event.outcome },
        ];
      },
    }),
    completeCurrentActivity: assign({
      completedActivityIds: ({ context }) => {
        const activity = context.lesson.activities[context.activityIndex];
        if (!activity || context.completedActivityIds.includes(activity.id)) {
          return context.completedActivityIds;
        }
        return [...context.completedActivityIds, activity.id];
      },
    }),
    advanceActivity: assign({
      activityIndex: ({ context }) =>
        Math.min(context.activityIndex + 1, context.lesson.activities.length - 1),
    }),
    recordError: assign({
      errorMessage: ({ context, event }) =>
        event.type === 'RECOVERABLE_ERROR' ? event.message : context.errorMessage,
    }),
    clearError: assign({ errorMessage: null }),
  },
});

export function createLessonMachine(input: LessonMachineInput) {
  return lessonMachineSetup.createMachine({
    id: 'bua-lesson',
    initial: 'hydrating',
    context: () => ({
      lesson: input.lesson,
      activityIndex: Math.min(
        Math.max(0, input.restored?.activityIndex ?? 0),
        input.lesson.activities.length - 1,
      ),
      completedActivityIds: [...(input.restored?.completedActivityIds ?? [])],
      attempts: [...(input.restored?.attempts ?? [])],
      errorMessage: null,
    }),
    states: {
      hydrating: { on: { HYDRATE: 'ready' } },
      ready: { on: { START: 'presenting' } },
      presenting: { always: 'awaiting_input' },
      awaiting_input: {
        on: {
          SUBMIT: {
            guard: 'isNewAttempt',
            target: 'evaluating',
            actions: 'recordAttempt',
          },
          ...activeEvents,
        },
      },
      evaluating: {
        always: [
          { guard: 'latestAttemptCorrect', target: 'feedback_correct' },
          { guard: 'latestAttemptPartial', target: 'feedback_partial' },
          { target: 'feedback_retry' },
        ],
      },
      feedback_correct: { on: { CONTINUE: 'advancing', ...activeEvents } },
      feedback_partial: { on: { CONTINUE: 'advancing', RETRY: 'awaiting_input', ...activeEvents } },
      feedback_retry: { on: { RETRY: 'awaiting_input', ...activeEvents } },
      advancing: {
        entry: 'completeCurrentActivity',
        always: [
          { guard: 'isFinalActivity', target: 'completed' },
          { target: 'presenting', actions: 'advanceActivity' },
        ],
      },
      completed: { type: 'final' },
      paused_for_audio_interruption: {
        on: { RESUME: 'awaiting_input', REQUEST_EXIT: 'exiting_confirmation' },
      },
      offline_available: { on: { RESUME: 'awaiting_input', REQUEST_EXIT: 'exiting_confirmation' } },
      offline_missing_asset: {
        on: { RECOVER: 'awaiting_input', REQUEST_EXIT: 'exiting_confirmation' },
      },
      recoverable_error: {
        on: {
          RECOVER: { target: 'awaiting_input', actions: 'clearError' },
          REQUEST_EXIT: 'exiting_confirmation',
        },
      },
      exiting_confirmation: {
        on: { CANCEL_EXIT: 'awaiting_input', CONFIRM_EXIT: 'exited' },
      },
      exited: { type: 'final' },
    },
  });
}
