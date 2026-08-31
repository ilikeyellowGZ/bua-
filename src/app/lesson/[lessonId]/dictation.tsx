import { useLocalSearchParams, useRouter } from 'expo-router';

import { DictationScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';

export default function DictationRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { activity, recordAndContinue } = useLessonActivity(lessonId, 'dictation');
  return (
    <DictationScreen
      activity={activity}
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(1, () =>
          router.push({ pathname: '/lesson/[lessonId]/click-pronunciation', params: { lessonId } }),
        )
      }
    />
  );
}
