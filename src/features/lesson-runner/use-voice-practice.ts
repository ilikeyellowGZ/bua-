import { useCallback, useRef, useState } from 'react';

import { createNativeSpeechRecognitionAdapter } from '@/features/lesson-runner/native-speech-recognition';
import {
  createDemoSpeechRecognitionAdapter,
  type SpeechRecognitionAdapter,
} from '@/features/lesson-runner/speech-recognition';
import { createPronunciationScoringAdapter } from '@/features/lesson-runner/pronunciation-scoring';
import type { PronunciationResult } from '@/types/domain';

function createRecognizer(demoTranscript: string): SpeechRecognitionAdapter {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'false'
    ? createNativeSpeechRecognitionAdapter()
    : createDemoSpeechRecognitionAdapter({ transcript: demoTranscript });
}

export type VoicePracticeStatus = 'idle' | 'listening' | 'processing' | 'result' | 'denied';

export type VoicePracticeOptions = {
  expectedText: string;
  segments?: string[];
  locale?: string;
  /** The transcript the demo recognizer reports back; defaults to a perfect match. */
  demoTranscript?: string;
};

const scorer = createPronunciationScoringAdapter();

export function useVoicePractice({
  expectedText,
  segments,
  locale = 'zu-ZA',
  demoTranscript = expectedText,
}: VoicePracticeOptions) {
  const [status, setStatus] = useState<VoicePracticeStatus>('idle');
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const attemptRef = useRef(0);

  const record = useCallback(async () => {
    const attemptId = (attemptRef.current += 1);
    const isStaleAttempt = () => attemptRef.current !== attemptId;

    const recognizer = createRecognizer(demoTranscript);
    setStatus('listening');
    const permission = await recognizer.requestPermission();
    if (isStaleAttempt()) return;
    if (permission !== 'granted') {
      setStatus('denied');
      return;
    }

    await recognizer.start(locale);
    if (isStaleAttempt()) return;
    const { transcript } = await recognizer.stop();
    if (isStaleAttempt()) return;
    setStatus('processing');
    const scored = await scorer.score({
      expectedText,
      transcript,
      locale,
      ...(segments ? { segments } : {}),
    });
    if (isStaleAttempt()) return;
    setResult(scored);
    setStatus('result');
  }, [demoTranscript, expectedText, locale, segments]);

  const reset = useCallback(() => {
    attemptRef.current += 1;
    setStatus('idle');
    setResult(null);
  }, []);

  return { status, result, record, reset };
}
