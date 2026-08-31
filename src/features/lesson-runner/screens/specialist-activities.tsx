import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AudioControl, Waveform } from '@/features/lesson-runner/activity-controls';
import { LessonScaffold, lessonStyles } from '@/features/lesson-runner/lesson-scaffold';
import { findTurn, getChoices, resolveChoice } from '@/features/lesson-runner/role-play';
import { introduceYourselfRolePlay } from '@/content/role-play-seed';
import { BuaButton } from '@/ui/controls/bua-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { ChoiceCard } from '@/ui/lesson/choice-card';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';
import type { RolePlayTurn } from '@/types/domain';

type ActivityScreenProps = { onClose: () => void; onContinue: () => void };

export function SoundFocusScreen({ onClose, onContinue }: ActivityScreenProps) {
  const choices = ['Sawubona', 'Siyabonga', 'Hamba'];
  const [selected, setSelected] = useState<string>();
  const [result, setResult] = useState<'correct' | 'incorrect'>();
  return (
    <LessonScaffold
      current={4}
      dark
      eyebrow="Sound focus"
      title="Which word did you hear?"
      subtitle="Listen carefully, then choose."
      mascot={<Mascot decorative pose="sound-focus" size={108} />}
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <View style={[styles.soundCircle, { borderColor: '#506378' }]}>
          <Waveform dark />
          <AudioControl compact dark label="Replay sound focus audio" />
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
        {result === 'incorrect' ? (
          <FeedbackPanel
            tone="coaching"
            title="Listen to the first sound"
            message="Sawubona begins with a soft ‘Sa’ sound."
          />
        ) : null}
        {result === 'correct' ? (
          <FeedbackPanel tone="success" title="Kulungile!" message="You heard Sawubona." />
        ) : null}
        <View style={lessonStyles.actionRow}>
          <BuaButton
            label="Play slowly"
            variant="outline"
            onPress={() => undefined}
            style={styles.flex}
          />
          <BuaButton
            label="Hear again"
            variant="outline"
            onPress={() => undefined}
            style={styles.flex}
          />
        </View>
        <BuaButton
          label={result === 'correct' ? 'Continue' : 'Check answer'}
          disabled={!selected}
          onPress={() => {
            if (result === 'correct') onContinue();
            else setResult(selected === 'Sawubona' ? 'correct' : 'incorrect');
          }}
        />
      </View>
    </LessonScaffold>
  );
}

const ROLE_PLAY_PROMPT_ID = 'lerato-prompt';

export function RolePlayScreen({ onClose, onContinue }: ActivityScreenProps) {
  const tokens = useTheme();
  const promptTurn = findTurn(introduceYourselfRolePlay, ROLE_PLAY_PROMPT_ID);
  const choices = getChoices(introduceYourselfRolePlay, ROLE_PLAY_PROMPT_ID);
  const [selectedTurnId, setSelectedTurnId] = useState<string>();
  const [outcome, setOutcome] = useState<{ correct: boolean; feedback: RolePlayTurn }>();

  const evaluate = () => {
    if (!selectedTurnId) return;
    const { chosen, feedback } = resolveChoice(introduceYourselfRolePlay, selectedTurnId);
    setOutcome({ correct: Boolean(chosen.correct), feedback });
  };

  return (
    <LessonScaffold
      current={7}
      eyebrow="Role-play"
      title="Meet a classmate"
      subtitle="Outside your first lecture"
      onClose={onClose}
    >
      <View style={lessonStyles.stack}>
        <Image
          accessibilityLabel="Lerato greets a classmate outside Kaya University"
          contentFit="cover"
          source={require('@/assets/scenes/generated/campus-roleplay.png')}
          style={lessonStyles.scene}
        />
        <View
          style={[
            styles.prompt,
            { borderColor: tokens.color.border, backgroundColor: tokens.color.surface },
          ]}
        >
          <AudioControl compact label="Replay Lerato’s question" />
          <View style={styles.copy}>
            <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
              {promptTurn.text}
            </Text>
            <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
              {promptTurn.translation}
            </Text>
          </View>
        </View>
        <View style={[styles.coach, { backgroundColor: tokens.color.selectionSurface }]}>
          <Mascot decorative pose="roleplay-companion" size={64} />
          <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>
            Answer with your name.
          </Text>
        </View>
        <View style={lessonStyles.choices}>
          {choices.map((choice) => (
            <ChoiceCard
              key={choice.id}
              label={choice.text}
              selected={selectedTurnId === choice.id}
              onPress={() => {
                setSelectedTurnId(choice.id);
                setOutcome(undefined);
              }}
            />
          ))}
        </View>
        {outcome && !outcome.correct ? (
          <FeedbackPanel tone="coaching" title="Not quite" message={outcome.feedback.text} />
        ) : null}
        {outcome?.correct ? (
          <FeedbackPanel tone="success" title="Perfect introduction" message={outcome.feedback.text} />
        ) : null}
        <BuaButton
          label={
            outcome?.correct ? 'Continue' : selectedTurnId ? 'Choose this reply' : 'Choose a reply'
          }
          disabled={!selectedTurnId}
          onPress={() => {
            if (outcome?.correct) onContinue();
            else evaluate();
          }}
        />
      </View>
    </LessonScaffold>
  );
}

