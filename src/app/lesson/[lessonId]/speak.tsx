import { useRouter } from 'expo-router';
import { SpeakScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function SpeakRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-speak');
  return (
    <SpeakScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.replace('/lesson/lesson-introduce-yourself/complete'))
      }
    />
  );
}
