import { calculateDictationScore, normalizeLearningText } from '@/features/lesson-runner/scoring';

describe('learning response scoring', () => {
  it('normalizes Unicode, punctuation, casing, and whitespace without losing letters', () => {
    expect(normalizeLearningText('  SAWUBONA!   Igama lami nguNéo.  ')).toBe(
      'sawubona igama lami ngunéo',
    );
  });

  it('scores exact normalized dictation as correct', () => {
    expect(
      calculateDictationScore('Sawubona! Igama lami nguNeo.', ' sawubona igama lami nguneo '),
    ).toEqual({
      normalizedExpected: 'sawubona igama lami nguneo',
      normalizedActual: 'sawubona igama lami nguneo',
      score: 1,
      correct: true,
    });
  });

  it('returns a bounded partial score for an incomplete response', () => {
    const result = calculateDictationScore('Sawubona Igama lami nguNeo', 'Sawubona Neo');

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(1);
    expect(result.correct).toBe(false);
  });
});
