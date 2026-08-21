import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ReduceMotion, ZoomIn } from 'react-native-reanimated';

import { useMotion } from '@/core/motion/motion-provider';
import { useTheme } from '@/ui/theme/theme-provider';

type ChoiceCardProps = {
  label: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function ChoiceCard({
  label,
  description,
  selected = false,
  disabled = false,
  onPress,
}: ChoiceCardProps) {
  const tokens = useTheme();
  const { reduceMotion } = useMotion();
  const [pressed, setPressed] = useState(false);
  const accessibleName = [label, description, selected ? 'Selected' : undefined]
    .filter(Boolean)
    .join(' ');
  const selectionAnimationProps = reduceMotion || Platform.OS === 'web'
    ? {}
    : {
        entering: ZoomIn.duration(tokens.motion.standard).reduceMotion(ReduceMotion.System),
      };

  return (
    <Pressable
      accessibilityLabel={accessibleName}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.card,
        {
          backgroundColor: selected ? tokens.color.selectionSurface : tokens.color.surface,
          borderColor: selected ? tokens.color.aloe : tokens.color.border,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? tokens.motion.pressScale : 1 }],
        },
      ]}
    >
      <View style={styles.copy}>
        <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>{label}</Text>
        {description ? (
          <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {selected ? (
        <Animated.View
          {...selectionAnimationProps}
          style={[styles.selection, { backgroundColor: tokens.color.aloe }]}
        >
          <Text style={[tokens.typography.caption, { color: tokens.color.surface }]}>✓</Text>
          <Text style={[tokens.typography.caption, { color: tokens.color.surface }]}>Selected</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    minHeight: 88,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  selection: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
});
