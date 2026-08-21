import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { theme } from '@/ui/theme/tokens';

export type MotionPreference = 'system' | 'full' | 'reduced';

export type MotionContextValue = {
  reduceMotion: boolean;
  deterministic: boolean;
  screenTransitionMs: number;
  celebrationEnabled: boolean;
};

const MotionContext = createContext<MotionContextValue | null>(null);

type MotionProviderProps = PropsWithChildren<{
  preference?: MotionPreference;
  deterministic?: boolean;
}>;

export function MotionProvider({
  children,
  preference = 'system',
  deterministic = false,
}: MotionProviderProps) {
  const systemReduceMotion = useReducedMotion();
  const reduceMotion =
    deterministic ||
    preference === 'reduced' ||
    (preference === 'system' && Boolean(systemReduceMotion));

  const value = useMemo<MotionContextValue>(
    () => ({
      reduceMotion,
      deterministic,
      screenTransitionMs: reduceMotion ? theme.motion.instant : theme.motion.standard,
      celebrationEnabled: !reduceMotion && !deterministic,
    }),
    [deterministic, reduceMotion],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotion(): MotionContextValue {
  const value = useContext(MotionContext);
  if (!value) throw new Error('useMotion must be used inside MotionProvider.');
  return value;
}
