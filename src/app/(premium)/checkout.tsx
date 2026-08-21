import { useRouter } from 'expo-router';

import { CheckoutScreen } from '@/features/premium/checkout-screen';

export default function CheckoutRoute() {
  const router = useRouter();
  return (
    <CheckoutScreen
      onBack={() => router.back()}
      onComplete={() => router.replace('/profile')}
      onPrivacy={() => router.push('/legal/privacy')}
      onTerms={() => router.push('/legal/terms')}
    />
  );
}
