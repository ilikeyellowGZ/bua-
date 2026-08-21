import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/ui/theme/theme-provider';

type FeedbackTone = 'success' | 'coaching' | 'error';

type FeedbackPanelProps = {
  tone: FeedbackTone;
  title: string;
  message: string;
};

export function FeedbackPanel({ tone, title, message }: FeedbackPanelProps) {
  const tokens = useTheme();
  const toneColor = {
    success: tokens.color.aloe,
    coaching: tokens.color.sunPressed,
    error: tokens.color.danger,
  }[tone];

  return (
    <View
      accessible
      accessibilityLabel={`${title} ${message}`}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={[
        styles.panel,
        { backgroundColor: tokens.color.feedbackSurface, borderColor: toneColor },
      ]}
    >
      <View style={[styles.marker, { backgroundColor: toneColor }]} />
      <View style={styles.copy}>
        <Text style={[tokens.typography.h3, { color: toneColor }]}>{title}</Text>
        <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    padding: 20,
  },
  marker: {
    borderRadius: 999,
    width: 6,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
});
