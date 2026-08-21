import { ScrollView, Text } from 'react-native';
import { theme } from '@/ui/theme/tokens';
export default function TalkRoute() {
  return (
    <ScrollView
      contentContainerStyle={{ gap: 16, padding: 24 }}
      style={{ backgroundColor: theme.color.paper }}
    >
      <Text style={[theme.typography.h1, { color: theme.color.ink }]}>Talk</Text>
      <Text style={[theme.typography.body, { color: theme.color.textMuted }]}>
        Guided community conversations will appear here. Your lesson role-play is available now from
        Practice.
      </Text>
    </ScrollView>
  );
}
