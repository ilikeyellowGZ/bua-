import { useRouter } from 'expo-router';
import { RolePlayScreen } from '@/features/lesson-runner/screens';
export default function RolePlayRoute() {
  const router = useRouter();
  return (
    <RolePlayScreen
      onClose={() => router.replace('/practice')}
      onContinue={() => router.replace('/lesson/lesson-introduce-yourself/complete')}
    />
  );
}
