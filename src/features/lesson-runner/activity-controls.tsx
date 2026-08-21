import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/ui/theme/theme-provider';

type AudioControlProps = {
  label: string;
  compact?: boolean;
  dark?: boolean;
  onPlayed?: () => void;
};

export function AudioControl({
  label,
  compact = false,
  dark = false,
  onPlayed,
}: AudioControlProps) {
  const tokens = useTheme();
  const [played, setPlayed] = useState(false);
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: played }}
      onPress={() => {
        setPlayed(true);
        onPlayed?.();
      }}
      style={[
        styles.audio,
        compact ? styles.compact : styles.large,
        {
          backgroundColor: dark ? 'transparent' : tokens.color.surface,
          borderColor: played ? tokens.color.aloe : dark ? '#778495' : tokens.color.border,
        },
      ]}
    >
      <Text
        style={[
          compact ? tokens.typography.body : tokens.typography.h2,
          { color: tokens.color.aloe },
        ]}
      >
        ◖))
      </Text>
    </Pressable>
  );
}

export function Waveform({ dark = false }: { dark?: boolean }) {
  const tokens = useTheme();
  return (
    <View accessible={false} style={styles.waveform}>
      {[18, 34, 52, 30, 44, 62, 38, 50, 28].map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={{
            backgroundColor: dark ? '#32B9AC' : tokens.color.aloe,
            borderRadius: 999,
            height,
            width: 5,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  audio: { alignItems: 'center', borderRadius: 999, borderWidth: 2, justifyContent: 'center' },
  compact: { height: 52, width: 52 },
  large: { height: 90, width: 90 },
  waveform: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 68,
  },
});
