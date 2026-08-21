import { type PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MotionEntrance } from '@/core/motion/motion-entrance';
import { ProgressHeader } from '@/ui/lesson/progress-header';
import { useTheme } from '@/ui/theme/theme-provider';

type LessonScaffoldProps = PropsWithChildren<{
  current: number;
  dark?: boolean;
  eyebrow?: string;
  mascot?: ReactNode;
  onClose: () => void;
  subtitle?: string;
  title: string;
}>;

export function LessonScaffold({
  children,
  current,
  dark = false,
  eyebrow,
  mascot,
  onClose,
  subtitle,
  title,
}: LessonScaffoldProps) {
  const tokens = useTheme();
  const { height } = useWindowDimensions();
  const foreground = dark ? tokens.color.surface : tokens.color.ink;
  const muted = dark ? '#A9B5C2' : tokens.color.textMuted;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: dark ? tokens.color.darkLesson : tokens.color.paper }}
      contentContainerStyle={[
        styles.content,
        { minHeight: height, paddingHorizontal: tokens.space[3], paddingVertical: tokens.space[3] },
      ]}
    >
      <ProgressHeader current={current} total={8} onClose={onClose} dark={dark} />
      <MotionEntrance style={styles.headingBlock}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            {eyebrow ? (
              <Text
                style={[tokens.typography.body, { color: dark ? '#8B98A8' : tokens.color.aloe }]}
              >
                {eyebrow}
              </Text>
            ) : null}
            <Text accessibilityRole="header" style={[tokens.typography.h1, { color: foreground }]}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[tokens.typography.body, { color: muted }]}>{subtitle}</Text>
            ) : null}
          </View>
          {mascot}
        </View>
      </MotionEntrance>
      <MotionEntrance delay={45} style={styles.body}>
        {children}
      </MotionEntrance>
    </ScrollView>
  );
}

export const lessonStyles = StyleSheet.create({
  actionRow: { flexDirection: 'row', gap: 12 },
  card: {
    borderCurve: 'continuous',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  choices: { gap: 12 },
  scene: { borderRadius: 26, height: 310, overflow: 'hidden', width: '100%' },
  stack: { gap: 18 },
});

const styles = StyleSheet.create({
  body: { flex: 1 },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    gap: 22,
    maxWidth: 820,
    paddingBottom: 48,
    width: '100%',
  },
  headingBlock: { gap: 12 },
  titleCopy: { flex: 1, gap: 8 },
  titleRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
});
