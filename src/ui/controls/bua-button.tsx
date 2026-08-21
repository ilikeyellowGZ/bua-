import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/ui/theme/theme-provider';

export type BuaButtonVariant = 'sun' | 'ink' | 'aloe' | 'outline';

type BuaButtonProps = {
  label: string;
  onPress: () => void;
  variant?: BuaButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  leading?: ReactNode;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

const targetHitSlop = { top: 4, right: 4, bottom: 4, left: 4 } as const;

export function BuaButton({
  label,
  onPress,
  variant = 'sun',
  disabled = false,
  loading = false,
  leading,
  testID,
  style,
}: BuaButtonProps) {
  const tokens = useTheme();
  const [pressed, setPressed] = useState(false);
  const unavailable = disabled || loading;
  const palette = {
    sun: { fill: tokens.color.sun, ink: tokens.color.ink, border: tokens.color.sunPressed },
    ink: { fill: tokens.color.ink, ink: tokens.color.surface, border: tokens.color.ink },
    aloe: { fill: tokens.color.aloe, ink: tokens.color.surface, border: tokens.color.aloePressed },
    outline: { fill: 'transparent', ink: tokens.color.ink, border: tokens.color.aloe },
  }[variant];

  return (
    <Pressable
      accessibilityLabel={loading ? `${label}, loading` : label}
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      hitSlop={targetHitSlop}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.target, style]}
      testID={testID}
    >
      <View
        testID={testID ? `${testID}-surface` : undefined}
        style={[
          styles.surface,
          {
            backgroundColor: unavailable ? tokens.color.disabledSurface : palette.fill,
            borderColor: unavailable ? tokens.color.border : palette.border,
            transform: [
              { translateY: pressed ? 2 : 0 },
              { scale: pressed ? tokens.motion.pressScale : 1 },
            ],
          },
        ]}
      >
        {loading ? <ActivityIndicator color={tokens.color.disabledText} /> : leading}
        <Text
          style={[
            tokens.typography.bodyLarge,
            { color: unavailable ? tokens.color.disabledText : palette.ink },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    minHeight: 52,
    minWidth: 44,
  },
  surface: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
