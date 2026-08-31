import { useRouter } from 'expo-router';
import { ListenScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function ListenRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-listen');
  return (
    <ListenScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.push('/lesson/lesson-introduce-yourself/phrase-builder'))
      }
    />
  );
}
