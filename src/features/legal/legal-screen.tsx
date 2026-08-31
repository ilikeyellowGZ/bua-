import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/ui/theme/theme-provider';

const EFFECTIVE_DATE = '31 August 2026';

const privacySections: readonly (readonly [string, string])[] = [
  [
    'Overview',
    'This policy explains what Bua ("we", "us") collects when you use the Bua isiZulu learning app, why we collect it, and the choices you have. Bua is operated for learners worldwide; if a term used by your local privacy law (such as GDPR in the EU/UK or CCPA/CPRA in California) differs from wording here, your local law’s rights still apply to you in full.',
  ],
  [
    'Information we collect',
    'Account information (email or the identifier from Google/Apple sign-in, or a device-generated guest ID if you continue without an account); learning data (lesson progress, XP, streaks, quiz attempts, spaced-repetition schedule); onboarding preferences (goal, daily target, reminder time); voice practice audio, only when you tap the microphone to attempt a speaking or pronunciation activity; subscription and entitlement status; and basic device/usage diagnostics (crash reports, error logs, app version, coarse device type) used to keep the app working.',
  ],
  [
    'How we use your information',
    'To deliver and sync lessons across your devices; to calculate XP, streaks, and spaced-repetition scheduling; to score pronunciation practice attempts; to process subscription purchases through the App Store or Google Play; to send the daily reminder notifications you opt into; to diagnose and fix crashes and errors; and to maintain the security and integrity of the service, including detecting abuse.',
  ],
  [
    'Voice and audio data',
    'Audio you record for a speaking or pronunciation exercise is uploaded to our storage (hosted on Supabase) solely to generate your pronunciation feedback. We do not use your voice recordings to train shared or third-party AI models. You can request deletion of your stored audio at any time from Profile → Delete my account, or by contacting us at the address below; audio tied to a deleted account is removed within 30 days. Demo/offline practice never uploads audio anywhere.',
  ],
  [
    'Where your data lives',
    'Account and learning data is stored with our database provider, Supabase. A copy of your recent lesson progress is also cached locally on your device (in an on-device SQLite database) so the app keeps working offline; that local copy syncs back to your account when you’re online.',
  ],
  [
    'Third-party services we use',
    'Google and Apple, if you choose to sign in with them; Supabase, for our database, authentication, and file storage; Apple App Store and Google Play, who process subscription payments directly — Bua never sees or stores your card details; and an error-monitoring service, to alert us automatically when something breaks. Each of these providers processes data under its own privacy terms in addition to this policy.',
  ],
  [
    'Administrator access',
    'A small number of authorized Bua administrators can view aggregate, anonymized operational metrics (such as total active learners, error rates, and sync health) to keep the service running. Administrators cannot browse individual learners’ lesson content, progress, or voice recordings through this dashboard.',
  ],
  [
    'Children’s privacy',
    'Bua is intended for learners aged 13 and older (or the minimum age of digital consent in your country, if higher). If you believe a child has provided us with personal information without appropriate consent, contact us and we will delete it promptly.',
  ],
  [
    'Your rights and choices',
    'You can request a copy of your data, correct inaccurate data, or request deletion of your account and associated data at any time from Profile → Delete my account. Deletion requests are honored within 30 days and can be cancelled any time before then from the same screen. You can also disable microphone access at any time in your device’s system settings, and disable reminder notifications in Profile or your device settings.',
  ],
  [
    'Data retention',
    'We keep your account and learning data for as long as your account is active, so your progress stays available across devices. Diagnostic error logs are retained for a limited period (typically 90 days) and then deleted automatically.',
  ],
  [
    'Security',
    'Data in transit between the app and our servers is encrypted. Access to production data is restricted to authorized personnel and enforced by database-level access policies, not just application code.',
  ],
  [
    'Changes to this policy',
    'If we make material changes to this policy, we’ll update the effective date below and, where required by law, notify you in-app before the change takes effect.',
  ],
  [
    'Contact us',
    'Questions or requests about your data can be sent to privacy@bua.app.',
  ],
];

