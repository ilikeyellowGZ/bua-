import { useRouter } from 'expo-router';

import { RoutineScreen } from '@/features/onboarding/routine-screen';
import { updateOnboardingDraft } from '@/features/onboarding/update-draft';

export default function RoutineRoute() {
  const router = useRouter();
  return (
    <RoutineScreen
      onBack={() => router.back()}
      onContinue={async (selection) => {
        await updateOnboardingDraft({
          dailyTargetMinutes: selection.dailyTargetMinutes,
          reminderLocalTime: selection.reminderLocalTime,
          reminderEnabled: selection.weekdays.length > 0,
        });
        router.push('/placement');
      }}
    />
  );
}
