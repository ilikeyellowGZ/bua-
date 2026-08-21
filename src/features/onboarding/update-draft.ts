import {
  onboardingDraftRepository,
  type OnboardingDraft,
} from '@/features/onboarding/draft.repository';

export async function updateOnboardingDraft(patch: Partial<OnboardingDraft>) {
  const current = await onboardingDraftRepository.load();
  const next = { ...current, ...patch };
  await onboardingDraftRepository.save(next);
  return next;
}
