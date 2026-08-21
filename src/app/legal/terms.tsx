import { useRouter } from 'expo-router';
import { LegalScreen } from '@/features/legal/legal-screen';
export default function TermsRoute() {
  const router = useRouter();
  return <LegalScreen kind="terms" onBack={() => router.back()} />;
}
