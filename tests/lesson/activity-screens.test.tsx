import { render, screen, userEvent } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import {
  ClickPronunciationScreen,
  ComprehensionScreen,
  DictationScreen,
  ListenScreen,
  PhraseBuilderScreen,
  RolePlayScreen,
  SoundFocusScreen,
  SpeakScreen,
} from '@/features/lesson-runner/screens';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

describe('Bua lesson activity screens', () => {
  it('requires an accessible listening action before continuing', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(withProviders(<ListenScreen onClose={jest.fn()} onContinue={onContinue} />));

    expect(screen.getByRole('button', { name: 'Continue', disabled: true })).toBeDisabled();
    await user.press(screen.getByRole('button', { name: /Play Neo’s introduction/ }));
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('builds the exact sentence using stable tap-to-move tokens', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(<PhraseBuilderScreen onClose={jest.fn()} onContinue={onContinue} />),
    );

    for (const token of ['Sawubona.', 'Igama', 'lami', 'nguNeo.']) {
      await user.press(screen.getByRole('button', { name: `Move ${token} to answer` }));
    }
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Sentence complete')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('keeps comprehension retryable until the correct meaning is checked', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(<ComprehensionScreen onClose={jest.fn()} onContinue={onContinue} />),
    );

    await user.press(screen.getByRole('radio', { name: /I’m leaving/ }));
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Listen once more')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: /I’m Lerato/ }));
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('That’s right')).toBeOnTheScreen();
  });

  it('normalizes punctuation and case for dictation scoring', async () => {
    const user = userEvent.setup();
    await render(withProviders(<DictationScreen onClose={jest.fn()} onContinue={jest.fn()} />));

    await user.type(screen.getByLabelText('Type what you hear'), 'ngiyaphila ngiyabonga');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Kulungile!')).toBeOnTheScreen();
  });

  it('labels deterministic speaking feedback as demo practice', async () => {
    const user = userEvent.setup();
    await render(withProviders(<SpeakScreen onClose={jest.fn()} onContinue={jest.fn()} />));

    await user.press(screen.getByRole('button', { name: 'Start speaking practice' }));
    expect(screen.getByText('Good clarity')).toBeOnTheScreen();
    expect(screen.getByText('Demo practice result')).toBeOnTheScreen();
  });

  it('scores the seeded speaking attempt per phrase segment through the real pronunciation pipeline', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(withProviders(<SpeakScreen onClose={jest.fn()} onContinue={onContinue} />));

    await user.press(screen.getByRole('button', { name: 'Start speaking practice' }));
    expect(screen.getByText('Sawubona')).toBeOnTheScreen();
    expect(screen.getByText('Igama lami')).toBeOnTheScreen();
    expect(screen.getByText('Try “nguNeo” again.')).toBeOnTheScreen();

    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.queryByText('Good clarity')).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue', disabled: true })).toBeDisabled();
  });

  it('captures a click-pronunciation practice attempt through the real pipeline', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(<ClickPronunciationScreen onClose={jest.fn()} onContinue={onContinue} />),
    );

    expect(screen.getByRole('button', { name: 'Check my sound', disabled: true })).toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Start click-pronunciation practice' }));
    expect(screen.getByText('Practice captured')).toBeOnTheScreen();
    expect(screen.getByText('Timing\nGreat!')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('checks sound focus explicitly after a selection', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(withProviders(<SoundFocusScreen onClose={jest.fn()} onContinue={onContinue} />));

    expect(screen.getByRole('button', { name: 'Check answer', disabled: true })).toBeDisabled();
    await user.press(screen.getByRole('radio', { name: /Sawubona/ }));
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('keeps role-play contextual and retryable', async () => {
    const user = userEvent.setup();
    await render(withProviders(<RolePlayScreen onClose={jest.fn()} onContinue={jest.fn()} />));

    await user.press(screen.getByRole('radio', { name: /Ngiyabonga/ }));
    await user.press(screen.getByRole('button', { name: 'Choose this reply' }));
    expect(
      screen.getByText('“Ngiyabonga” means “thank you.” Introduce yourself with “Igama lami…” instead.'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: /Igama lami nguNeo/ }));
    await user.press(screen.getByRole('button', { name: 'Choose this reply' }));
    expect(screen.getByText('Perfect introduction')).toBeOnTheScreen();
  });

  it('gives each wrong reply its own contextually correct feedback, fixing the shared-message bug', async () => {
    const user = userEvent.setup();
    await render(withProviders(<RolePlayScreen onClose={jest.fn()} onContinue={jest.fn()} />));

    await user.press(screen.getByRole('radio', { name: /Hamba kahle/ }));
    await user.press(screen.getByRole('button', { name: 'Choose this reply' }));
    expect(
      screen.getByText('“Hamba kahle” means “goodbye.” Introduce yourself with “Igama lami…” instead.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/thank you/)).toBeNull();
  });
});
