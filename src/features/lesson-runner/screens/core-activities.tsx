import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { calculateDictationScore } from '@/features/lesson-runner/scoring';
import { AudioControl, Waveform } from '@/features/lesson-runner/activity-controls';
import { LessonScaffold, lessonStyles } from '@/features/lesson-runner/lesson-scaffold';
import { useVoicePractice } from '@/features/lesson-runner/use-voice-practice';
import { BuaButton } from '@/ui/controls/bua-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { ChoiceCard } from '@/ui/lesson/choice-card';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';
import type { Activity } from '@/types/domain';

type ActivityScreenProps = { activity: Activity; onClose: () => void; onContinue: () => void };
type PracticeScreenProps = {
  activity: Activity;
  onClose: () => void;
  onContinue: (performanceScore: number) => void;
};

const scenes = {
  cafe: require('@/assets/scenes/generated/cafe-story.png'),
  lerato: require('@/assets/scenes/generated/lerato-cafe.png'),
  phrase: require('@/assets/scenes/generated/phrase-classmates.png'),
  water: require('@/assets/scenes/generated/water.png'),
  bread: require('@/assets/scenes/generated/bread.png'),
  house: require('@/assets/scenes/generated/house.png'),
  family: require('@/assets/scenes/generated/family.png'),
  taxi: require('@/assets/scenes/generated/taxi-rank.png'),
  click: require('@/assets/scenes/generated/click-instructions.png'),
};

function sceneSource(imageKey: string | undefined) {
  return imageKey && imageKey in scenes ? scenes[imageKey as keyof typeof scenes] : undefined;
}

