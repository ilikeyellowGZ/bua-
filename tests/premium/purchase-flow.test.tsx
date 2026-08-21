import { render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { CheckoutScreen } from '@/features/premium/checkout-screen';
import { PremiumOfferScreen } from '@/features/premium/premium-offer-screen';
import { createDemoPurchaseRepository } from '@/features/premium/purchase.repository';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

describe('Bua Premium flow', () => {
  it('dismisses the offer without degrading free learning', async () => {
    const onDismiss = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(<PremiumOfferScreen onCheckout={jest.fn()} onDismiss={onDismiss} />),
    );

    for (const benefit of [
      'Unlimited speaking practice',
      'Offline lessons and downloads',
      'Detailed pronunciation coaching',
      'No ads, just learning',
    ]) {
      expect(screen.getByText(benefit)).toBeOnTheScreen();
    }
    await user.press(screen.getByRole('button', { name: 'Continue with Free' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('updates localized checkout totals atomically when the plan changes', async () => {
    const repository = createDemoPurchaseRepository();
    const user = userEvent.setup();
    await render(
      withProviders(
        <CheckoutScreen
          onBack={jest.fn()}
          onComplete={jest.fn()}
          purchaseRepository={repository}
        />,
      ),
    );

    await screen.findByText('R599.99 / year');
    await user.press(screen.getByRole('radio', { name: /Monthly R79.99/ }));
    expect(screen.getByText('Then R79.99/month after your trial')).toBeOnTheScreen();
  });

  it('deduplicates purchase requests and grants one verified entitlement', async () => {
    const repository = createDemoPurchaseRepository();
    const first = await repository.purchase('bua_premium_annual_za', 'request-1');
    const replay = await repository.purchase('bua_premium_annual_za', 'request-1');
    expect(replay.transactionId).toBe(first.transactionId);
    expect((await repository.getEntitlements()).filter((item) => item.active)).toHaveLength(1);
  });

  it('starts the platform purchase once and reports verified success', async () => {
    const repository = createDemoPurchaseRepository();
    const purchase = jest.spyOn(repository, 'purchase');
    const onComplete = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <CheckoutScreen
          onBack={jest.fn()}
          onComplete={onComplete}
          purchaseRepository={repository}
        />,
      ),
    );

    await screen.findByText('R599.99 / year');
    await user.press(screen.getByRole('button', { name: 'Start free trial' }));
    await waitFor(() => expect(screen.getByText('Premium activated')).toBeOnTheScreen());
    expect(purchase).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
