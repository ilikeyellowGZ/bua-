import { useRouter } from 'expo-router';
import { DictationScreen } from '@/features/lesson-runner/screens';
export default function DictationRoute() {
  const router = useRouter();
  return (
    <DictationScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.push('/lesson/lesson-introduce-yourself/click-pronunciation')}
    />
  );
}
