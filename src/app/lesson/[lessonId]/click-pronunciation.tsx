import { useLocalSearchParams, useRouter } from 'expo-router';

import { ClickPronunciationScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';

export default function ClickPronunciationRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { activity, recordAndContinue } = useLessonActivity(lessonId, 'pronunciation');
  return (
    <ClickPronunciationScreen
      activity={activity}
      onClose={() => router.replace('/learn')}
      onContinue={(performanceScore) =>
        recordAndContinue(performanceScore, () =>
          router.push({ pathname: '/lesson/[lessonId]/speak', params: { lessonId } }),
        )
      }
    />
  );
}
