import { useRouter } from 'expo-router';

import { PlacementScreen } from '@/features/onboarding/placement-screen';
import { updateOnboardingDraft } from '@/features/onboarding/update-draft';

export default function PlacementRoute() {
  const router = useRouter();
  return (
    <PlacementScreen
      onBack={() => router.back()}
      onContinue={async (startingLevelChoice) => {
        await updateOnboardingDraft({ startingLevelChoice });
        router.push('/goal');
      }}
    />
  );
}
