import { useRouter } from 'expo-router';
import { LessonCompleteScreen } from '@/features/lesson-runner/screens';
export default function CompleteRoute() {
  const router = useRouter();
  return (
    <LessonCompleteScreen
      onBackHome={() => router.replace('/learn')}
      onKeepLearning={() => router.replace('/learn')}
    />
  );
}
