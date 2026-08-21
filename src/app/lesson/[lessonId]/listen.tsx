import { useRouter } from 'expo-router';
import { ListenScreen } from '@/features/lesson-runner/screens';
export default function ListenRoute() {
  const router = useRouter();
  return (
    <ListenScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.push('/lesson/lesson-introduce-yourself/phrase-builder')}
    />
  );
}
