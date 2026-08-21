import { useState } from 'react';
import { useRouter } from 'expo-router';

import { authRepository } from '@/features/auth/auth.repository';
import { AuthSheet } from '@/features/auth/auth-sheet';
import { InstitutionSheet } from '@/features/auth/institution-sheet';
import { WelcomeScreen } from '@/features/auth/welcome-screen';

export default function WelcomeRoute() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState<'login' | 'institution' | null>(null);
  const continueToOnboarding = () => {
    setSheet(null);
    router.push('/language');
  };
  const start = async () => {
    setLoading(true);
    try {
      await authRepository.continueAsGuest();
      continueToOnboarding();
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <WelcomeScreen
        loading={loading}
        onGetStarted={start}
        onInstitution={() => setSheet('institution')}
        onLogin={() => setSheet('login')}
      />
      <AuthSheet
        onClose={() => setSheet(null)}
        onComplete={continueToOnboarding}
        repository={authRepository}
        visible={sheet === 'login'}
      />
      <InstitutionSheet
        onClose={() => setSheet(null)}
        onComplete={continueToOnboarding}
        repository={authRepository}
        visible={sheet === 'institution'}
      />
    </>
  );
}
