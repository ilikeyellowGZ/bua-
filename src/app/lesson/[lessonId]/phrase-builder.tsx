import { useRouter } from 'expo-router';
import { PhraseBuilderScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';
export default function PhraseBuilderRoute() {
  const router = useRouter();
  const { recordAndContinue } = useLessonActivity('activity-introduce-phrase-builder');
  return (
    <PhraseBuilderScreen
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(() => router.push('/lesson/lesson-introduce-yourself/picture-match'))
      }
    />
  );
}
