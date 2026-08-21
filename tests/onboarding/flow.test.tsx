import { render, screen, userEvent } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { GoalScreen } from '@/features/onboarding/goal-screen';
import { LanguageScreen } from '@/features/onboarding/language-screen';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const providers = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

describe('Bua onboarding screens', () => {
  it('requires a language reason and advances with the approved isiZulu choice', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(providers(<LanguageScreen onBack={jest.fn()} onContinue={onContinue} />));

    expect(screen.getByRole('button', { name: 'Continue', disabled: true })).toBeDisabled();
    await user.press(screen.getByRole('radio', { name: /isiZulu/ }));
    await user.press(screen.getByRole('checkbox', { name: /Family/ }));
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledWith({ languageCode: 'zu', reasons: ['family'] });
  });

  it('offers all four exact Page 02 goals and returns the selected goal', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(providers(<GoalScreen onBack={jest.fn()} onContinue={onContinue} />));

    for (const label of [
      'Speak with colleagues',
      'Connect with family',
      'Study and campus life',
      'Everyday conversations',
    ]) {
      expect(screen.getByRole('radio', { name: new RegExp(label) })).toBeOnTheScreen();
    }
    await user.press(screen.getByRole('radio', { name: /Everyday conversations/ }));
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledWith('everyday');
  });
});
