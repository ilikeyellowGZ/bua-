import type { StartingLevelChoice } from '@/types/domain';

/**
 * How far into the unit list a learner's self-reported placement should
 * unlock, by index into `buaUnits` (0 = Greetings, the very first unit).
 * Units before this index are treated as reachable even though the learner
 * hasn't actually completed them — someone placing as "conversation"
 * shouldn't have to click through beginner greetings first.
 */
const STARTING_UNIT_INDEX: Record<StartingLevelChoice, number> = {
  new: 0,
  'a-little': 2,
  conversation: 6,
};

export function startingUnitIndexFor(choice: StartingLevelChoice | null): number {
  return choice ? STARTING_UNIT_INDEX[choice] : 0;
}
