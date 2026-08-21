import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/ui/theme/tokens';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.color.paper }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: theme.color.paper },
          headerShown: false,
        }}
      />
    </GestureHandlerRootView>
  );
}
