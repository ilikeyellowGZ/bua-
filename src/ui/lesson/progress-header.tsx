import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/ui/controls/icon-button';
import { useTheme } from '@/ui/theme/theme-provider';

type ProgressHeaderProps = {
  current: number;
  total: number;
  onClose: () => void;
  closeLabel?: string;
  dark?: boolean;
};

export function ProgressHeader({
  current,
  total,
  onClose,
  closeLabel = 'Close',
  dark = false,
}: ProgressHeaderProps) {
  const tokens = useTheme();
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(0, current), safeTotal);
  const foreground = dark ? tokens.color.surface : tokens.color.ink;

  return (
    <View style={styles.header}>
      <IconButton label={closeLabel} onPress={onClose}>
        <Text style={[tokens.typography.h2, { color: foreground, lineHeight: 40 }]}>×</Text>
      </IconButton>
      <View
        accessible
        accessibilityLabel="Lesson progress"
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: safeTotal,
          now: safeCurrent,
          text: `${safeCurrent} of ${safeTotal}`,
        }}
        style={styles.progress}
      >
        <View style={styles.segments}>
          {Array.from({ length: safeTotal }, (_, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    index < safeCurrent
                      ? tokens.color.aloe
                      : dark
                        ? tokens.color.darkLessonSurface
                        : tokens.color.disabledSurface,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[tokens.typography.caption, { color: foreground }]}>
          {safeCurrent} of {safeTotal}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  progress: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  segment: {
    borderRadius: 999,
    flex: 1,
    height: 8,
  },
});
