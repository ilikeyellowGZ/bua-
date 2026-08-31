import { resolveColdStartRoute } from '@/features/auth/resolve-cold-start-route';
import { initialOnboardingDraft } from '@/features/onboarding/draft.repository';

describe('resolveColdStartRoute', () => {
  it('sends a returning, fully-onboarded user straight to /learn', async () => {
    const route = await resolveColdStartRoute({
      loadSession: async () => ({ userId: 'user-1', anonymous: false }),
      loadDraft: async () => ({ ...initialOnboardingDraft, completed: true }),
    });
    expect(route).toBe('/learn');
  });

  it('sends a new visitor with no session to welcome', async () => {
    const route = await resolveColdStartRoute({
      loadSession: async () => null,
      loadDraft: async () => ({ ...initialOnboardingDraft, completed: true }),
    });
    expect(route).toBe('/welcome');
  });

  it('sends a signed-in but not-yet-onboarded user to welcome, not straight to /learn', async () => {
    const route = await resolveColdStartRoute({
      loadSession: async () => ({ userId: 'user-1', anonymous: true }),
      loadDraft: async () => ({ ...initialOnboardingDraft, completed: false }),
    });
    expect(route).toBe('/welcome');
  });
});
