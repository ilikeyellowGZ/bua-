import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingScaffold } from '@/features/onboarding/onboarding-scaffold';
import type { StartingLevelChoice } from '@/types/domain';
import { BuaButton } from '@/ui/controls/bua-button';
import { ChoiceCard } from '@/ui/lesson/choice-card';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

type PlacementScreenProps = {
  onBack: () => void;
  onContinue: (value: StartingLevelChoice) => void;
};
const options: { id: StartingLevelChoice; label: string; description: string }[] = [
  { id: 'new', label: 'I’m new', description: 'Start with greetings and everyday words.' },
  {
    id: 'a-little',
    label: 'I know a little',
    description: 'Take a quick 3-minute placement check.',
  },
  {
    id: 'conversation',
    label: 'I can hold a conversation',
    description: 'Focus on fluency, listening and confidence.',
  },
];

export function PlacementScreen({ onBack, onContinue }: PlacementScreenProps) {
  const tokens = useTheme();
  const [selected, setSelected] = useState<StartingLevelChoice | null>(null);
  return (
    <OnboardingScaffold
      mascot={
        <View style={styles.mascot}>
          <Mascot decorative pose="placement-thinking" size={160} />
        </View>
      }
      onBack={onBack}
      progress={0.75}
    >
      <View style={styles.heading}>
        <Text
          accessibilityRole="header"
          style={[tokens.typography.h1, styles.center, { color: tokens.color.ink }]}
        >
          Where should we begin?
        </Text>
        <Text style={[tokens.typography.body, styles.center, { color: tokens.color.textMuted }]}>
          Choose the starting point that feels right.
        </Text>
      </View>
      <View style={styles.options}>
        {options.map((option) => (
          <ChoiceCard
            key={option.id}
            description={option.description}
            label={option.label}
            onPress={() => setSelected(option.id)}
            selected={selected === option.id}
          />
        ))}
      </View>
      <Text style={[tokens.typography.bodySmall, styles.center, { color: tokens.color.aloe }]}>
        You can change your level anytime.
      </Text>
      <BuaButton
        disabled={!selected}
        label="Continue"
        onPress={() => selected && onContinue(selected)}
        variant="ink"
      />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  heading: { gap: 8 },
  mascot: { alignItems: 'center', height: 130, overflow: 'hidden' },
  options: { gap: 12 },
});
