import { useLocalSearchParams, useRouter } from 'expo-router';

import { PictureMatchScreen } from '@/features/lesson-runner/screens';
import { useLessonActivity } from '@/features/lesson-runner/use-lesson-activity';

export default function PictureMatchRoute() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const { activity, recordAndContinue } = useLessonActivity(lessonId, 'picture-match');
  return (
    <PictureMatchScreen
      activity={activity}
      onClose={() => router.replace('/learn')}
      onContinue={() =>
        recordAndContinue(1, () =>
          router.push({ pathname: '/lesson/[lessonId]/conversation', params: { lessonId } }),
        )
      }
    />
  );
}
