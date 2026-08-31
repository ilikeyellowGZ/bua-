import { useRouter } from 'expo-router';

import { ProfileScreen } from '@/features/profile/profile-screen';

export default function ProfileRoute() {
  const router = useRouter();
  return (
    <ProfileScreen
      onOpenPremium={() => router.push('/offer')}
      onOpenPrivacy={() => router.push('/legal/privacy')}
      onOpenTerms={() => router.push('/legal/terms')}
      onOpenAdmin={() => router.push('/dashboard')}
      onSignedOut={() => router.replace('/welcome')}
    />
  );
}
