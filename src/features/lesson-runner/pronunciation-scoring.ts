import { calculateDictationScore, normalizeLearningText } from '@/features/lesson-runner/scoring';
import type { PronunciationResult } from '@/types/domain';

const SEGMENT_CORRECT_THRESHOLD = 0.75;
const OVERALL_GOOD_CLARITY_RATIO = 0.5;

export type PronunciationScoringInput = {
  expectedText: string;
  transcript: string;
  locale: string;
  audioUri?: string;
  /** Authored phrase chunks to score independently, in order. Defaults to the whole phrase. */
  segments?: string[];
};

export type PronunciationScoringAdapter = {
  score(input: PronunciationScoringInput): Promise<PronunciationResult>;
};

function wordsOf(text: string): string[] {
  return normalizeLearningText(text).split(' ').filter(Boolean);
}

export function scorePronunciationSegments(
  expectedText: string,
  transcript: string,
  segments?: string[],
): { segment: string; score: number; correct: boolean }[] {
  const authoredSegments = segments && segments.length > 0 ? segments : [expectedText];
  const transcriptWords = wordsOf(transcript);

  let cursor = 0;
  return authoredSegments.map((segment) => {
    const segmentWordCount = Math.max(1, wordsOf(segment).length);
    const transcriptChunk = transcriptWords.slice(cursor, cursor + segmentWordCount).join(' ');
    cursor += segmentWordCount;
    const { score } = calculateDictationScore(segment, transcriptChunk);
    return { segment, score, correct: score >= SEGMENT_CORRECT_THRESHOLD };
  });
}

export function createPronunciationScoringAdapter(): PronunciationScoringAdapter {
  return {
    async score({ expectedText, transcript, segments }) {
      const segmentScores = scorePronunciationSegments(expectedText, transcript, segments);
      const overallScore =
        segmentScores.reduce((sum, entry) => sum + entry.score, 0) / segmentScores.length;
      const correctRatio =
        segmentScores.filter((entry) => entry.correct).length / segmentScores.length;

      return {
        score: overallScore,
        label: correctRatio >= OVERALL_GOOD_CLARITY_RATIO ? 'good-clarity' : 'keep-practicing',
        segmentScores,
      };
    },
  };
}
