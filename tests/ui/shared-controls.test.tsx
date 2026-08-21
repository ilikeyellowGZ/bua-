import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { BuaButton } from '@/ui/controls/bua-button';
import { IconButton } from '@/ui/controls/icon-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { ChoiceCard } from '@/ui/lesson/choice-card';
import { ProgressHeader } from '@/ui/lesson/progress-header';
import { Mascot } from '@/ui/mascot/mascot';
import { ThemeProvider } from '@/ui/theme/theme-provider';

jest.useFakeTimers();

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

describe('Bua shared controls', () => {
  it('exposes enabled, pressed, disabled, and loading button states', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();

    await render(
      withProviders(<BuaButton label="Continue" onPress={onPress} testID="continue-button" />),
    );

    const button = screen.getByRole('button', { name: 'Continue' });
    expect(button).toBeEnabled();
    expect(button).toHaveStyle({ minHeight: 52, minWidth: 44 });
    expect(button).toHaveProp('hitSlop', { top: 4, right: 4, bottom: 4, left: 4 });

    await fireEvent(button, 'pressIn');
    expect(screen.getByTestId('continue-button-surface')).toHaveStyle({
      transform: [{ translateY: 2 }, { scale: 0.985 }],
    });
    await fireEvent(button, 'pressOut');

    await user.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);

    await screen.rerender(
      withProviders(
        <BuaButton label="Continue" onPress={onPress} disabled testID="continue-button" />,
      ),
    );
    expect(screen.getByRole('button', { name: 'Continue', disabled: true })).toBeDisabled();

    await screen.rerender(
      withProviders(
        <BuaButton label="Continue" onPress={onPress} loading testID="continue-button" />,
      ),
    );
    expect(
      screen.getByRole('button', { name: 'Continue, loading', disabled: true, busy: true }),
    ).toBeBusy();
  });

  it('announces choice selection without relying on color', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();

    await render(
      withProviders(
        <ChoiceCard
          label="Everyday conversations"
          description="Useful phrases for daily life"
          selected
          onPress={onPress}
        />,
      ),
    );

    const choice = screen.getByRole('radio', {
      name: /Everyday conversations Useful phrases for daily life Selected/,
      checked: true,
    });
    expect(choice).toBeChecked();
    expect(screen.getByText('Selected')).toBeOnTheScreen();
    await user.press(choice);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps icon and progress controls accessible at native target sizes', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();

    await render(
      withProviders(
        <ProgressHeader current={3} total={8} onClose={onClose} closeLabel="Close lesson" />,
      ),
    );

    const close = screen.getByRole('button', { name: 'Close lesson' });
    expect(close).toHaveStyle({ minHeight: 44, minWidth: 44 });
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
      min: 0,
      max: 8,
      now: 3,
      text: '3 of 8',
    });
    await user.press(close);
    expect(onClose).toHaveBeenCalledTimes(1);

    await screen.rerender(
      withProviders(
        <IconButton label="Play audio" onPress={jest.fn()}>
          <Text>Play</Text>
        </IconButton>,
      ),
    );
    expect(screen.getByRole('button', { name: 'Play audio' })).toHaveStyle({
      minHeight: 44,
      minWidth: 44,
    });
  });

  it('hides decorative mascot art and labels meaningful mascot art', async () => {
    await render(<Mascot pose="celebration" size={120} decorative />);
    expect(screen.queryByRole('image')).not.toBeOnTheScreen();

    await screen.rerender(
      <Mascot pose="celebration" size={120} accessibilityLabel="Thandi celebrates" />,
    );
    expect(screen.getByRole('image', { name: 'Thandi celebrates' })).toBeOnTheScreen();
  });

  it('announces feedback with explicit text', async () => {
    await render(
      withProviders(
        <FeedbackPanel
          tone="success"
          title="That’s right"
          message="Mina nginguLerato means I’m Lerato."
        />,
      ),
    );

    const feedback = screen.getByRole('alert');
    expect(feedback).toHaveAccessibleName('That’s right Mina nginguLerato means I’m Lerato.');
  });
});