export function ListenScreen({ activity, onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const [heard, setHeard] = useState(false);
  return (
    <LessonScaffold current={activity.order} eyebrow="Listen" title="Listen and repeat" onClose={onClose}>
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Lesson illustration"
          contentFit="cover"
          source={scenes.cafe}
          style={lessonStyles.scene}
        />
        <View style={[styles.lineCard, { borderColor: heard ? tokens.color.aloe : tokens.color.border }]}>
          <AudioControl compact label="Play audio" onPlayed={() => setHeard(true)} />
          <View style={styles.flexCopy}>
            <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
              {activity.prompt}
            </Text>
            {activity.translation ? (
              <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
                {activity.translation}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.center}>
          <BuaButton
            label="Slow audio"
            onPress={() => setHeard(true)}
            variant="outline"
            style={styles.inlineButton}
          />
        </View>
        <BuaButton label="Continue" onPress={onContinue} disabled={!heard} />
      </View>
    </LessonScaffold>
  );
}

type BuilderToken = { id: string; text: string };

export function PhraseBuilderScreen({ activity, onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const targetTokens = (activity.answer ?? '').split(' ').filter(Boolean);
  const phraseTokens: BuilderToken[] = targetTokens.map((text, index) => ({
    id: `token-${index}`,
    text,
  }));
  const bankOrder = [...phraseTokens].reverse();
  const [answer, setAnswer] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  const answerTokens = answer
    .map((id) => phraseTokens.find((token) => token.id === id))
    .filter(Boolean) as BuilderToken[];
  const unused = bankOrder.filter((token) => !answer.includes(token.id));
  const correct = answerTokens.map((token) => token.text).join(' ') === targetTokens.join(' ');

  const evaluate = () => setResult(correct ? 'correct' : 'incorrect');
  return (
    <LessonScaffold
      current={activity.order}
      title="Build the sentence"
      subtitle={activity.prompt}
      mascot={<Mascot decorative pose="phrase-builder-cheer" size={82} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Lesson illustration"
          contentFit="cover"
          source={scenes.phrase}
          style={[lessonStyles.scene, { height: 265 }]}
        />
        <View
          style={[
            styles.workspace,
            { backgroundColor: tokens.color.surface, borderColor: tokens.color.border },
          ]}
        >
          <View style={styles.tileWrap} accessibilityLabel="Sentence answer area">
            {answerTokens.map((token) => (
              <Pressable
                key={token.id}
                accessibilityLabel={`Return ${token.text} to word bank`}
                accessibilityRole="button"
                onPress={() => {
                  setAnswer((current) => current.filter((id) => id !== token.id));
                  setResult(undefined);
                }}
                style={[
                  styles.tile,
                  {
                    borderColor: tokens.color.aloe,
                    backgroundColor: tokens.color.selectionSurface,
                  },
                ]}
              >
                <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>
                  {token.text}
                </Text>
              </Pressable>
            ))}
            {!answer.length ? (
              <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
                Tap words below to build your answer.
              </Text>
            ) : null}
          </View>
          <View style={styles.tileWrap}>
            {unused.map((token) => (
              <Pressable
                key={token.id}
                accessibilityLabel={`Move ${token.text} to answer`}
                accessibilityRole="button"
                onPress={() => {
                  setAnswer((current) => [...current, token.id]);
                  setResult(undefined);
                }}
                style={[
                  styles.tile,
                  { borderColor: tokens.color.border, backgroundColor: tokens.color.surface },
                ]}
              >
                <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>
                  {token.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {result === 'correct' ? (
          <FeedbackPanel tone="success" title="Sentence complete" message={targetTokens.join(' ')} />
        ) : null}
        {result === 'incorrect' ? (
          <FeedbackPanel
            tone="coaching"
            title="Try that order again"
            message="Check the word order and try again."
          />
        ) : null}
        <View style={lessonStyles.actionRow}>
          <BuaButton
            label="Clear"
            variant="outline"
            onPress={() => {
              setAnswer([]);
              setResult(undefined);
            }}
            style={styles.flexButton}
          />
          <BuaButton
            label={result === 'correct' ? 'Continue' : 'Check answer'}
            disabled={!answer.length}
            onPress={result === 'correct' ? onContinue : evaluate}
            style={styles.flexButtonWide}
          />
        </View>
      </View>
    </LessonScaffold>
  );
}

export function PictureMatchScreen({ activity, onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const choices = activity.choices ?? [];
  const [selected, setSelected] = useState<string>();
  const [attemptedWrong, setAttemptedWrong] = useState(false);
  const selectedChoice = choices.find((choice) => choice.id === selected);
  const correctChoice = choices.find((choice) => choice.correct);
  const correct = Boolean(selectedChoice?.correct);
  return (
    <LessonScaffold
      current={activity.order}
      title="Match the word"
      subtitle={activity.prompt}
      mascot={<Mascot decorative pose="picture-match-point" size={100} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <View style={styles.wordRow}>
          <Text style={[tokens.typography.display, { color: tokens.color.ink }]}>
            {activity.answer}
          </Text>
          <AudioControl compact label={`Play ${activity.answer}`} />
        </View>
        <View accessibilityRole="radiogroup" style={styles.pictureGrid}>
          {choices.map((choice) => {
            const source = sceneSource(choice.imageKey);
            return (
              <Pressable
                key={choice.id}
                accessibilityLabel={choice.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected === choice.id, disabled: correct }}
                disabled={correct}
                onPress={() => {
                  setSelected(choice.id);
                  if (!choice.correct) setAttemptedWrong(true);
                }}
                style={[
                  styles.pictureCard,
                  {
                    borderColor:
                      selected === choice.id
                        ? choice.correct
                          ? tokens.color.aloe
                          : tokens.color.sunPressed
                        : tokens.color.border,
                  },
                ]}
              >
                {source ? (
                  <Image contentFit="cover" source={source} style={StyleSheet.absoluteFill} />
                ) : (
                  <View
                    style={[styles.pictureTextCard, { backgroundColor: tokens.color.selectionSurface }]}
                  >
                    <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>
                      {choice.label}
                    </Text>
                  </View>
                )}
                {selected === choice.id ? (
                  <View
                    style={[
                      styles.pictureCheck,
                      { backgroundColor: choice.correct ? tokens.color.aloe : tokens.color.sun },
                    ]}
                  >
                    <Text style={{ color: tokens.color.surface }}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        {correct && correctChoice ? (
          <FeedbackPanel
            tone="success"
            title="Kulungile!"
            message={`${activity.answer} = ${correctChoice.label.toLowerCase()}`}
          />
        ) : null}
        {attemptedWrong && !correct ? (
          <FeedbackPanel tone="coaching" title="Try another picture" message="Listen again and try another option." />
        ) : null}
        <BuaButton label="Continue" disabled={!correct} onPress={onContinue} />
      </View>
    </LessonScaffold>
  );
}

export function ConversationScreen({ activity, onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const choices = activity.choices ?? [];
  const [selectedId, setSelectedId] = useState<string>();
  const [showTranslation, setShowTranslation] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  const selectedChoice = choices.find((choice) => choice.id === selectedId);
  return (
    <LessonScaffold
      current={activity.order}
      dark
      title="Choose your reply"
      mascot={<Mascot decorative pose="conversation-passenger" size={92} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Lesson illustration"
          contentFit="cover"
          source={scenes.taxi}
          style={[lessonStyles.scene, { height: 245 }]}
        />
        <View style={[styles.darkBubble, { backgroundColor: tokens.color.darkLessonSurface }]}>
          <AudioControl compact dark label="Replay conversation prompt" />
          <View style={styles.flexCopy}>
            <Text style={[tokens.typography.bodyLarge, { color: tokens.color.surface }]}>
              {activity.prompt}
            </Text>
            {showTranslation && activity.translation ? (
              <Text style={[tokens.typography.bodySmall, { color: '#B9C5D0' }]}>
                {activity.translation}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={lessonStyles.choices}>
          {choices.map((choice) => (
            <ChoiceCard
              key={choice.id}
              label={choice.label}
              selected={selectedId === choice.id}
              onPress={() => {
                setSelectedId(choice.id);
                setResult(undefined);
              }}
            />
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={() => setShowTranslation((value) => !value)}>
          <Text style={[tokens.typography.body, styles.centerText, { color: tokens.color.aloe }]}>
            {showTranslation ? 'Hide translation' : 'Show translation'}
          </Text>
        </Pressable>
        {result === 'incorrect' ? (
          <FeedbackPanel
            tone="coaching"
            title="Choose the social reply"
            message="Choose the reply that best fits the greeting."
          />
        ) : null}
        <BuaButton
          label={result === 'correct' ? 'Continue' : 'Say this reply'}
          disabled={!selectedId}
          onPress={() => {
            if (result === 'correct') onContinue();
            else setResult(selectedChoice?.correct ? 'correct' : 'incorrect');
          }}
        />
        <BuaButton
          label="Choose another"
          variant="outline"
          onPress={() => {
            setSelectedId(undefined);
            setResult(undefined);
          }}
        />
      </View>
    </LessonScaffold>
  );
}

export function ComprehensionScreen({ activity, onClose, onContinue }: ActivityScreenProps) {
  const choices = activity.choices ?? [];
  const [selectedId, setSelectedId] = useState<string>();
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  const selectedChoice = choices.find((choice) => choice.id === selectedId);
  return (
    <LessonScaffold
      current={activity.order}
      eyebrow="Understand"
      title={activity.prompt}
      subtitle="Choose the best meaning."
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <View style={styles.mediaRow}>
          <Image
            accessibilityLabel="Lesson illustration"
            contentFit="cover"
            source={scenes.lerato}
            style={[lessonStyles.scene, styles.leratoScene]}
          />
          <AudioControl label="Replay audio" />
        </View>
        <View style={lessonStyles.choices}>
          {choices.map((choice) => (
            <ChoiceCard
              key={choice.id}
              label={choice.label}
              selected={selectedId === choice.id}
              onPress={() => {
                setSelectedId(choice.id);
                setResult(undefined);
              }}
            />
          ))}
        </View>
        {result === 'correct' ? (
          <FeedbackPanel tone="success" title="That’s right" message="Well done — that's the correct meaning." />
        ) : null}
        {result === 'incorrect' ? (
          <FeedbackPanel
            tone="coaching"
            title="Listen once more"
            message="Listen again and choose the best meaning."
          />
        ) : null}
        <BuaButton
          label={result === 'correct' ? 'Continue' : 'Check answer'}
          disabled={!selectedId}
          onPress={() => {
            if (result === 'correct') onContinue();
            else setResult(selectedChoice?.correct ? 'correct' : 'incorrect');
          }}
        />
      </View>
    </LessonScaffold>
  );
}

export function DictationScreen({ activity, onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const target = activity.answer ?? '';
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  const reveal = () => {
    const expected = target.split(' ');
    const actual = value.trim().split(/\s+/).filter(Boolean);
    if (actual.length < expected.length)
      setValue([...actual, expected[actual.length]].filter(Boolean).join(' '));
  };
  return (
    <LessonScaffold
      current={activity.order}
      title="What do you hear?"
      mascot={<Mascot decorative pose="dictation-listen" size={105} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <View style={styles.audioHero}>
          <AudioControl label="Play dictation audio" />
          <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
            Tap to play
          </Text>
          <BuaButton
            label="0.75×"
            variant="outline"
            onPress={() => undefined}
            style={styles.inlineButton}
          />
        </View>
        <TextInput
          accessibilityLabel="Type what you hear"
          multiline
          onChangeText={(text) => {
            setValue(text);
            setResult(undefined);
          }}
          placeholder="Type the sentence…"
          style={[
            styles.dictationInput,
            tokens.typography.h3,
            { borderColor: tokens.color.border, color: tokens.color.ink },
          ]}
          value={value}
        />
        <View style={[lessonStyles.card, { borderColor: '#F4D49C', backgroundColor: '#FFF9ED' }]}>
          <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>Need help?</Text>
          <View style={lessonStyles.actionRow}>
            <BuaButton
              label="Reveal one word"
              variant="outline"
              onPress={reveal}
              style={styles.flexButton}
            />
            <BuaButton
              label="Slow audio"
              variant="outline"
              onPress={() => undefined}
              style={styles.flexButton}
            />
          </View>
        </View>
        {result === 'correct' ? (
          <FeedbackPanel
            tone="success"
            title="Kulungile!"
            message="You heard every word correctly."
          />
        ) : null}
        {result === 'incorrect' ? (
          <FeedbackPanel
            tone="coaching"
            title="Nearly there"
            message="Listen again and check your spelling."
          />
        ) : null}
        <BuaButton
          label={result === 'correct' ? 'Continue' : 'Check answer'}
          disabled={!value.trim()}
          onPress={() => {
            if (result === 'correct') onContinue();
            else
              setResult(calculateDictationScore(target, value).correct ? 'correct' : 'incorrect');
          }}
        />
      </View>
    </LessonScaffold>
  );
}

export function ClickPronunciationScreen({ activity, onClose, onContinue }: PracticeScreenProps) {
  const tokens = useTheme();
  const expectedText = activity.answer ?? activity.prompt;
  const { status, result, record } = useVoicePractice({ expectedText });
  return (
    <LessonScaffold
      current={activity.order}
      dark
      eyebrow="Practice"
      title="Pronunciation practice"
      mascot={<Mascot decorative pose="pronunciation-coach" size={104} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Pronunciation practice illustration"
          contentFit="contain"
          source={scenes.click}
          style={[lessonStyles.scene, { backgroundColor: tokens.color.surface, height: 270 }]}
        />
        <View style={styles.waveRows}>
          <Text style={[tokens.typography.body, { color: tokens.color.aloe }]}>Listen</Text>
          <Waveform dark />
          <Text style={[tokens.typography.body, { color: tokens.color.surface }]}>Your turn</Text>
          <Waveform dark />
        </View>
        <View style={styles.center}>
          <Pressable
            accessibilityLabel="Start click-pronunciation practice"
            accessibilityRole="button"
            onPress={() => record()}
            style={[styles.mic, { backgroundColor: tokens.color.aloe }]}
          >
            <Text style={[tokens.typography.h1, { color: tokens.color.surface }]}>●</Text>
          </Pressable>
          <Text style={[tokens.typography.body, { color: result ? tokens.color.aloe : '#A9B5C2' }]}>
            {status === 'processing'
              ? 'Checking…'
              : status === 'denied'
                ? 'Microphone access needed'
                : result
                  ? 'Practice captured'
                  : 'Tap when ready'}
          </Text>
        </View>
        {result ? (
          <View style={[styles.metricRow, { borderColor: '#75869A' }]}>
            {(result.label === 'good-clarity'
              ? ['Timing\nGreat!', 'Clarity\nClear!', 'Confidence\nNice work!']
              : ['Timing\nTry again', 'Clarity\nListen once more', 'Confidence\nKeep going!']
            ).map((label) => (
              <Text
                key={label}
                style={[
                  tokens.typography.bodySmall,
                  styles.metric,
                  { color: tokens.color.surface },
                ]}
              >
                {label}
              </Text>
            ))}
          </View>
        ) : null}
        <Text style={[tokens.typography.caption, styles.centerText, { color: '#A9B5C2' }]}>
          Demo practice result — not a clinical assessment
        </Text>
        <BuaButton
          label={result ? 'Continue' : 'Check my sound'}
          disabled={!result}
          onPress={() => onContinue(result?.score ?? 1)}
        />
      </View>
    </LessonScaffold>
  );
}

export function SpeakScreen({ activity, onClose, onContinue }: PracticeScreenProps) {
  const tokens = useTheme();
  const expectedText = activity.answer ?? activity.prompt;
  const { status, result, record, reset } = useVoicePractice({ expectedText });
  return (
    <LessonScaffold
      current={activity.order}
      dark
      eyebrow="Speak"
      title="Say the phrase"
      mascot={<Mascot decorative pose="speaking-coach" size={105} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Text style={[styles.speakPhrase, { color: tokens.color.surface }]}>{expectedText}</Text>
        <View style={[styles.recordingRing, { borderColor: '#53667A' }]}>
          <Waveform dark />
          <Pressable
            accessibilityLabel="Start speaking practice"
            accessibilityRole="button"
            onPress={() => record()}
            style={[styles.mic, { backgroundColor: tokens.color.aloe }]}
          >
            <Text style={[tokens.typography.h1, { color: tokens.color.surface }]}>●</Text>
          </Pressable>
        </View>
        {status === 'processing' ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[tokens.typography.body, styles.centerText, { color: tokens.color.surface }]}
          >
            Checking your pronunciation…
          </Text>
        ) : null}
        {status === 'denied' ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[tokens.typography.body, styles.centerText, { color: tokens.color.sunPressed }]}
          >
            Microphone access is needed to practise speaking.
          </Text>
        ) : null}
        {result ? (
          <>
            <Text
              accessibilityLiveRegion="polite"
              style={[tokens.typography.h3, styles.centerText, { color: tokens.color.aloe }]}
            >
              {result.label === 'good-clarity' ? 'Good clarity' : 'Keep practising'}
            </Text>
            <View style={[styles.feedbackCard, { backgroundColor: tokens.color.paper }]}>
              {result.segmentScores.map(({ segment, correct }) => (
                <View key={segment} style={styles.feedbackRow}>
                  <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
                    {segment}
                  </Text>
                  <Text
                    style={[
                      tokens.typography.bodySmall,
                      { color: correct ? tokens.color.aloe : tokens.color.sunPressed },
                    ]}
                  >
                    {correct ? '✓' : `Try “${segment}” again.`}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[tokens.typography.caption, styles.centerText, { color: '#A9B5C2' }]}>
              Demo practice result
            </Text>
          </>
        ) : null}
        <View style={lessonStyles.actionRow}>
          <BuaButton
            label="Try again"
            variant="outline"
            onPress={reset}
            disabled={!result}
            style={styles.flexButton}
          />
          <BuaButton
            label="Continue"
            disabled={!result}
            onPress={() => onContinue(result?.score ?? 1)}
            style={styles.flexButton}
          />
        </View>
      </View>
    </LessonScaffold>
  );
}

const styles = StyleSheet.create({
  audioHero: { alignItems: 'center', gap: 10 },
  center: { alignItems: 'center', gap: 10 },
  centerText: { textAlign: 'center' },
  darkBubble: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  dictationInput: {
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 150,
    padding: 20,
    textAlignVertical: 'top',
  },
  feedbackCard: { borderRadius: 22, overflow: 'hidden', padding: 18 },
  feedbackRow: { borderBottomColor: '#DDD9CF', borderBottomWidth: 1, gap: 4, paddingVertical: 12 },
  flexButton: { flex: 1 },
  flexButtonWide: { flex: 1.6 },
  flexCopy: { flex: 1, gap: 5 },
  inlineButton: { minWidth: 150 },
  leratoScene: { flex: 1, height: 230 },
  lineCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  mediaRow: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  metric: { flex: 1, textAlign: 'center' },
  metricRow: { borderRadius: 22, borderWidth: 1, flexDirection: 'row', padding: 18 },
  mic: { alignItems: 'center', borderRadius: 999, height: 94, justifyContent: 'center', width: 94 },
  pictureCard: { borderRadius: 22, borderWidth: 2, height: 205, overflow: 'hidden', width: '48%' },
  pictureCheck: {
    alignItems: 'center',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 42,
  },
  pictureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pictureTextCard: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    padding: 12,
    width: '100%',
  },
  recordingRing: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 12,
    height: 300,
    justifyContent: 'center',
    width: 300,
  },
  speakPhrase: { fontSize: 42, fontWeight: '700', lineHeight: 54, textAlign: 'center' },
  tile: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  tileWrap: {
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    minHeight: 72,
  },
  waveRows: { gap: 8 },
  wordRow: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  workspace: { borderRadius: 24, borderWidth: 1, gap: 30, minHeight: 260, padding: 20 },
});