export function LessonCompleteScreen({
  activeMinutes,
  activitiesCompleted,
  currentStreakDays,
  xpAwarded,
  onBackHome,
  onKeepLearning,
}: {
  activeMinutes: number;
  activitiesCompleted: number;
  currentStreakDays: number;
  xpAwarded: number;
  onBackHome: () => void;
  onKeepLearning: () => void;
}) {
  const tokens = useTheme();
  return (
    <View style={[styles.completeRoot, { backgroundColor: tokens.color.paper }]}>
      <View style={styles.completeContent}>
        <Text
          accessibilityRole="header"
          style={[tokens.typography.h1, styles.centerText, { color: tokens.color.ink }]}
        >
          Lesson complete
        </Text>
        <Text
          style={[tokens.typography.bodyLarge, styles.centerText, { color: tokens.color.aloe }]}
        >
          You can now introduce yourself and ask someone’s name.
        </Text>
        <View style={styles.celebration}>
          <Mascot
            accessibilityLabel="Thandi celebrates your completed lesson"
            pose="celebration"
            size={290}
            motion="celebrate"
          />
          <View style={[styles.speech, { backgroundColor: tokens.color.aloe }]}>
            <Text style={[tokens.typography.h2, { color: tokens.color.surface }]}>Aloe</Text>
          </View>
        </View>
        <Text style={[styles.minutes, { color: tokens.color.ink }]}>
          {activeMinutes} <Text style={tokens.typography.h1}>min</Text>
        </Text>
        <Text style={[tokens.typography.body, styles.centerText, { color: tokens.color.aloe }]}>
          active learning
        </Text>
        <View style={styles.metrics}>
          {[
            [String(activitiesCompleted), 'activities'],
            [String(xpAwarded), 'XP earned'],
            [String(currentStreakDays), 'day streak'],
          ].map(([value, label]) => (
            <View key={label} style={styles.metric}>
              <Text style={[tokens.typography.h1, { color: tokens.color.aloe }]}>{value}</Text>
              <Text style={[tokens.typography.bodySmall, { color: tokens.color.ink }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
        <View style={[styles.skill, { borderColor: tokens.color.aloe }]}>
          <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
            ✓ Skill unlocked: Introductions
          </Text>
        </View>
        <BuaButton label="Keep learning" variant="ink" onPress={onKeepLearning} />
        <Pressable accessibilityRole="button" onPress={onBackHome}>
          <Text
            style={[
              tokens.typography.body,
              styles.centerText,
              { color: tokens.color.aloe, textDecorationLine: 'underline' },
            ]}
          >
            Back to home
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  celebration: { alignItems: 'center', alignSelf: 'center', justifyContent: 'center', width: 330 },
  centerText: { textAlign: 'center' },
  coach: { alignItems: 'center', borderRadius: 22, flexDirection: 'row', gap: 14, padding: 14 },
  completeContent: {
    alignSelf: 'center',
    flex: 1,
    gap: 16,
    maxWidth: 720,
    padding: 24,
    width: '100%',
  },
  completeRoot: { flex: 1 },
  copy: { flex: 1, gap: 4 },
  flex: { flex: 1 },
  metric: { alignItems: 'center', flex: 1, gap: 3 },
  metrics: { flexDirection: 'row' },
  minutes: { fontSize: 68, fontWeight: '800', textAlign: 'center' },
  prompt: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  skill: { alignItems: 'center', borderRadius: 20, borderWidth: 2, padding: 18 },
  soundCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 12,
    height: 280,
    justifyContent: 'center',
    width: 280,
  },
  speech: {
    borderRadius: 22,
    left: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    position: 'absolute',
    top: 36,
  },
});
