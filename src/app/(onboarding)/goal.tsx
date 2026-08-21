import { useRouter } from 'expo-router';

import { GoalScreen } from '@/features/onboarding/goal-screen';
import { updateOnboardingDraft } from '@/features/onboarding/update-draft';

export default function GoalRoute() {
  const router = useRouter();
  return (
    <GoalScreen
      onBack={() => router.back()}
      onContinue={async (goal) => {
        await updateOnboardingDraft({ goal });
        router.replace('/learn');
      }}
    />
  );
}
