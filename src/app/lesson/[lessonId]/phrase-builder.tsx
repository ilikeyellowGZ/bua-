import { useRouter } from 'expo-router';
import { PhraseBuilderScreen } from '@/features/lesson-runner/screens';
export default function PhraseBuilderRoute() {
  const router = useRouter();
  return (
    <PhraseBuilderScreen
      onClose={() => router.replace('/learn')}
      onContinue={() => router.push('/lesson/lesson-introduce-yourself/picture-match')}
    />
  );
}
