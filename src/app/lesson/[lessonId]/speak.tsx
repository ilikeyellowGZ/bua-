import { useRouter } from 'expo-router';
import { SpeakScreen } from '@/features/lesson-runner/screens';
export default function SpeakRoute() {
  const router = useRouter();
  return (
    <SpeakScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.replace('/lesson/lesson-introduce-yourself/complete')}
    />
  );
}
