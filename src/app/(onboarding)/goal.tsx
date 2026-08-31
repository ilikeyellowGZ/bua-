import { useRouter } from 'expo-router';

import { finishOnboarding } from '@/features/onboarding/finish-onboarding';
import { GoalScreen } from '@/features/onboarding/goal-screen';

export default function GoalRoute() {
  const router = useRouter();
  return (
    <GoalScreen
      onBack={() => router.back()}
      onContinue={async (goal) => {
        await finishOnboarding(goal);
        router.replace('/learn');
      }}
    />
  );
}
