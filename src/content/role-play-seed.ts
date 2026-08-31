import type { RolePlayTurn } from '@/types/domain';

/**
 * "Meet a classmate" — outside the first lecture. Each wrong reply routes to its
 * own coach turn so the feedback explains the meaning of what was actually said.
 */
export const introduceYourselfRolePlay: readonly RolePlayTurn[] = [
  {
    id: 'lerato-prompt',
    speaker: 'character',
    text: 'Sawubona! Igama lakho ngubani?',
    translation: 'Hello! What is your name?',
    nextTurnIds: ['learner-name', 'learner-thanks', 'learner-farewell'],
  },
  {
    id: 'learner-name',
    speaker: 'learner',
    text: 'Igama lami nguNeo.',
    correct: true,
    nextTurnIds: ['coach-correct'],
  },
  {
    id: 'learner-thanks',
    speaker: 'learner',
    text: 'Ngiyabonga.',
    nextTurnIds: ['coach-thanks'],
  },
  {
    id: 'learner-farewell',
    speaker: 'learner',
    text: 'Hamba kahle.',
    nextTurnIds: ['coach-farewell'],
  },
  {
    id: 'coach-correct',
    speaker: 'coach',
    text: 'Igama lami nguNeo answers with your name.',
    nextTurnIds: [],
  },
  {
    id: 'coach-thanks',
    speaker: 'coach',
    text: '“Ngiyabonga” means “thank you.” Introduce yourself with “Igama lami…” instead.',
    nextTurnIds: [],
  },
  {
    id: 'coach-farewell',
    speaker: 'coach',
    text: '“Hamba kahle” means “goodbye.” Introduce yourself with “Igama lami…” instead.',
    nextTurnIds: [],
  },
];
