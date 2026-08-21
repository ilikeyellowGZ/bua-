import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

import { theme } from '@/ui/theme/tokens';

const icon = (symbol: string, color: ColorValue) => (
  <Text style={{ color, fontSize: 22 }}>{symbol}</Text>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.color.paper },
        tabBarActiveTintColor: theme.color.aloe,
        tabBarInactiveTintColor: theme.color.textMuted,
        tabBarStyle: {
          backgroundColor: theme.color.paper,
          borderTopColor: theme.color.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="learn"
        options={{ title: 'Learn', tabBarIcon: ({ color }) => icon('◆', color) }}
      />
      <Tabs.Screen
        name="practice"
        options={{ title: 'Practice', tabBarIcon: ({ color }) => icon('☰', color) }}
      />
      <Tabs.Screen
        name="talk"
        options={{ title: 'Talk', tabBarIcon: ({ color }) => icon('•••', color) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => icon('○', color) }}
      />
    </Tabs>
  );
}
