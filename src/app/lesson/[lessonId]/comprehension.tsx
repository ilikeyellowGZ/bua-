import { useLocalSearchParams, useRouter } from 'expo-router';

import { ComprehensionScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';

export default function ComprehensionRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { activity, recordAndContinue } = useLessonActivity(lessonId, 'comprehension');
  return (
    <ComprehensionScreen
      activity={activity}
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(1, () =>
          router.push({ pathname: '/lesson/[lessonId]/dictation', params: { lessonId } }),
        )
      }
    />
  );
}
