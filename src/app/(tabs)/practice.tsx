import { useRouter } from 'expo-router';
import { PracticeScreen } from '@/features/practice-library/practice-screen';
export default function PracticeRoute() {
  const router = useRouter();
  return (
    <PracticeScreen
      onFeatured={() => router.push('/lesson/lesson-introduce-yourself/conversation')}
      onSoundFocus={() => router.push('/lesson/lesson-introduce-yourself/sound-focus')}
      onPremium={() => router.push('/offer')}
    />
  );
}
