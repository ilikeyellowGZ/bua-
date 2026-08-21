import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { theme } from '@/ui/theme/tokens';

export default function TalkRoute() {
  const router = useRouter();
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ backgroundColor: theme.color.paper }}
    >
      <View style={styles.heading}>
        <View style={styles.copy}>
          <Text style={[theme.typography.h1, { color: theme.color.ink }]}>Talk</Text>
          <Text style={[theme.typography.body, { color: theme.color.textMuted }]}>
            Practice useful conversations privately before using them in the world.
          </Text>
        </View>
        <Mascot decorative pose="roleplay-companion" size={105} />
      </View>
      <View style={[styles.card, { backgroundColor: theme.color.selectionSurface }]}>
        <Text style={[theme.typography.h2, { color: theme.color.ink }]}>Meet a classmate</Text>
        <Text style={[theme.typography.body, { color: theme.color.textMuted }]}>
          A guided isiZulu role-play outside your first lecture.
        </Text>
        <BuaButton
          label="Start role-play"
          onPress={() => router.push('/lesson/lesson-introduce-yourself/role-play')}
        />
      </View>
      <View style={[styles.card, { backgroundColor: '#FFF0D5' }]}>
        <Text style={[theme.typography.h2, { color: theme.color.ink }]}>Sound focus</Text>
        <Text style={[theme.typography.body, { color: theme.color.textMuted }]}>
          Train your ear with short, focused word choices.
        </Text>
        <BuaButton
          label="Practice listening"
          variant="outline"
          onPress={() => router.push('/lesson/lesson-introduce-yourself/sound-focus')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, gap: 12, padding: 20 },
  content: { gap: 18, padding: 24, paddingBottom: 50 },
  copy: { flex: 1, gap: 6 },
  heading: { alignItems: 'center', flexDirection: 'row', gap: 12 },
});
