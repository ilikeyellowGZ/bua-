import { startingUnitIndexFor } from '@/features/learning-path/starting-unit';

describe('startingUnitIndexFor', () => {
  it('starts a brand-new learner at the very first unit', () => {
    expect(startingUnitIndexFor('new')).toBe(0);
  });

  it('gives a learner with some experience a head start past the first units', () => {
    expect(startingUnitIndexFor('a-little')).toBeGreaterThan(0);
  });

  it('gives a conversational learner a bigger head start than "a-little"', () => {
    expect(startingUnitIndexFor('conversation')).toBeGreaterThan(startingUnitIndexFor('a-little'));
  });

  it('defaults to the very first unit when no placement was recorded', () => {
    expect(startingUnitIndexFor(null)).toBe(0);
  });
});
