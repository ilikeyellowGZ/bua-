import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MotionEntrance } from '@/core/motion/motion-entrance';
import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

export type WelcomeScreenProps = {
  onGetStarted: () => void;
  onLogin: () => void;
  onInstitution: () => void;
  loading?: boolean;
};

export function WelcomeScreen({
  onGetStarted,
  onLogin,
  onInstitution,
  loading = false,
}: WelcomeScreenProps) {
  const tokens = useTheme();
  const { height, width } = useWindowDimensions();
  const mascotSize = Math.max(240, Math.min(width * 0.8, height * 0.42, 360));

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={[
        styles.content,
        {
          minHeight: height,
          paddingHorizontal: tokens.space[3],
          paddingVertical: tokens.space[5],
        },
      ]}
    >
      <MotionEntrance style={styles.brand}>
        <Text accessibilityRole="header" style={[styles.wordmark, { color: tokens.color.ink }]}>
          Bua<Text style={{ color: tokens.color.clay }}>’</Text>
        </Text>
        <Text style={[tokens.typography.bodyLarge, { color: tokens.color.aloe }]}>
          Speak. Connect. Belong.
        </Text>
      </MotionEntrance>

      <View style={styles.mascotWrap}>
        <Mascot
          accessibilityLabel="Thandi waves with her book"
          motion="coach"
          pose="welcome-wave"
          size={mascotSize}
        />
      </View>

      <View style={[styles.actions, { gap: tokens.space[2] }]}>
        <BuaButton label="Get started" loading={loading} onPress={onGetStarted} />
        <BuaButton label="Log in" onPress={onLogin} variant="outline" />
        <Pressable
          accessibilityRole="button"
          onPress={onInstitution}
          style={styles.institutionLink}
        >
          <Text style={[tokens.typography.bodySmall, styles.link, { color: tokens.color.aloe }]}>
            Join with institution code
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 'auto',
    width: '100%',
  },
  brand: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    flexGrow: 1,
  },
  institutionLink: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  link: {
    textDecorationLine: 'underline',
  },
  mascotWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 320,
  },
  wordmark: {
    fontSize: 88,
    fontWeight: '800',
    letterSpacing: -5,
    lineHeight: 98,
  },
});
