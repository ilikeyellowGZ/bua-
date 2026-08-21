import { useRouter } from 'expo-router';
import { ConversationScreen } from '@/features/lesson-runner/screens';
export default function ConversationRoute() {
  const router = useRouter();
  return (
    <ConversationScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.push('/lesson/lesson-introduce-yourself/comprehension')}
    />
  );
}
