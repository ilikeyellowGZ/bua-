import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/ui/theme/theme-provider';

export function LegalScreen({ kind, onBack }: { kind: 'privacy' | 'terms'; onBack: () => void }) {
  const tokens = useTheme();
  const title = kind === 'privacy' ? 'Privacy' : 'Terms of use';
  const sections =
    kind === 'privacy'
      ? [
          [
            'Your learning data',
            'Bua stores account, onboarding, lesson progress, and entitlement data needed to deliver and sync your learning experience.',
          ],
          [
            'Voice privacy',
            'Raw practice audio is not retained after scoring unless you explicitly opt in. Demo practice does not upload audio.',
          ],
          [
            'Payments',
            'Native subscriptions are handled by the App Store or Google Play. Bua does not collect or store raw card details.',
          ],
          [
            'Your choices',
            'You can continue with free learning, request account deletion, and disable optional microphone access in system settings.',
          ],
        ]
      : [
          [
            'Free learning',
            'Core free learning remains available if a Premium purchase is cancelled or unavailable.',
          ],
          [
            'Subscriptions',
            'Storefront pricing, eligibility, renewal, cancellation, and refunds follow the terms shown by your platform purchase sheet.',
          ],
          [
            'Learning guidance',
            'Pronunciation feedback is educational guidance, not a clinical or absolute linguistic assessment.',
          ],
          [
            'Acceptable use',
            'Use Bua lawfully and respect other learners, educators, and community spaces.',
          ],
        ];
  return (
    <ScrollView
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={styles.content}
    >
      <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={onBack}>
        <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>‹</Text>
      </Pressable>
      <Text accessibilityRole="header" style={[tokens.typography.h1, { color: tokens.color.ink }]}>
        {title}
      </Text>
      <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
        Effective 21 August 2026 · Bua production draft
      </Text>
      {sections.map(([heading, body]) => (
        <View key={heading} style={styles.section}>
          <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>{heading}</Text>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>{body}</Text>
        </View>
      ))}
      <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
        Contact: privacy@bua.app
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 20, maxWidth: 720, padding: 24, width: '100%' },
  section: { gap: 6 },
});
