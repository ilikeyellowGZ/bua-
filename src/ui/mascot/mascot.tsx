import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export type MascotPose =
  | 'welcome-wave'
  | 'onboarding-peek'
  | 'lesson-book-wave'
  | 'story-companion'
  | 'feedback-mini'
  | 'sound-focus'
  | 'speaking-coach'
  | 'roleplay-companion'
  | 'celebration'
  | 'profile-avatar'
  | 'language-greeting'
  | 'routine-clock'
  | 'placement-thinking'
  | 'phrase-builder-cheer'
  | 'picture-match-point'
  | 'conversation-passenger'
  | 'dictation-listen'
  | 'pronunciation-coach'
  | 'premium-crown'
  | 'premium-checkout';

export type MascotProps = {
  pose: MascotPose;
  size: number;
  accessibilityLabel?: string;
  decorative?: boolean;
  motion?: 'none' | 'idle' | 'celebrate' | 'coach';
};

const sprites: Record<MascotPose, ImageSource> = {
  'welcome-wave': require('@/assets/mascot/generated/full-wave.png'),
  'onboarding-peek': require('@/assets/mascot/generated/face-calm.png'),
  'lesson-book-wave': require('@/assets/mascot/generated/full-wave.png'),
  'story-companion': require('@/assets/mascot/generated/full-neutral-book.png'),
  'feedback-mini': require('@/assets/mascot/generated/face-happy-open.png'),
  'sound-focus': require('@/assets/mascot/generated/face-headphones.png'),
  'speaking-coach': require('@/assets/mascot/generated/full-thumbs-up.png'),
  'roleplay-companion': require('@/assets/mascot/generated/full-neutral-book.png'),
  celebration: require('@/assets/mascot/generated/full-celebrate.png'),
  'profile-avatar': require('@/assets/mascot/generated/face-calm.png'),
  'language-greeting': require('@/assets/mascot/generated/full-wave.png'),
  'routine-clock': require('@/assets/mascot/generated/full-point-right.png'),
  'placement-thinking': require('@/assets/mascot/generated/full-thinking.png'),
  'phrase-builder-cheer': require('@/assets/mascot/generated/face-celebrate.png'),
  'picture-match-point': require('@/assets/mascot/generated/full-point-right.png'),
  'conversation-passenger': require('@/assets/mascot/generated/face-calm.png'),
  'dictation-listen': require('@/assets/mascot/generated/face-headphones.png'),
  'pronunciation-coach': require('@/assets/mascot/generated/full-microphone.png'),
  'premium-crown': require('@/assets/mascot/generated/face-crown.png'),
  'premium-checkout': require('@/assets/mascot/generated/face-crown.png'),
};

export function Mascot({
  pose,
  size,
  accessibilityLabel,
  decorative = false,
  motion = 'none',
}: MascotProps) {
  const travel = motion === 'coach' ? -2 : motion === 'celebrate' ? -4 : 0;
  const scale = motion === 'idle' ? 0.99 : 1;
  const accessibilityProps = decorative
    ? { accessible: false as const }
    : {
        accessible: true as const,
        accessibilityRole: 'image' as const,
        ...(accessibilityLabel ? { accessibilityLabel } : {}),
      };

  return (
    <View
      style={{
        height: size,
        width: size,
        transform: [{ translateY: travel }, { scale }],
      }}
    >
      <Image
        {...accessibilityProps}
        contentFit="contain"
        source={sprites[pose]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
