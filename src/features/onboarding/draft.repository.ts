import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';

import type { GoalKind, StartingLevelChoice } from '@/types/domain';

const draftSchema = z.object({
  schemaVersion: z.literal(1),
  languageCode: z.string().nullable(),
  reasons: z.array(z.enum(['family', 'travel', 'work', 'school'])),
  dailyTargetMinutes: z.number().int().positive(),
  reminderEnabled: z.boolean(),
  reminderLocalTime: z.string(),
  startingLevelChoice: z.enum(['new', 'a-little', 'conversation']).nullable(),
  goal: z.enum(['colleagues', 'family', 'campus', 'everyday']).nullable(),
});

export type OnboardingDraft = {
  schemaVersion: 1;
  languageCode: string | null;
  reasons: ('family' | 'travel' | 'work' | 'school')[];
  dailyTargetMinutes: number;
  reminderEnabled: boolean;
  reminderLocalTime: string;
  startingLevelChoice: StartingLevelChoice | null;
  goal: GoalKind | null;
};

export const initialOnboardingDraft: OnboardingDraft = {
  schemaVersion: 1,
  languageCode: null,
  reasons: [],
  dailyTargetMinutes: 10,
  reminderEnabled: true,
  reminderLocalTime: '19:30',
  startingLevelChoice: null,
  goal: null,
};

type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
};

const storageKey = 'bua:onboarding:v1';

export function createOnboardingDraftRepository(storage: KeyValueStorage = AsyncStorage) {
  return {
    async load(): Promise<OnboardingDraft> {
      const raw = await storage.getItem(storageKey);
      if (!raw) return structuredClone(initialOnboardingDraft);
      const result = draftSchema.safeParse(JSON.parse(raw) as unknown);
      return result.success
        ? (result.data as OnboardingDraft)
        : structuredClone(initialOnboardingDraft);
    },
    async save(draft: OnboardingDraft): Promise<void> {
      const valid = draftSchema.parse(draft);
      await storage.setItem(storageKey, JSON.stringify(valid));
    },
    async clear(): Promise<void> {
      await storage.removeItem(storageKey);
    },
  };
}

export const onboardingDraftRepository = createOnboardingDraftRepository();
