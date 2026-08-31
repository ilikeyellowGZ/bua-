import { render, screen, userEvent } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { LegalScreen } from '@/features/legal/legal-screen';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

describe('LegalScreen', () => {
  it('renders real privacy content instead of the placeholder draft copy', async () => {
    await render(withProviders(<LegalScreen kind="privacy" onBack={jest.fn()} />));

    expect(screen.getByText('Privacy')).toBeOnTheScreen();
    expect(screen.queryByText(/production draft/i)).toBeNull();
    expect(screen.getByText('Voice and audio data')).toBeOnTheScreen();
    expect(screen.getByText('Children’s privacy')).toBeOnTheScreen();
    expect(screen.getByText('Administrator access')).toBeOnTheScreen();
    expect(screen.getByText(/privacy@bua\.app/)).toBeOnTheScreen();
  });

  it('renders real terms content covering subscriptions and AI-feedback disclaimers', async () => {
    await render(withProviders(<LegalScreen kind="terms" onBack={jest.fn()} />));

    expect(screen.getByText('Terms of use')).toBeOnTheScreen();
    expect(screen.queryByText(/production draft/i)).toBeNull();
    expect(screen.getByText('Subscriptions and payments')).toBeOnTheScreen();
    expect(screen.getByText('Pronunciation and AI-assisted feedback')).toBeOnTheScreen();
    expect(screen.getByText(/legal@bua\.app/)).toBeOnTheScreen();
  });

  it('calls onBack when the back control is pressed', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await render(withProviders(<LegalScreen kind="privacy" onBack={onBack} />));

    await user.press(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
