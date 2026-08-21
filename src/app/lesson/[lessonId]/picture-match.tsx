import { useRouter } from 'expo-router';
import { PictureMatchScreen } from '@/features/lesson-runner/screens';
export default function PictureMatchRoute() {
  const router = useRouter();
  return (
    <PictureMatchScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.push('/lesson/lesson-introduce-yourself/conversation')}
    />
  );
}
