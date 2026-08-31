import { useRouter } from 'expo-router';
import { ComprehensionScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function ComprehensionRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-comprehension');
  return (
    <ComprehensionScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.push('/lesson/lesson-introduce-yourself/dictation'))
      }
    />
  );
}
