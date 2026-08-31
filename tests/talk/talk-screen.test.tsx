import { render, screen, userEvent } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { TalkScreen } from '@/features/talk/talk-screen';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

describe('TalkScreen', () => {
  it('renders the featured role-play and sound-focus entry points and routes both', async () => {
    const onStartRolePlay = jest.fn();
    const onSoundFocus = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(<TalkScreen onStartRolePlay={onStartRolePlay} onSoundFocus={onSoundFocus} />),
    );

    expect(screen.getByText('Meet a classmate')).toBeOnTheScreen();
    expect(screen.getByText('Sound focus')).toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', { name: 'Meet a classmate, 5 minutes, guided conversation' }),
    );
    expect(onStartRolePlay).toHaveBeenCalledTimes(1);

    await user.press(
      screen.getByRole('button', {
        name: 'Sound focus, train your ear with short focused word choices',
      }),
    );
    expect(onSoundFocus).toHaveBeenCalledTimes(1);
  });
});
