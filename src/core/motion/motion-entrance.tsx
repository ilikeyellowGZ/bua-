import { type PropsWithChildren } from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';

import { useMotion } from '@/core/motion/motion-provider';

type MotionEntranceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  delay?: number;
}>;

export function MotionEntrance({ children, style, delay = 0 }: MotionEntranceProps) {
  const { reduceMotion, screenTransitionMs } = useMotion();
  const animationProps =
    reduceMotion || Platform.OS === 'web'
      ? {}
      : {
          entering: FadeInUp.duration(screenTransitionMs)
            .delay(delay)
            .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] })
            .reduceMotion(ReduceMotion.System),
        };

  return (
    <Animated.View {...animationProps} style={style}>
      {children}
    </Animated.View>
  );
}
