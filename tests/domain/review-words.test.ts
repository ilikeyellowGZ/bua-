import { resolveDueWords } from '@/features/practice/review-words';
import type { SpacedRepetitionItem } from '@/types/domain';

function dueItem(itemId: string): SpacedRepetitionItem {
  return {
    itemId,
    ownerId: 'owner-1',
    nextReviewAt: new Date(0).toISOString(),
    intervalDays: 1,
    easeFactor: 2,
    repetitions: 1,
  };
}

describe('resolveDueWords', () => {
  it('resolves listen and phrase-builder activities to their real isiZulu/English pair', () => {
    const words = resolveDueWords([
      dueItem('activity-introduce-listen'),
      dueItem('activity-meeting-listen'),
    ]);

    expect(words).toEqual([
      { zulu: 'Sawubona! Igama lami nguNeo.', english: 'Hello! My name is Neo.' },
      { zulu: 'Sawubona! Unjani?', english: 'Hello! How are you?' },
    ]);
  });

  it('ignores activity kinds without a reliable translation pair', () => {
    const words = resolveDueWords([dueItem('activity-introduce-dictation')]);
    expect(words).toEqual([]);
  });

  it('ignores unknown activity ids instead of throwing', () => {
    const words = resolveDueWords([dueItem('activity-does-not-exist')]);
    expect(words).toEqual([]);
  });

  it('deduplicates identical isiZulu text across activities', () => {
    const words = resolveDueWords([
      dueItem('activity-introduce-listen'),
      dueItem('activity-introduce-listen'),
    ]);
    expect(words).toHaveLength(1);
  });
});
