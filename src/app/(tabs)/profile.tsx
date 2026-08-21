import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { theme } from '@/ui/theme/tokens';

export default function ProfileRoute() {
  const router = useRouter();
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ backgroundColor: theme.color.paper }}
    >
      <Mascot accessibilityLabel="Thandi profile avatar" pose="profile-avatar" size={150} />
      <Text style={[theme.typography.h1, { color: theme.color.ink }]}>Neo</Text>
      <Text style={[theme.typography.body, { color: theme.color.textMuted }]}>
        isiZulu · Beginner
      </Text>
      <View style={[styles.card, { backgroundColor: theme.color.selectionSurface }]}>
        <Text style={[theme.typography.h3, { color: theme.color.aloe }]}>4 day streak</Text>
        <Text style={[theme.typography.body, { color: theme.color.ink }]}>
          10 minute daily goal
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#FFF0D5' }]}>
        <Text style={[theme.typography.h3, { color: theme.color.ink }]}>Learn without limits</Text>
        <Text style={[theme.typography.body, { color: theme.color.textMuted }]}>
          See verified storefront plans, offline lessons, and speaking practice.
        </Text>
        <BuaButton label="Explore Bua Premium" onPress={() => router.push('/offer')} />
      </View>
      <View style={styles.links}>
        <BuaButton
          label="Privacy"
          variant="outline"
          onPress={() => router.push('/legal/privacy')}
          style={styles.link}
        />
        <BuaButton
          label="Terms"
          variant="outline"
          onPress={() => router.push('/legal/terms')}
          style={styles.link}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, gap: 10, padding: 20, width: '100%' },
  content: { alignItems: 'center', gap: 16, padding: 24, paddingBottom: 50 },
  link: { flex: 1 },
  links: { flexDirection: 'row', gap: 12, width: '100%' },
});
