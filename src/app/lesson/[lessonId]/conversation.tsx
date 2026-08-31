import { useRouter } from 'expo-router';
import { ConversationScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function ConversationRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-conversation');
  return (
    <ConversationScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.push('/lesson/lesson-introduce-yourself/comprehension'))
      }
    />
  );
}
