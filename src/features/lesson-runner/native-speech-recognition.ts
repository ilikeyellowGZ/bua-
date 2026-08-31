import type * as ExpoAudio from 'expo-audio';

import { getOwnerId } from '@/features/auth/session';
import type {
  SpeechPermissionStatus,
  SpeechRecognitionAdapter,
  SpeechRecognitionResult,
} from '@/features/lesson-runner/speech-recognition';
import { getSupabaseClient } from '@/infra/supabase/client';

/**
 * Lazily required: expo-audio's native binding isn't available under Jest,
 * and this module is only ever reached outside demo mode.
 */
function loadExpoAudio(): typeof ExpoAudio {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-audio');
}

export type SupabaseAudioClient = Pick<ReturnType<typeof getSupabaseClient>, 'storage' | 'functions'>;

type NativeSpeechRecognitionOptions = {
  client?: SupabaseAudioClient;
  loadOwnerId?: () => Promise<string>;
};

/**
 * Real microphone capture + transcription. Records with expo-audio, uploads
 * the file to the private "practice-audio" Storage bucket, then calls the
 * transcribe-audio Edge Function (see supabase/functions/transcribe-audio) so
 * the speech-to-text provider key never reaches the client.
 *
 * expo-audio is imported lazily (only when a method actually runs) rather
 * than at module scope: its native binding isn't available under Jest, and
 * this adapter is only ever constructed outside demo mode. Needs on-device
 * verification — this environment has no microphone/simulator to test against.
 */
export function createNativeSpeechRecognitionAdapter({
  client = getSupabaseClient(),
  loadOwnerId = getOwnerId,
}: NativeSpeechRecognitionOptions = {}): SpeechRecognitionAdapter {
  let recorder: ExpoAudio.AudioRecorder | null = null;
  let locale = 'zu-ZA';

  return {
    async requestPermission(): Promise<SpeechPermissionStatus> {
      const { requestRecordingPermissionsAsync } = loadExpoAudio();
      const permission = await requestRecordingPermissionsAsync();
      if (permission.granted) return 'granted';
      return permission.canAskAgain ? 'denied' : 'blocked';
    },

    async start(requestedLocale: string) {
      locale = requestedLocale;
      const { AudioModule, RecordingPresets } = loadExpoAudio();
      recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await recorder.prepareToRecordAsync();
      recorder.record();
    },

    async stop(): Promise<SpeechRecognitionResult> {
      if (!recorder) throw new Error('Speech recognition was not started.');
      await recorder.stop();
      const uri = recorder.uri;
      recorder = null;
      if (!uri) throw new Error('Recording produced no audio file.');

      const ownerId = await loadOwnerId();
      const storagePath = `${ownerId}/${globalThis.crypto.randomUUID()}.m4a`;

      const fileResponse = await fetch(uri);
      const audioBlob = await fileResponse.blob();
      const { error: uploadError } = await client.storage
        .from('practice-audio')
        .upload(storagePath, audioBlob, { contentType: 'audio/m4a' });
      if (uploadError) throw new Error(uploadError.message);

      const { data, error: invokeError } = await client.functions.invoke<{ transcript: string }>(
        'transcribe-audio',
        { body: { storagePath, language: locale.split('-')[0] } },
      );
      if (invokeError) throw new Error(invokeError.message);
      if (!data) throw new Error('transcribe-audio returned no data.');

      return { transcript: data.transcript, audioUri: storagePath };
    },

    async cancel() {
      if (recorder) {
        await recorder.stop().catch(() => undefined);
        recorder = null;
      }
    },
  };
}
