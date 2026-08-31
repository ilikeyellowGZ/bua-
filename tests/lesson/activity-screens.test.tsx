import { render, screen, userEvent } from '@testing-library/react-native';

import { MotionProvider } from '@/core/motion/motion-provider';
import { buaSeedContent } from '@/content/seed';
import { getActivityByKind } from '@/features/lesson-runner/use-lesson-activity';
import {
  ClickPronunciationScreen,
  ComprehensionScreen,
  ConversationScreen,
  DictationScreen,
  ListenScreen,
  PhraseBuilderScreen,
  PictureMatchScreen,
  RolePlayScreen,
  SoundFocusScreen,
  SpeakScreen,
} from '@/features/lesson-runner/screens';
import { ThemeProvider } from '@/ui/theme/theme-provider';

const lesson = buaSeedContent.lesson;
const activity = (kind: Parameters<typeof getActivityByKind>[1]) => getActivityByKind(lesson, kind);

const withProviders = (child: React.ReactNode) => (
  <ThemeProvider>
    <MotionProvider preference="reduced">{child}</MotionProvider>
  </ThemeProvider>
);

describe('Bua lesson activity screens', () => {
  it('requires an accessible listening action before continuing', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <ListenScreen activity={activity('listen')} onClose={jest.fn()} onContinue={onContinue} />,
      ),
    );

    expect(screen.getByRole('button', { name: 'Continue', disabled: true })).toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Play audio' }));
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('builds the exact sentence using stable tap-to-move tokens', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <PhraseBuilderScreen
          activity={activity('phrase-builder')}
          onClose={jest.fn()}
          onContinue={onContinue}
        />,
      ),
    );

    for (const token of ['Sawubona.', 'Igama', 'lami', 'nguNeo.']) {
      await user.press(screen.getByRole('button', { name: `Move ${token} to answer` }));
    }
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Sentence complete')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('matches the picture to the target word from real activity data', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <PictureMatchScreen
          activity={activity('picture-match')}
          onClose={jest.fn()}
          onContinue={onContinue}
        />,
      ),
    );

    expect(screen.getByRole('button', { name: 'Continue', disabled: true })).toBeDisabled();
    await user.press(screen.getByRole('radio', { name: 'Bread' }));
    expect(screen.getByText('Try another picture')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: 'Water' }));
    expect(screen.getByText('amanzi = water')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('only accepts the reply marked correct in the activity data', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <ConversationScreen
          activity={activity('conversation')}
          onClose={jest.fn()}
          onContinue={onContinue}
        />,
      ),
    );

    await user.press(screen.getByRole('radio', { name: 'Igama lami nguNeo.' }));
    await user.press(screen.getByRole('button', { name: 'Say this reply' }));
    expect(screen.getByText('Choose the social reply')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: 'Kahle, ngiyabonga. Wena?' }));
    await user.press(screen.getByRole('button', { name: 'Say this reply' }));
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('keeps comprehension retryable until the correct meaning is checked', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <ComprehensionScreen
          activity={activity('comprehension')}
          onClose={jest.fn()}
          onContinue={onContinue}
        />,
      ),
    );

    await user.press(screen.getByRole('radio', { name: 'I’m leaving.' }));
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Listen once more')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: 'I’m Lerato.' }));
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('That’s right')).toBeOnTheScreen();
  });

  it('normalizes punctuation and case for dictation scoring', async () => {
    const user = userEvent.setup();
    await render(
      withProviders(
        <DictationScreen activity={activity('dictation')} onClose={jest.fn()} onContinue={jest.fn()} />,
      ),
    );

    await user.type(screen.getByLabelText('Type what you hear'), 'ngiyaphila ngiyabonga');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(screen.getByText('Kulungile!')).toBeOnTheScreen();
  });

  it('labels deterministic speaking feedback as demo practice and reports a real score', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <SpeakScreen activity={activity('speak')} onClose={jest.fn()} onContinue={onContinue} />,
      ),
    );

    await user.press(screen.getByRole('button', { name: 'Start speaking practice' }));
    expect(screen.getByText('Good clarity')).toBeOnTheScreen();
    expect(screen.getByText('Demo practice result')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledWith(expect.any(Number));
  });

  it('captures a click-pronunciation practice attempt and reports a real score', async () => {
    const onContinue = jest.fn();
    const user = userEvent.setup();
    await render(
      withProviders(
        <ClickPronunciationScreen
          activity={activity('pronunciation')}
          onClose={jest.fn()}
          onContinue={onContinue}
        />,
      ),
    );

    expect(screen.getByRole('button', { name: 'Check my sound', disabled: true })).toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Start click-pronunciation practice' }));
    expect(screen.getByText('Practice captured')).toBeOnTheScreen();
    expect(screen.getByText('Timing\nGreat!')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledWith(expect.any(Number));
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
