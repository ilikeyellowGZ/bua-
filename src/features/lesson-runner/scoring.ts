export type DictationScore = {
  normalizedExpected: string;
  normalizedActual: string;
  score: number;
  correct: boolean;
};

export function normalizeLearningText(value: string): string {
  return value
    .normalize('NFC')
    .toLocaleLowerCase('zu-ZA')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(left: string, right: string): number {
  const leftPoints = Array.from(left);
  const rightPoints = Array.from(right);
  let previous = Array.from({ length: rightPoints.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= leftPoints.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= rightPoints.length; rightIndex += 1) {
      const substitutionCost = leftPoints[leftIndex - 1] === rightPoints[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        (current[rightIndex - 1] ?? 0) + 1,
        (previous[rightIndex] ?? 0) + 1,
        (previous[rightIndex - 1] ?? 0) + substitutionCost,
      );
    }
    previous = current;
  }

  return previous[rightPoints.length] ?? leftPoints.length;
}

export function calculateDictationScore(expected: string, actual: string): DictationScore {
  const normalizedExpected = normalizeLearningText(expected);
  const normalizedActual = normalizeLearningText(actual);
  const maximumLength = Math.max(
    Array.from(normalizedExpected).length,
    Array.from(normalizedActual).length,
    1,
  );
  const distance = levenshteinDistance(normalizedExpected, normalizedActual);
  const score = Math.max(0, Math.min(1, 1 - distance / maximumLength));

  return {
    normalizedExpected,
    normalizedActual,
    score,
    correct: normalizedExpected.length > 0 && normalizedExpected === normalizedActual,
  };
}
