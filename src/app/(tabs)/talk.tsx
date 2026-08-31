import { useRouter } from 'expo-router';

import { TalkScreen } from '@/features/talk/talk-screen';

export default function TalkRoute() {
  const router = useRouter();
  return (
    <TalkScreen
      onStartRolePlay={() => router.push('/lesson/lesson-introduce-yourself/role-play')}
      onSoundFocus={() => router.push('/lesson/lesson-introduce-yourself/sound-focus')}
    />
  );
}
