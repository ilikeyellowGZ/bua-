import { useRouter } from 'expo-router';
import { ClickPronunciationScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function ClickPronunciationRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-pronunciation');
  return (
    <ClickPronunciationScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.push('/lesson/lesson-introduce-yourself/speak'))
      }
    />
  );
}
