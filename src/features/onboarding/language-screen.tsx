import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';
import { OnboardingScaffold } from '@/features/onboarding/onboarding-scaffold';

type Reason = 'family' | 'travel' | 'work' | 'school';

export type LanguageSelection = { languageCode: string; reasons: Reason[] };

type LanguageScreenProps = { onBack: () => void; onContinue: (value: LanguageSelection) => void };

const languages = [
  { code: 'zu', label: 'isiZulu', greeting: 'Sawubona' },
  { code: 'st', label: 'Sesotho', greeting: 'Dumela' },
  { code: 'tn', label: 'Setswana', greeting: 'Dumela' },
  { code: 'xh', label: 'isiXhosa', greeting: 'Molo' },
  { code: 'af', label: 'Afrikaans', greeting: 'Hallo' },
  { code: 'en', label: 'English', greeting: 'Hello' },
] as const;
const reasons: { id: Reason; label: string }[] = [
  { id: 'family', label: 'Family' },
  { id: 'travel', label: 'Travel' },
  { id: 'work', label: 'Work' },
  { id: 'school', label: 'School' },
];

export function LanguageScreen({ onBack, onContinue }: LanguageScreenProps) {
  const tokens = useTheme();
  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Reason[]>([]);
  const ready = Boolean(languageCode && selectedReasons.length > 0);

  return (
    <OnboardingScaffold
      mascot={
        <View style={styles.mascot}>
          <Mascot decorative pose="language-greeting" size={132} />
        </View>
      }
      onBack={onBack}
      progress={0.25}
    >
      <View style={styles.heading}>
        <Text
          accessibilityRole="header"
          style={[tokens.typography.h1, styles.center, { color: tokens.color.ink }]}
        >
          What would you like to speak?
        </Text>
        <Text style={[tokens.typography.body, styles.center, { color: tokens.color.textMuted }]}>
          Choose one to begin. You can add more later.
        </Text>
      </View>
      <View style={styles.grid}>
        {languages.map((language) => {
          const selected = languageCode === language.code;
          return (
            <Pressable
              key={language.code}
              accessibilityLabel={`${language.label}, ${language.greeting}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setLanguageCode(language.code)}
              style={[
                styles.language,
                {
                  backgroundColor: selected ? tokens.color.selectionSurface : tokens.color.surface,
                  borderColor: selected ? tokens.color.aloe : tokens.color.border,
                },
              ]}
            >
              <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
                {language.label}
              </Text>
              <Text style={[tokens.typography.bodySmall, { color: tokens.color.aloe }]}>
                {language.greeting}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>Why are you learning?</Text>
      <View style={styles.reasonList}>
        {reasons.map((reason) => {
          const checked = selectedReasons.includes(reason.id);
          return (
            <Pressable
              key={reason.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              onPress={() =>
                setSelectedReasons((current) =>
                  current.includes(reason.id)
                    ? current.filter((value) => value !== reason.id)
                    : [...current, reason.id],
                )
              }
              style={[
                styles.reason,
                { borderColor: checked ? tokens.color.aloe : tokens.color.border },
              ]}
            >
              <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>
                {reason.label}
              </Text>
              <Text
                style={[
                  tokens.typography.bodyLarge,
                  { color: checked ? tokens.color.aloe : tokens.color.disabledText },
                ]}
              >
                {checked ? '✓' : '○'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <BuaButton
        disabled={!ready}
        label="Continue"
        onPress={() => languageCode && onContinue({ languageCode, reasons: selectedReasons })}
      />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  heading: { gap: 8 },
  language: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 2,
    gap: 4,
    minHeight: 90,
    padding: 16,
    width: '48%',
  },
  mascot: { alignItems: 'center', height: 110, overflow: 'hidden' },
  reason: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 18,
  },
  reasonList: { gap: 10 },
});
