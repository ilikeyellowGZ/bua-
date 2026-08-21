import { type PropsWithChildren, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useTheme } from '@/ui/theme/theme-provider';

type OnboardingScaffoldProps = PropsWithChildren<{
  progress: number;
  onBack: () => void;
  mascot?: ReactNode;
}>;

export function OnboardingScaffold({
  progress,
  onBack,
  mascot,
  children,
}: OnboardingScaffoldProps) {
  const tokens = useTheme();
  const { height } = useWindowDimensions();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={[
        styles.content,
        { minHeight: height, paddingHorizontal: tokens.space[3], paddingVertical: tokens.space[3] },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.back}
        >
          <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>←</Text>
        </Pressable>
        <View style={[styles.track, { backgroundColor: tokens.color.disabledSurface }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: tokens.color.sun,
                width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
              },
            ]}
          />
        </View>
      </View>
      {mascot}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  content: { flexGrow: 1, gap: 20, paddingBottom: 40 },
  fill: { borderRadius: 999, height: '100%' },
  header: { alignItems: 'center', flexDirection: 'row', gap: 16 },
  track: { borderRadius: 999, flex: 1, height: 16, overflow: 'hidden' },
});
