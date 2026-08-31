export type SpeechPermissionStatus = 'granted' | 'denied' | 'blocked';

export type SpeechRecognitionResult = {
  transcript: string;
  audioUri?: string;
};

export type SpeechRecognitionAdapter = {
  requestPermission(): Promise<SpeechPermissionStatus>;
  start(locale: string): Promise<void>;
  stop(): Promise<SpeechRecognitionResult>;
  cancel(): Promise<void>;
};

type DemoSpeechRecognitionOptions = {
  permission?: SpeechPermissionStatus;
  transcript?: string;
};

export function createDemoSpeechRecognitionAdapter({
  permission = 'granted',
  transcript = '',
}: DemoSpeechRecognitionOptions = {}): SpeechRecognitionAdapter {
  let listening = false;

  return {
    async requestPermission() {
      return permission;
    },
    async start() {
      if (permission !== 'granted') {
        throw new Error(`Microphone permission ${permission}.`);
      }
      listening = true;
    },
    async stop() {
      if (!listening) throw new Error('Speech recognition was not started.');
      listening = false;
      return { transcript };
    },
    async cancel() {
      listening = false;
    },
  };
}
