import { ScrollView, Text, View } from 'react-native';
import { Mascot } from '@/ui/mascot/mascot';
import { theme } from '@/ui/theme/tokens';
export default function ProfileRoute() {
  return (
    <ScrollView
      contentContainerStyle={{ alignItems: 'center', gap: 16, padding: 24 }}
      style={{ backgroundColor: theme.color.paper }}
    >
      <Mascot accessibilityLabel="Thandi profile avatar" pose="profile-avatar" size={150} />
      <Text style={[theme.typography.h1, { color: theme.color.ink }]}>Neo</Text>
      <Text style={[theme.typography.body, { color: theme.color.textMuted }]}>
        isiZulu · Beginner
      </Text>
      <View
        style={{
          backgroundColor: theme.color.selectionSurface,
          borderRadius: 20,
          padding: 20,
          width: '100%',
        }}
      >
        <Text style={[theme.typography.h3, { color: theme.color.aloe }]}>4 day streak</Text>
        <Text style={[theme.typography.body, { color: theme.color.ink }]}>
          10 minute daily goal
        </Text>
      </View>
    </ScrollView>
  );
}
