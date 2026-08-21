import { ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { ConfigurationError, getPublicEnv } from '@/core/config/env';
import { theme } from '@/ui/theme/tokens';

type BootStatus =
  { state: 'ready'; detail: string } | { state: 'configuration-required'; detail: string };

function readBootStatus(): BootStatus {
  try {
    const environment = getPublicEnv();
    return {
      state: 'ready',
      detail:
        environment.EXPO_PUBLIC_DEMO_MODE === 'true'
          ? 'Deterministic demo mode is ready.'
          : 'Secure Supabase configuration is ready.',
    };
  } catch (error) {
    return {
      state: 'configuration-required',
      detail:
        error instanceof ConfigurationError
          ? error.message
          : 'Bua configuration is unavailable. Check the public environment variables.',
    };
  }
}

const bootStatus = readBootStatus();

export default function IndexRoute() {
  const { height } = useWindowDimensions();
  const isReady = bootStatus.state === 'ready';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.color.paper }}
      contentContainerStyle={{
        flexGrow: 1,
        minHeight: height,
        justifyContent: 'center',
        gap: theme.space[6],
        paddingHorizontal: theme.space[3],
        paddingVertical: theme.space[8],
      }}
    >
      <View accessible accessibilityRole="header">
        <Text
          selectable
          style={{
            ...theme.typography.display,
            color: theme.color.ink,
            letterSpacing: -2,
          }}
        >
          Bua
          <Text style={{ color: theme.color.clay }}>’</Text>
        </Text>
        <Text selectable style={{ ...theme.typography.bodyLarge, color: theme.color.aloe }}>
          Speak. Connect. Belong.
        </Text>
      </View>

      <View
        accessible
        accessibilityLiveRegion={isReady ? 'none' : 'polite'}
        style={{
          gap: theme.space[1],
          padding: theme.space[3],
          borderWidth: 1,
          borderColor: isReady ? theme.color.aloe : theme.color.clay,
          borderRadius: theme.radius.medium,
          borderCurve: 'continuous',
          backgroundColor: theme.color.surface,
          boxShadow: theme.depth.card,
        }}
      >
        <Text selectable style={{ ...theme.typography.h3, color: theme.color.ink }}>
          {isReady ? 'Foundation ready' : 'Configuration required'}
        </Text>
        <Text selectable style={{ ...theme.typography.body, color: theme.color.textMuted }}>
          {bootStatus.detail}
        </Text>
      </View>
    </ScrollView>
  );
}
