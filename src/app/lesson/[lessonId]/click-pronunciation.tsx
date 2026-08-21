import { useRouter } from 'expo-router';
import { ClickPronunciationScreen } from '@/features/lesson-runner/screens';
export default function ClickPronunciationRoute() {
  const router = useRouter();
  return (
    <ClickPronunciationScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.push('/lesson/lesson-introduce-yourself/speak')}
    />
  );
}
