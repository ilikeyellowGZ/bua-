import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/ui/theme/theme-provider';

type IconButtonProps = PropsWithChildren<{
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function IconButton({ children, label, onPress, disabled = false, style }: IconButtonProps) {
  const tokens = useTheme();
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.target,
        {
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? tokens.motion.pressScale : 1 }],
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
});
