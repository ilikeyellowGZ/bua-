import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingScaffold } from '@/features/onboarding/onboarding-scaffold';
import type { GoalKind } from '@/types/domain';
import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

type GoalScreenProps = { onBack: () => void; onContinue: (goal: GoalKind) => void };

const goals: { id: GoalKind; label: string; symbol: string; accent: 'aloe' | 'clay' }[] = [
  { id: 'colleagues', label: 'Speak with colleagues', symbol: '♟', accent: 'aloe' },
  { id: 'family', label: 'Connect with family', symbol: '♟', accent: 'clay' },
  { id: 'campus', label: 'Study and campus life', symbol: '◇', accent: 'aloe' },
  { id: 'everyday', label: 'Everyday conversations', symbol: '◌', accent: 'aloe' },
];

export function GoalScreen({ onBack, onContinue }: GoalScreenProps) {
  const tokens = useTheme();
  const [selected, setSelected] = useState<GoalKind | null>(null);

  return (
    <OnboardingScaffold
      mascot={
        <View style={styles.peek}>
          <Mascot decorative pose="onboarding-peek" size={210} />
        </View>
      }
      onBack={onBack}
      progress={1}
    >
      <View style={styles.sheet}>
        <View style={styles.heading}>
          <Text
            accessibilityRole="header"
            style={[tokens.typography.h1, styles.center, { color: tokens.color.ink }]}
          >
            What would you like to do first?
          </Text>
          <Text style={[tokens.typography.body, styles.center, { color: tokens.color.textMuted }]}>
            We’ll shape your first lessons around your goal.
          </Text>
        </View>
        <View style={styles.options}>
          {goals.map((goal) => {
            const checked = selected === goal.id;
            const accent = goal.accent === 'clay' ? tokens.color.clay : tokens.color.aloe;
            return (
              <Pressable
                key={goal.id}
                accessibilityLabel={`${goal.label}${checked ? ', Selected' : ''}`}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
                onPress={() => setSelected(goal.id)}
                style={[
                  styles.option,
                  {
                    backgroundColor: checked ? tokens.color.selectionSurface : tokens.color.surface,
                    borderColor: checked ? tokens.color.aloe : tokens.color.border,
                  },
                ]}
              >
                <Text style={[styles.symbol, { color: accent }]}>{goal.symbol}</Text>
                <Text
                  style={[
                    tokens.typography.bodyLarge,
                    styles.optionLabel,
                    { color: tokens.color.ink },
                  ]}
                >
                  {goal.label}
                </Text>
                {checked ? (
                  <Text style={[tokens.typography.h3, { color: tokens.color.aloe }]}>✓</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
        <BuaButton
          disabled={!selected}
          label="Continue"
          onPress={() => selected && onContinue(selected)}
        />
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  heading: { gap: 8 },
  option: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 14,
    minHeight: 88,
    paddingHorizontal: 20,
  },
  optionLabel: { flex: 1 },
  options: { gap: 16 },
  peek: { alignItems: 'center', height: 155, marginBottom: -35, overflow: 'hidden', zIndex: 2 },
  sheet: { gap: 24 },
  symbol: { fontSize: 38 },
});
