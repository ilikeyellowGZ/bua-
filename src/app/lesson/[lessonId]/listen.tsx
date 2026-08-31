import { useLocalSearchParams, useRouter } from 'expo-router';

import { ListenScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';

export default function ListenRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { activity, recordAndContinue } = useLessonActivity(lessonId, 'listen');
  return (
    <ListenScreen
      activity={activity}
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(1, () =>
          router.push({ pathname: '/lesson/[lessonId]/phrase-builder', params: { lessonId } }),
        )
      }
    />
  );
}
