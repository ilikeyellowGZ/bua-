import { render, screen, userEvent } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { WelcomeScreen } from '@/features/auth/welcome-screen';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const renderWelcome = (props: Partial<React.ComponentProps<typeof WelcomeScreen>> = {}) =>
  render(
    <ThemeProvider>
      <MotionProvider preference="reduced">
        <WelcomeScreen
          onGetStarted={jest.fn()}
          onInstitution={jest.fn()}
          onLogin={jest.fn()}
          {...props}
        />
      </MotionProvider>
    </ThemeProvider>,
  );

describe('WelcomeScreen', () => {
  it('renders the approved Page 01 hierarchy and meaningful mascot', async () => {
    await renderWelcome();

    expect(screen.getByText('Bua’')).toBeOnTheScreen();
    expect(screen.getByText('Speak. Connect. Belong.')).toBeOnTheScreen();
    expect(screen.getByRole('image', { name: 'Thandi waves with her book' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Get started' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Join with institution code' })).toBeEnabled();
  });

  it('routes every visible access action once', async () => {
    const onGetStarted = jest.fn();
    const onLogin = jest.fn();
    const onInstitution = jest.fn();
    const user = userEvent.setup();
    await renderWelcome({ onGetStarted, onLogin, onInstitution });

    await user.press(screen.getByRole('button', { name: 'Get started' }));
    await user.press(screen.getByRole('button', { name: 'Log in' }));
    await user.press(screen.getByRole('button', { name: 'Join with institution code' }));

    expect(onGetStarted).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onInstitution).toHaveBeenCalledTimes(1);
  });
});
