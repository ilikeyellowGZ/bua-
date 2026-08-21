import {
  createOnboardingDraftRepository,
  initialOnboardingDraft,
} from '@/features/onboarding/draft.repository';

describe('onboarding draft repository', () => {
  it('restores a versioned draft across repository instances', async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: async (key: string) => values.get(key) ?? null,
      setItem: async (key: string, value: string) => void values.set(key, value),
      removeItem: async (key: string) => void values.delete(key),
    };
    const first = createOnboardingDraftRepository(storage);
    await first.save({ ...initialOnboardingDraft, languageCode: 'zu', reasons: ['family'] });

    const restarted = createOnboardingDraftRepository(storage);
    await expect(restarted.load()).resolves.toMatchObject({
      schemaVersion: 1,
      languageCode: 'zu',
      reasons: ['family'],
    });
  });
});
