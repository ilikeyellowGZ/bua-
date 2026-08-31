import { requestRecordingPermissionsAsync } from 'expo-audio';

import {
  createNativeSpeechRecognitionAdapter,
  type SupabaseAudioClient,
} from '@/features/lesson-runner/native-speech-recognition';

type MockRecorder = {
  prepareToRecordAsync: jest.Mock;
  record: jest.Mock;
  stop: jest.Mock;
  uri: string | null;
};

const mockRecorderInstances: MockRecorder[] = [];

jest.mock('expo-audio', () => {
  class FakeAudioRecorder {
    uri: string | null = 'file:///tmp/recording.m4a';
    prepareToRecordAsync = jest.fn().mockResolvedValue(undefined);
    record = jest.fn();
    stop = jest.fn().mockResolvedValue(undefined);
    constructor() {
      mockRecorderInstances.push(this);
    }
  }
  return {
    AudioModule: { AudioRecorder: FakeAudioRecorder },
    RecordingPresets: { HIGH_QUALITY: {} },
    requestRecordingPermissionsAsync: jest.fn(),
  };
});

const ownerId = '11111111-1111-4111-8111-111111111111';

function mockSupabaseClient(overrides: { uploadError?: { message: string } } = {}) {
  const upload = jest.fn().mockResolvedValue({ error: overrides.uploadError ?? null });
  const invoke = jest.fn().mockResolvedValue({ data: { transcript: 'Sawubona' }, error: null });
  const from = jest.fn().mockReturnValue({ upload });
  const client = { storage: { from }, functions: { invoke } } as unknown as SupabaseAudioClient;
  return { client, upload, invoke, from };
}

beforeEach(() => {
  mockRecorderInstances.length = 0;
  global.fetch = jest.fn().mockResolvedValue({ blob: () => Promise.resolve('fake-blob') }) as never;
});

describe('createNativeSpeechRecognitionAdapter', () => {
  it('maps a granted permission response to "granted"', async () => {
    (requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    const { client } = mockSupabaseClient();
    const adapter = createNativeSpeechRecognitionAdapter({ client, loadOwnerId: async () => ownerId });

    expect(await adapter.requestPermission()).toBe('granted');
  });

  it('maps a denied-but-askable permission response to "denied"', async () => {
    (requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
      canAskAgain: true,
    });
    const { client } = mockSupabaseClient();
    const adapter = createNativeSpeechRecognitionAdapter({ client, loadOwnerId: async () => ownerId });

    expect(await adapter.requestPermission()).toBe('denied');
  });

  it('maps a denied-and-unaskable permission response to "blocked"', async () => {
    (requestRecordingPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
      canAskAgain: false,
    });
    const { client } = mockSupabaseClient();
    const adapter = createNativeSpeechRecognitionAdapter({ client, loadOwnerId: async () => ownerId });

    expect(await adapter.requestPermission()).toBe('blocked');
  });

  it('uploads the recording under the caller’s own folder and returns the transcript', async () => {
    const { client, upload, invoke, from } = mockSupabaseClient();
    const adapter = createNativeSpeechRecognitionAdapter({ client, loadOwnerId: async () => ownerId });

    await adapter.start('zu-ZA');
    expect(mockRecorderInstances).toHaveLength(1);
    expect(mockRecorderInstances[0]!.record).toHaveBeenCalledTimes(1);

    const result = await adapter.stop();

    expect(from).toHaveBeenCalledWith('practice-audio');
    const [storagePath] = upload.mock.calls[0]!;
    expect(storagePath.startsWith(`${ownerId}/`)).toBe(true);
    expect(storagePath.endsWith('.m4a')).toBe(true);

    expect(invoke).toHaveBeenCalledWith(
      'transcribe-audio',
      expect.objectContaining({ body: expect.objectContaining({ storagePath, language: 'zu' }) }),
    );
    expect(result).toEqual({ transcript: 'Sawubona', audioUri: storagePath });
  });

  it('throws if stop() is called before start()', async () => {
    const { client } = mockSupabaseClient();
    const adapter = createNativeSpeechRecognitionAdapter({ client, loadOwnerId: async () => ownerId });

    await expect(adapter.stop()).rejects.toThrow('Speech recognition was not started.');
  });

  it('surfaces a Storage upload error instead of silently transcribing nothing', async () => {
    const { client } = mockSupabaseClient({ uploadError: { message: 'bucket not found' } });
    const adapter = createNativeSpeechRecognitionAdapter({ client, loadOwnerId: async () => ownerId });

    await adapter.start('zu-ZA');
    await expect(adapter.stop()).rejects.toThrow('bucket not found');
  });

  it('cancel() stops an in-progress recording without throwing', async () => {
    const { client } = mockSupabaseClient();
    const adapter = createNativeSpeechRecognitionAdapter({ client, loadOwnerId: async () => ownerId });

    await adapter.start('zu-ZA');
    await expect(adapter.cancel()).resolves.toBeUndefined();
    await expect(adapter.stop()).rejects.toThrow('Speech recognition was not started.');
  });
});
