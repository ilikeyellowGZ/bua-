import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { calculateDictationScore } from '@/features/lesson-runner/scoring';
import { AudioControl, Waveform } from '@/features/lesson-runner/activity-controls';
import { LessonScaffold, lessonStyles } from '@/features/lesson-runner/lesson-scaffold';
import { BuaButton } from '@/ui/controls/bua-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { ChoiceCard } from '@/ui/lesson/choice-card';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

type ActivityScreenProps = { onClose: () => void; onContinue: () => void };

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

export function ListenScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const [heard, setHeard] = useState<string>();
  return (
    <LessonScaffold
      current={1}
      eyebrow="Listen"
      title="Listen to the conversation"
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Neo and Lerato greet each other outside Kaya Café"
          contentFit="cover"
          source={scenes.cafe}
          style={lessonStyles.scene}
        />
        {(
          [
            [
              'neo',
              'Play Neo’s introduction',
              'Sawubona! Igama lami nguNeo.',
              'Hello! My name is Neo.',
            ],
            [
              'lerato',
              'Play Lerato’s introduction',
              'Sawubona, Neo. Mina nginguLerato.',
              "Hello, Neo. I'm Lerato.",
            ],
          ] satisfies readonly (readonly [string, string, string, string])[]
        ).map(([id, label, line, translation]) => (
          <View
            key={id}
            style={[
              styles.lineCard,
              { borderColor: heard === id ? tokens.color.aloe : tokens.color.border },
            ]}
          >
            <AudioControl compact label={label} onPlayed={() => setHeard(id)} />
            <View style={styles.flexCopy}>
              <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>{line}</Text>
              <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
                {translation}
              </Text>
            </View>
          </View>
        ))}
        <View style={styles.center}>
          <BuaButton
            label="Slow audio"
            onPress={() => setHeard('slow')}
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
const phraseTokens: BuilderToken[] = [
  { id: 'sawubona', text: 'Sawubona.' },
  { id: 'igama', text: 'Igama' },
  { id: 'lami', text: 'lami' },
  { id: 'neo', text: 'nguNeo.' },
  { id: 'ngikhona', text: 'ngikhona' },
  { id: 'wena', text: 'wena' },
  { id: 'kahle', text: 'kahle' },
];

export function PhraseBuilderScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const [answer, setAnswer] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  const answerTokens = answer
    .map((id) => phraseTokens.find((token) => token.id === id))
    .filter(Boolean) as BuilderToken[];
  const unused = phraseTokens.filter((token) => !answer.includes(token.id));
  const correct = answer.join('|') === 'sawubona|igama|lami|neo';

  const evaluate = () => setResult(correct ? 'correct' : 'incorrect');
  return (
    <LessonScaffold
      current={2}
      title="Build the sentence"
      subtitle="Hello, my name is Neo."
      mascot={<Mascot decorative pose="phrase-builder-cheer" size={82} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Two classmates introducing themselves"
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
          <FeedbackPanel
            tone="success"
            title="Sentence complete"
            message="Sawubona. Igama lami nguNeo."
          />
        ) : null}
        {result === 'incorrect' ? (
          <FeedbackPanel
            tone="coaching"
            title="Try that order again"
            message="Start with Sawubona, then introduce your name."
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

const pictureChoices = [
  { id: 'water', label: 'A glass of water', source: scenes.water },
  { id: 'bread', label: 'A loaf of bread', source: scenes.bread },
  { id: 'house', label: 'A house', source: scenes.house },
  { id: 'family', label: 'A family', source: scenes.family },
] as const;

export function PictureMatchScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const [selected, setSelected] = useState<string>();
  const [attemptedWrong, setAttemptedWrong] = useState(false);
  const correct = selected === 'water';
  return (
    <LessonScaffold
      current={3}
      title="Match the word"
      subtitle="Tap the picture for:"
      mascot={<Mascot decorative pose="picture-match-point" size={100} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <View style={styles.wordRow}>
          <Text style={[tokens.typography.display, { color: tokens.color.ink }]}>amanzi</Text>
          <AudioControl compact label="Play amanzi" />
        </View>
        <View accessibilityRole="radiogroup" style={styles.pictureGrid}>
          {pictureChoices.map((choice) => (
            <Pressable
              key={choice.id}
              accessibilityLabel={choice.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === choice.id, disabled: correct }}
              disabled={correct}
              onPress={() => {
                setSelected(choice.id);
                if (choice.id !== 'water') setAttemptedWrong(true);
              }}
              style={[
                styles.pictureCard,
                {
                  borderColor:
                    selected === choice.id
                      ? correct
                        ? tokens.color.aloe
                        : tokens.color.sunPressed
                      : tokens.color.border,
                },
              ]}
            >
              <Image contentFit="cover" source={choice.source} style={StyleSheet.absoluteFill} />
              {selected === choice.id ? (
                <View
                  style={[
                    styles.pictureCheck,
                    { backgroundColor: correct ? tokens.color.aloe : tokens.color.sun },
                  ]}
                >
                  <Text style={{ color: tokens.color.surface }}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
        {correct ? (
          <FeedbackPanel tone="success" title="Kulungile!" message="amanzi = water" />
        ) : null}
        {attemptedWrong && !correct ? (
          <FeedbackPanel
            tone="coaching"
            title="Try another picture"
            message="Amanzi is something you drink."
          />
        ) : null}
        <BuaButton label="Continue" disabled={!correct} onPress={onContinue} />
      </View>
    </LessonScaffold>
  );
}

export function ConversationScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const choices = ['Kahle, ngiyabonga. Wena?', 'Igama lami nguNeo.', 'Hamba kahle.'];
  const [selected, setSelected] = useState<string>();
  const [showTranslation, setShowTranslation] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  return (
    <LessonScaffold
      current={4}
      dark
      title="Choose your reply"
      mascot={<Mascot decorative pose="conversation-passenger" size={92} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="A woman greeting you at a South African taxi rank"
          contentFit="cover"
          source={scenes.taxi}
          style={[lessonStyles.scene, { height: 245 }]}
        />
        <View style={[styles.darkBubble, { backgroundColor: tokens.color.darkLessonSurface }]}>
          <AudioControl compact dark label="Replay conversation prompt" />
          <View style={styles.flexCopy}>
            <Text style={[tokens.typography.bodyLarge, { color: tokens.color.surface }]}>
              Sawubona! Unjani namhlanje?
            </Text>
            {showTranslation ? (
              <Text style={[tokens.typography.bodySmall, { color: '#B9C5D0' }]}>
                Hello! How are you today?
              </Text>
            ) : null}
          </View>
        </View>
        <View style={lessonStyles.choices}>
          {choices.map((choice) => (
            <ChoiceCard
              key={choice}
              label={choice}
              selected={selected === choice}
              onPress={() => {
                setSelected(choice);
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
            message="Answer how you are, then ask the speaker too."
          />
        ) : null}
        <BuaButton
          label={result === 'correct' ? 'Continue' : 'Say this reply'}
          disabled={!selected}
          onPress={() => {
            if (result === 'correct') onContinue();
            else setResult(selected === choices[0] ? 'correct' : 'incorrect');
          }}
        />
        <BuaButton
          label="Choose another"
          variant="outline"
          onPress={() => {
            setSelected(undefined);
            setResult(undefined);
          }}
        />
      </View>
    </LessonScaffold>
  );
}

export function ComprehensionScreen({ onClose, onContinue }: ActivityScreenProps) {
  const choices = ['I’m Lerato.', 'I’m leaving.', 'I’m studying.'];
  const [selected, setSelected] = useState<string>();
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  return (
    <LessonScaffold
      current={5}
      eyebrow="Understand"
      title="What did Lerato say?"
      subtitle="Choose the best meaning."
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <View style={styles.mediaRow}>
          <Image
            accessibilityLabel="Lerato speaking outside Kaya Café"
            contentFit="cover"
            source={scenes.lerato}
            style={[lessonStyles.scene, styles.leratoScene]}
          />
          <AudioControl label="Replay Lerato’s introduction" />
        </View>
        <View style={lessonStyles.choices}>
          {choices.map((choice) => (
            <ChoiceCard
              key={choice}
              label={choice}
              selected={selected === choice}
              onPress={() => {
                setSelected(choice);
                setResult(undefined);
              }}
            />
          ))}
        </View>
        {result === 'correct' ? (
          <FeedbackPanel
            tone="success"
            title="That’s right"
            message="Mina nginguLerato means “I’m Lerato.”"
          />
        ) : null}
        {result === 'incorrect' ? (
          <FeedbackPanel
            tone="coaching"
            title="Listen once more"
            message="Mina nginguLerato introduces the speaker by name."
          />
        ) : null}
        <BuaButton
          label={result === 'correct' ? 'Continue' : 'Check answer'}
          disabled={!selected}
          onPress={() => {
            if (result === 'correct') onContinue();
            else setResult(selected === choices[0] ? 'correct' : 'incorrect');
          }}
        />
      </View>
    </LessonScaffold>
  );
}

export function DictationScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const target = 'Ngiyaphila, ngiyabonga.';
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
      current={6}
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
            message="Listen again and check the spelling of ngiyabonga."
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

export function ClickPronunciationScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const [result, setResult] = useState(false);
  return (
    <LessonScaffold
      current={7}
      dark
      eyebrow="Learn the click"
      title={'The “q” sound'}
      mascot={<Mascot decorative pose="pronunciation-coach" size={104} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Tongue placement diagram with three click-pronunciation steps"
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
            onPress={() => setResult(true)}
            style={[styles.mic, { backgroundColor: tokens.color.aloe }]}
          >
            <Text style={[tokens.typography.h1, { color: tokens.color.surface }]}>●</Text>
          </Pressable>
          <Text style={[tokens.typography.body, { color: result ? tokens.color.aloe : '#A9B5C2' }]}>
            {result ? 'Practice captured' : 'Tap when ready'}
          </Text>
        </View>
        {result ? (
          <View style={[styles.metricRow, { borderColor: '#75869A' }]}>
            {['Timing\nGreat!', 'Clarity\nClear!', 'Confidence\nKeep going!'].map((label) => (
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
          onPress={onContinue}
        />
      </View>
    </LessonScaffold>
  );
}

export function SpeakScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const [result, setResult] = useState(false);
  return (
    <LessonScaffold
      current={8}
      dark
      eyebrow="Speak"
      title="Say the phrase"
      mascot={<Mascot decorative pose="speaking-coach" size={105} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Text style={[styles.speakPhrase, { color: tokens.color.surface }]}>
          Sawubona.{`\n`}Igama lami nguNeo.
        </Text>
        <View style={[styles.recordingRing, { borderColor: '#53667A' }]}>
          <Waveform dark />
          <Pressable
            accessibilityLabel="Start speaking practice"
            accessibilityRole="button"
            onPress={() => setResult(true)}
            style={[styles.mic, { backgroundColor: tokens.color.aloe }]}
          >
            <Text style={[tokens.typography.h1, { color: tokens.color.surface }]}>●</Text>
          </Pressable>
        </View>
        {result ? (
          <>
            <Text
              accessibilityLiveRegion="polite"
              style={[tokens.typography.h3, styles.centerText, { color: tokens.color.aloe }]}
            >
              Good clarity
            </Text>
            <View style={[styles.feedbackCard, { backgroundColor: tokens.color.paper }]}>
              {[
                ['Sawubona', '✓'],
                ['Igama lami', '✓'],
                ['nguNeo', 'Try the “ngu” sound once more.'],
              ].map(([part, feedback]) => (
                <View key={part} style={styles.feedbackRow}>
                  <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
                    {part}
                  </Text>
                  <Text
                    style={[
                      tokens.typography.bodySmall,
                      { color: feedback === '✓' ? tokens.color.aloe : tokens.color.sunPressed },
                    ]}
                  >
                    {feedback}
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
            onPress={() => setResult(false)}
            style={styles.flexButton}
          />
          <BuaButton
            label="Continue"
            disabled={!result}
            onPress={onContinue}
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