const termsSections: readonly (readonly [string, string])[] = [
  [
    'Acceptance of these terms',
    'By creating an account or using Bua, you agree to these Terms of Use and to our Privacy policy. If you don’t agree, please don’t use the app.',
  ],
  [
    'Who can use Bua',
    'You must be at least 13 years old (or the minimum age of digital consent in your country, if higher) to create a Bua account. If local law requires parental consent for your age, you confirm you have obtained it.',
  ],
  [
    'Your account',
    'You can use Bua as a guest, or sign in with Google, Apple, email, or an institution code. You’re responsible for keeping your sign-in credentials secure and for activity that happens under your account.',
  ],
  [
    'Free learning',
    'Core lessons remain available for free. Bua Premium is optional and adds extra content and features; it is never required to keep using the free lessons you’ve already unlocked.',
  ],
  [
    'Subscriptions and payments',
    'Bua Premium subscriptions are billed and managed entirely through the Apple App Store or Google Play. Pricing, free-trial eligibility, renewal, cancellation, and refunds are governed by the terms shown in your platform’s purchase sheet and account settings — not by Bua directly. Cancel any time through your App Store or Google Play account settings.',
  ],
  [
    'Pronunciation and AI-assisted feedback',
    'Pronunciation and speaking feedback in Bua is automated educational guidance to support your practice. It is not a clinical, medical, or legally authoritative assessment of your speech or language ability, and should not be relied on as one.',
  ],
  [
    'Acceptable use',
    'Use Bua lawfully, and don’t attempt to disrupt the service, reverse-engineer the app beyond what’s permitted by law, harvest other users’ data, or use the role-play and practice features to harass or abuse others.',
  ],
  [
    'Your content',
    'Your voice recordings and written answers remain yours. By submitting them for scoring, you grant Bua a limited license to process them solely to provide the feature you used (for example, generating pronunciation feedback).',
  ],
  [
    'Intellectual property',
    'The Bua name, the Thandi character, lesson content, and app design are owned by Bua or its licensors. You may not copy, redistribute, or create derivative apps from them without permission.',
  ],
  [
    'Third-party services',
    'Bua relies on third-party providers (including Supabase for data storage, Google/Apple for sign-in, and the Apple App Store/Google Play for billing). Your use of those providers through Bua is also subject to their own terms.',
  ],
  [
    'Disclaimer of warranties',
    'Bua is provided "as is." We work to keep it accurate and available, but we don’t guarantee the app will be uninterrupted, error-free, or perfectly accurate, including in automated pronunciation feedback.',
  ],
  [
    'Limitation of liability',
    'To the maximum extent permitted by law, Bua is not liable for indirect, incidental, or consequential damages arising from your use of the app. Nothing in these terms limits liability where the law does not allow it to be limited.',
  ],
  [
    'Suspension and termination',
    'You can stop using Bua and delete your account at any time from Profile → Delete my account. We may suspend or terminate accounts that violate these terms, including the acceptable-use section above.',
  ],
  [
    'Changes to these terms',
    'We may update these terms as the app evolves. If we make a material change, we’ll update the effective date below and, where required by law, notify you in-app before the change takes effect.',
  ],
  [
    'Governing law',
    'These terms are governed by the laws of the jurisdiction in which Bua is legally established, without regard to conflict-of-law rules, except where local consumer-protection law gives you additional rights that cannot be waived.',
  ],
  [
    'Contact us',
    'Questions about these terms can be sent to legal@bua.app.',
  ],
];

export function LegalScreen({ kind, onBack }: { kind: 'privacy' | 'terms'; onBack: () => void }) {
  const tokens = useTheme();
  const title = kind === 'privacy' ? 'Privacy' : 'Terms of use';
  const sections = kind === 'privacy' ? privacySections : termsSections;
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
        Effective {EFFECTIVE_DATE}
      </Text>
      <Text style={[tokens.typography.bodySmall, styles.legalNotice, { color: tokens.color.textMuted }]}>
        This describes what Bua actually does today. It is not a substitute for advice from a
        qualified lawyer in your jurisdiction before public launch.
      </Text>
      {sections.map(([heading, body]) => (
        <View key={heading} style={styles.section}>
          <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>{heading}</Text>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>{body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: 'center', gap: 20, maxWidth: 720, padding: 24, width: '100%' },
  legalNotice: { fontStyle: 'italic' },
  section: { gap: 6 },
});
