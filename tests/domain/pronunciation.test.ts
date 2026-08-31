import { createDemoSpeechRecognitionAdapter } from '@/features/lesson-runner/speech-recognition';
import {
  createPronunciationScoringAdapter,
  scorePronunciationSegments,
} from '@/features/lesson-runner/pronunciation-scoring';

const expectedText = 'Sawubona. Igama lami nguNeo.';
const segments = ['Sawubona', 'Igama lami', 'nguNeo'];

describe('scorePronunciationSegments', () => {
  it('reproduces the seeded speak-page demo result: two phrase segments correct, one needing practice', () => {
    const result = scorePronunciationSegments(
      expectedText,
      'Sawubona Igama lami Sipho',
      segments,
    );

    expect(result.map((entry) => entry.segment)).toEqual(segments);
    expect(result[0]).toMatchObject({ segment: 'Sawubona', correct: true });
    expect(result[1]).toMatchObject({ segment: 'Igama lami', correct: true });
    expect(result[2]).toMatchObject({ segment: 'nguNeo', correct: false });
  });

  it('scores every segment correct for an exact transcript match', () => {
    const result = scorePronunciationSegments(expectedText, 'Sawubona Igama lami nguNeo', segments);
    expect(result.every((entry) => entry.correct)).toBe(true);
    expect(result.every((entry) => entry.score === 1)).toBe(true);
  });

  it('scores every segment incorrect for an empty transcript', () => {
    const result = scorePronunciationSegments(expectedText, '', segments);
    expect(result.every((entry) => entry.correct)).toBe(false);
    expect(result.every((entry) => entry.score === 0)).toBe(true);
  });

  it('falls back to treating the whole phrase as one segment when none are authored', () => {
    const result = scorePronunciationSegments(expectedText, 'Sawubona Igama lami nguNeo');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ segment: expectedText, correct: true });
  });
});

describe('createPronunciationScoringAdapter', () => {
  const adapter = createPronunciationScoringAdapter();

  it('labels the seeded demo attempt "good-clarity" despite one segment needing practice', async () => {
    const result = await adapter.score({
      expectedText,
      transcript: 'Sawubona Igama lami Sipho',
      locale: 'zu-ZA',
      segments,
    });

    expect(result.label).toBe('good-clarity');
    expect(result.segmentScores).toEqual([
      { segment: 'Sawubona', score: 1, correct: true },
      { segment: 'Igama lami', score: 1, correct: true },
      { segment: 'nguNeo', score: expect.any(Number), correct: false },
    ]);
    expect(result.segmentScores[2]!.score).toBeLessThan(0.75);
  });

  it('is deterministic: identical input always produces an identical result', async () => {
    const input = {
      expectedText,
      transcript: 'Sawubona Igama lami Sipho',
      locale: 'zu-ZA',
      segments,
    };
    expect(await adapter.score(input)).toEqual(await adapter.score(input));
  });

  it('labels a mostly-wrong attempt "keep-practicing"', async () => {
    const result = await adapter.score({
      expectedText,
      transcript: 'completely unrelated words here',
      locale: 'zu-ZA',
      segments,
    });
    expect(result.label).toBe('keep-practicing');
  });
});

describe('demo speech recognition adapter driving the scoring pipeline', () => {
  it('captures a transcript end to end and reproduces the seeded demo pronunciation result', async () => {
    const recognizer = createDemoSpeechRecognitionAdapter({
      transcript: 'Sawubona Igama lami Sipho',
    });
    const scorer = createPronunciationScoringAdapter();

    expect(await recognizer.requestPermission()).toBe('granted');
    await recognizer.start('zu-ZA');
    const { transcript } = await recognizer.stop();

    const result = await scorer.score({ expectedText, transcript, locale: 'zu-ZA', segments });
    expect(result.label).toBe('good-clarity');
  });

  it('rejects starting recognition when permission is denied', async () => {
    const recognizer = createDemoSpeechRecognitionAdapter({ permission: 'denied' });
    expect(await recognizer.requestPermission()).toBe('denied');
    await expect(recognizer.start('zu-ZA')).rejects.toThrow(/permission denied/i);
  });

  it('rejects stopping recognition that was never started', async () => {
    const recognizer = createDemoSpeechRecognitionAdapter();
    await expect(recognizer.stop()).rejects.toThrow('Speech recognition was not started.');
  });

  it('allows a clean cancel without producing a transcript', async () => {
    const recognizer = createDemoSpeechRecognitionAdapter({ transcript: 'ignored' });
    await recognizer.start('zu-ZA');
    await recognizer.cancel();
    await expect(recognizer.stop()).rejects.toThrow('Speech recognition was not started.');
  });
});
