import { useRouter } from 'expo-router';
import { SoundFocusScreen } from '@/features/lesson-runner/screens';
export default function SoundFocusRoute() {
  const router = useRouter();
  return (
    <SoundFocusScreen
      onClose={() => router.replace('/practice')}
      onContinue={() => router.replace('/lesson/lesson-introduce-yourself/speak')}
    />
  );
}
