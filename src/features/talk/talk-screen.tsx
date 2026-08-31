import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

type TalkScreenProps = {
  onStartRolePlay: () => void;
  onSoundFocus: () => void;
};

export function TalkScreen({ onStartRolePlay, onSoundFocus }: TalkScreenProps) {
  const tokens = useTheme();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" style={[tokens.typography.h1, { color: tokens.color.ink }]}>
            Talk
          </Text>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
            Practice useful conversations privately before using them in the world.
          </Text>
        </View>
        <Mascot decorative pose="roleplay-companion" size={72} />
      </View>

      <Pressable
        accessibilityLabel="Meet a classmate, 5 minutes, guided conversation"
        accessibilityRole="button"
        onPress={onStartRolePlay}
        style={[styles.featured, { backgroundColor: tokens.color.selectionSurface }]}
      >
        <View style={styles.featuredCopy}>
          <Text style={[tokens.typography.caption, styles.eyebrow, { color: tokens.color.aloe }]}>
            FEATURED ROLE-PLAY
          </Text>
          <Text style={[tokens.typography.h1, { color: tokens.color.ink }]}>Meet a classmate</Text>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
            5 min · Guided conversation
          </Text>
          <View style={[styles.arrow, { backgroundColor: tokens.color.ink }]}>
            <Text style={[tokens.typography.h2, { color: tokens.color.surface }]}>→</Text>
          </View>
        </View>
        <Mascot decorative pose="roleplay-companion" size={140} />
      </Pressable>

      <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>Sound practice</Text>
      <Pressable
        accessibilityLabel="Sound focus, train your ear with short focused word choices"
        accessibilityRole="button"
        onPress={onSoundFocus}
        style={[styles.pack, { borderColor: tokens.color.border }]}
      >
        <View style={styles.packCopy}>
          <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>
            Sound focus
          </Text>
          <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
            Train your ear with short, focused word choices.
          </Text>
        </View>
        <Text style={[tokens.typography.h3, { color: tokens.color.aloe }]}>→</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  arrow: {
    alignItems: 'center',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    marginTop: 14,
    width: 56,
  },
  content: { gap: 20, padding: 20, paddingBottom: 48 },
  eyebrow: { letterSpacing: 2 },
  featured: {
    borderRadius: 28,
    flexDirection: 'row',
    minHeight: 280,
    overflow: 'hidden',
    padding: 22,
  },
  featuredCopy: { flex: 1, gap: 8 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  headerCopy: { flex: 1, gap: 6 },
  pack: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 88,
    padding: 18,
  },
  packCopy: { flex: 1, gap: 4 },
});
