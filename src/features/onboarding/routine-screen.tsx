import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OnboardingScaffold } from '@/features/onboarding/onboarding-scaffold';
import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

export type RoutineSelection = {
  dailyTargetMinutes: number;
  reminderLocalTime: string;
  weekdays: number[];
};

type RoutineScreenProps = { onBack: () => void; onContinue: (value: RoutineSelection) => void };
const durations = [
  { minutes: 5, caption: 'A quick start' },
  { minutes: 10, caption: 'Build momentum' },
  { minutes: 15, caption: 'Make real progress' },
  { minutes: 20, caption: 'Go further' },
];
const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function RoutineScreen({ onBack, onContinue }: RoutineScreenProps) {
  const tokens = useTheme();
  const [minutes, setMinutes] = useState(10);
  const [days, setDays] = useState([0, 1, 2, 3, 4]);

  return (
    <OnboardingScaffold
      mascot={
        <View style={styles.mascot}>
          <Mascot decorative pose="routine-clock" size={145} />
        </View>
      }
      onBack={onBack}
      progress={0.5}
    >
      <View style={styles.heading}>
        <Text
          accessibilityRole="header"
          style={[tokens.typography.h1, styles.center, { color: tokens.color.ink }]}
        >
          Make Bua fit your day
        </Text>
        <Text style={[tokens.typography.body, styles.center, { color: tokens.color.textMuted }]}>
          A little practice every day makes speaking feel natural.
        </Text>
      </View>
      <View style={styles.durationGrid}>
        {durations.map((duration) => {
          const checked = minutes === duration.minutes;
          return (
            <Pressable
              key={duration.minutes}
              accessibilityLabel={`${duration.minutes} min, ${duration.caption}`}
              accessibilityRole="radio"
              accessibilityState={{ checked }}
              onPress={() => setMinutes(duration.minutes)}
              style={[
                styles.duration,
                {
                  backgroundColor: checked ? tokens.color.selectionSurface : tokens.color.surface,
                  borderColor: checked ? tokens.color.aloe : tokens.color.border,
                },
              ]}
            >
              <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>
                {duration.minutes} min
              </Text>
              <Text style={[tokens.typography.caption, { color: tokens.color.textMuted }]}>
                {duration.caption}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View
        style={[
          styles.reminder,
          { backgroundColor: tokens.color.surface, borderColor: tokens.color.border },
        ]}
      >
        <View>
          <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>Daily reminder</Text>
          <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
            Local time
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Reminder time, 19:30"
          accessibilityRole="button"
          style={[styles.time, { borderColor: tokens.color.aloe }]}
        >
          <Text style={[tokens.typography.bodyLarge, { color: tokens.color.aloe }]}>19:30</Text>
        </Pressable>
      </View>
      <View style={styles.days}>
        {weekdays.map((day, index) => {
          const checked = days.includes(index);
          return (
            <Pressable
              key={`${day}-${index}`}
              accessibilityLabel={`Day ${index + 1}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              onPress={() =>
                setDays((current) =>
                  current.includes(index)
                    ? current.filter((value) => value !== index)
                    : [...current, index].sort(),
                )
              }
              style={[
                styles.day,
                {
                  backgroundColor: checked ? tokens.color.aloe : tokens.color.surface,
                  borderColor: tokens.color.aloe,
                },
              ]}
            >
              <Text
                style={[
                  tokens.typography.caption,
                  { color: checked ? tokens.color.surface : tokens.color.aloe },
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[tokens.typography.bodySmall, styles.center, { color: tokens.color.aloe }]}>
        A steady rhythm helps your streak grow.
      </Text>
      <BuaButton
        label="Continue"
        onPress={() =>
          onContinue({ dailyTargetMinutes: minutes, reminderLocalTime: '19:30', weekdays: days })
        }
        variant="ink"
      />
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  day: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  duration: { borderRadius: 20, borderWidth: 2, gap: 4, minHeight: 90, padding: 16, width: '48%' },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  heading: { gap: 8 },
  mascot: { alignItems: 'center', height: 120, overflow: 'hidden' },
  reminder: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  time: { borderRadius: 999, borderWidth: 2, paddingHorizontal: 16, paddingVertical: 10 },
});
