import { useRouter } from 'expo-router';

import { LanguageScreen } from '@/features/onboarding/language-screen';
import { updateOnboardingDraft } from '@/features/onboarding/update-draft';

export default function LanguageRoute() {
  const router = useRouter();
  return (
    <LanguageScreen
      onBack={() => router.back()}
      onContinue={async (selection) => {
        await updateOnboardingDraft(selection);
        router.push('/routine');
      }}
    />
  );
}
