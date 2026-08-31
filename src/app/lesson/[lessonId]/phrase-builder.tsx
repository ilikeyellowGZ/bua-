import { useLocalSearchParams, useRouter } from 'expo-router';

import { PhraseBuilderScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';

export default function PhraseBuilderRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { activity, recordAndContinue } = useLessonActivity(lessonId, 'phrase-builder');
  return (
    <PhraseBuilderScreen
      activity={activity}
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(1, () =>
          router.push({ pathname: '/lesson/[lessonId]/picture-match', params: { lessonId } }),
        )
      }
    />
  );
}
