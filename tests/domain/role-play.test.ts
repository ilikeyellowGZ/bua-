import { findTurn, getChoices, resolveChoice } from '@/features/lesson-runner/role-play';
import { introduceYourselfRolePlay } from '@/content/role-play-seed';

describe('role-play branching graph', () => {
  it('finds a turn by id', () => {
    expect(findTurn(introduceYourselfRolePlay, 'lerato-prompt')).toMatchObject({
      speaker: 'character',
      text: 'Sawubona! Igama lakho ngubani?',
    });
  });

  it('throws for an unknown turn id', () => {
    expect(() => findTurn(introduceYourselfRolePlay, 'missing')).toThrow(/unknown role-play turn/i);
  });

  it('lists the learner choices reachable from the prompt', () => {
    const choices = getChoices(introduceYourselfRolePlay, 'lerato-prompt');
    expect(choices.map((turn) => turn.id)).toEqual([
      'learner-name',
      'learner-thanks',
      'learner-farewell',
    ]);
    expect(choices.every((turn) => turn.speaker === 'learner')).toBe(true);
  });

  it('resolves the best answer to its correct feedback turn', () => {
    const { chosen, feedback } = resolveChoice(introduceYourselfRolePlay, 'learner-name');
    expect(chosen.correct).toBe(true);
    expect(feedback.id).toBe('coach-correct');
  });

  it('resolves each wrong answer to its own distinct, contextually correct feedback turn', () => {
    const thanks = resolveChoice(introduceYourselfRolePlay, 'learner-thanks');
    const farewell = resolveChoice(introduceYourselfRolePlay, 'learner-farewell');

    expect(thanks.chosen.correct).toBeUndefined();
    expect(thanks.feedback.text).toMatch(/thank you/);

    expect(farewell.chosen.correct).toBeUndefined();
    expect(farewell.feedback.text).toMatch(/goodbye/);

    expect(thanks.feedback.id).not.toBe(farewell.feedback.id);
  });

  it('throws when resolving a turn with no outgoing feedback turn', () => {
    expect(() => resolveChoice(introduceYourselfRolePlay, 'coach-correct')).toThrow(
      /has no feedback turn/i,
    );
  });
});
