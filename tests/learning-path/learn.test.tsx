import { render, screen, userEvent } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { LearnScreen } from '@/features/learning-path/learn-screen';
import { ThemeProvider } from '@/ui/theme/theme-provider';

describe('LearnScreen', () => {
  it('renders the exact seeded Page 03 state and routes learning actions', async () => {
    const onContinueLesson = jest.fn();
    const onQuickReview = jest.fn();
    const user = userEvent.setup();
    await render(
      <ThemeProvider>
        <MotionProvider preference="reduced">
          <LearnScreen onContinueLesson={onContinueLesson} onQuickReview={onQuickReview} />
        </MotionProvider>
      </ThemeProvider>,
    );
    expect(screen.getByText('Sawubona, Neo')).toBeOnTheScreen();
    expect(screen.getByText('Introduce yourself')).toBeOnTheScreen();
    expect(screen.getByText('3 of 8 activities')).toBeOnTheScreen();
    expect(screen.getByText('Greetings')).toBeOnTheScreen();
    expect(screen.getByText('Meeting people')).toBeOnTheScreen();
    expect(screen.getByText('Getting around')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Continue lesson' }));
    await user.press(screen.getByRole('button', { name: /Quick review/ }));
    expect(onContinueLesson).toHaveBeenCalledTimes(1);
    expect(onQuickReview).toHaveBeenCalledTimes(1);
  });
});
