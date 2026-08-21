import { useRouter } from 'expo-router';

import { PremiumOfferScreen } from '@/features/premium/premium-offer-screen';

export default function PremiumOfferRoute() {
  const router = useRouter();
  return (
    <PremiumOfferScreen
      onCheckout={() => router.push('/checkout')}
      onDismiss={() => router.back()}
    />
  );
}
