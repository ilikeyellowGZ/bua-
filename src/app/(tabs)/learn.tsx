import { useRouter } from 'expo-router';
import { LearnScreen } from '@/features/learning-path/learn-screen';
export default function LearnRoute() {
  const router = useRouter();
  return (
    <LearnScreen
      onContinueLesson={() => router.push('/lesson/lesson-introduce-yourself/listen')}
      onQuickReview={() => router.push('/lesson/lesson-introduce-yourself/sound-focus')}
    />
  );
}
