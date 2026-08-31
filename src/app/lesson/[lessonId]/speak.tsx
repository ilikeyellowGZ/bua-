import { useLocalSearchParams, useRouter } from 'expo-router';

import { SpeakScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';

export default function SpeakRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { activity, recordAndContinue } = useLessonActivity(lessonId, 'speak');
  return (
    <SpeakScreen
      activity={activity}
      onClose={() => router.replace('/learn')}
      onContinue={(performanceScore) =>
        recordAndContinue(performanceScore, () =>
          router.replace({ pathname: '/lesson/[lessonId]/complete', params: { lessonId } }),
        )
      }
    />
  );
}
