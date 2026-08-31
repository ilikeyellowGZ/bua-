import { useRouter } from 'expo-router';
import { DictationScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function DictationRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-dictation');
  return (
    <DictationScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.push('/lesson/lesson-introduce-yourself/click-pronunciation'))
      }
    />
  );
}
