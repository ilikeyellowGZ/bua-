import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MotionEntrance } from '@/core/motion/motion-entrance';
import { BuaButton } from '@/ui/controls/bua-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { ChoiceCard } from '@/ui/lesson/choice-card';
import { ProgressHeader } from '@/ui/lesson/progress-header';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

export default function ComponentShowcaseRoute() {
  const tokens = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={[
        styles.content,
        { backgroundColor: tokens.color.paper, padding: tokens.space[3] },
      ]}
    >
      <ProgressHeader current={3} total={8} closeLabel="Close preview" onClose={() => {}} />
      <MotionEntrance style={styles.hero}>
        <Mascot
          accessibilityLabel="Thandi waves with her isiZulu book"
          motion="coach"
          pose="welcome-wave"
          size={180}
        />
        <View style={styles.heroCopy}>
          <Text style={[tokens.typography.caption, { color: tokens.color.aloe }]}>YOUR GOAL</Text>
          <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>Start speaking</Text>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
            One warm, useful conversation at a time.
          </Text>
        </View>
      </MotionEntrance>
      <ChoiceCard
        description="Useful phrases for daily life"
        label="Everyday conversations"
        onPress={() => {}}
        selected
      />
      <FeedbackPanel
        message="Mina nginguLerato means I’m Lerato."
        title="That’s right"
        tone="success"
      />
      <BuaButton label="Continue" onPress={() => {}} />
      <BuaButton label="Try again" onPress={() => {}} variant="outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    minHeight: '100%',
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 210,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
});
