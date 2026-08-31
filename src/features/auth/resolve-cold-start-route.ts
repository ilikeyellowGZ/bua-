import { authRepository, type AuthSession } from '@/features/auth/auth.repository';
import { onboardingDraftRepository, type OnboardingDraft } from '@/features/onboarding/draft.repository';

export type ColdStartRoute = '/learn' | '/welcome';

type ResolveColdStartRouteOptions = {
  loadSession?: () => Promise<AuthSession | null>;
  loadDraft?: () => Promise<OnboardingDraft>;
};

export async function resolveColdStartRoute({
  loadSession = () => authRepository.restoreSession(),
  loadDraft = () => onboardingDraftRepository.load(),
}: ResolveColdStartRouteOptions = {}): Promise<ColdStartRoute> {
  const [session, draft] = await Promise.all([loadSession(), loadDraft()]);
  return session && draft.completed ? '/learn' : '/welcome';
}
