import { useRouter } from 'expo-router';
import { ComprehensionScreen } from '@/features/lesson-runner/screens';
export default function ComprehensionRoute() {
  const router = useRouter();
  return (
    <ComprehensionScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.push('/lesson/lesson-introduce-yourself/dictation')}
    />
  );
}
