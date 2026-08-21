import { useRouter } from 'expo-router';
import { LegalScreen } from '@/features/legal/legal-screen';
export default function PrivacyRoute() {
  const router = useRouter();
  return <LegalScreen kind="privacy" onBack={() => router.back()} />;
}
