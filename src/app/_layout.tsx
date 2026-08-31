import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';

import { MotionProvider } from '@/core/motion/motion-provider';
import { getSyncOrchestrator } from '@/features/sync/default-sync-orchestrator';
import { ThemeProvider } from '@/ui/theme/theme-provider';
import { theme } from '@/ui/theme/tokens';

export default function RootLayout() {
  useEffect(() => {
    if (process.env.EXPO_PUBLIC_DEMO_MODE === 'false') {
      let stop: (() => void) | undefined;
      getSyncOrchestrator().then((orchestrator) => {
        stop = orchestrator.start();
      });
      return () => stop?.();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.color.paper }}>
      <ThemeProvider>
        <MotionProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              animation: 'fade',
              contentStyle: { backgroundColor: theme.color.paper },
              headerShown: false,
            }}
          />
        </MotionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
