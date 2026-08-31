import { useRouter } from 'expo-router';
import { PictureMatchScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function PictureMatchRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-picture-match');
  return (
    <PictureMatchScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.push('/lesson/lesson-introduce-yourself/conversation'))
      }
    />
  );
}
