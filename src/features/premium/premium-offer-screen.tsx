import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MotionEntrance } from '@/core/motion/motion-entrance';
import { BuaButton } from '@/ui/controls/bua-button';
import { useTheme } from '@/ui/theme/theme-provider';

type PremiumOfferScreenProps = { onCheckout: () => void; onDismiss: () => void };

const benefits = [
  'Unlimited speaking practice',
  'Offline lessons and downloads',
  'Detailed pronunciation coaching',
  'No ads, just learning',
] as const;

export function PremiumOfferScreen({ onCheckout, onDismiss }: PremiumOfferScreenProps) {
  const tokens = useTheme();
  const { height } = useWindowDimensions();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={[styles.content, { minHeight: height }]}
    >
      <Pressable
        accessibilityLabel="Close Premium offer"
        accessibilityRole="button"
        onPress={onDismiss}
        style={styles.close}
      >
        <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>×</Text>
      </Pressable>
      <MotionEntrance style={styles.hero}>
        <Image
          accessibilityLabel="Crowned Thandi presents Bua Premium"
          contentFit="contain"
          source={require('@/assets/scenes/generated/premium-offer-hero.png')}
          style={styles.premiumHero}
        />
        <Text style={[styles.logo, { color: tokens.color.ink }]}>Bua’</Text>
        <Text
          accessibilityRole="header"
          style={[tokens.typography.h1, styles.center, { color: tokens.color.ink }]}
        >
          Speak without limits
        </Text>
        <Text style={[tokens.typography.bodyLarge, styles.center, { color: tokens.color.aloe }]}>
          Unlock every lesson and keep learning anywhere.
        </Text>
      </MotionEntrance>
      <MotionEntrance delay={45} style={[styles.premiumCard, { backgroundColor: '#F7B43B' }]}>
        <Text style={[tokens.typography.h2, { color: tokens.color.surface }]}>✦ Bua Premium</Text>
        <View style={[styles.benefits, { backgroundColor: '#FFF5DE' }]}>
          {benefits.map((benefit, index) => (
            <View
              key={benefit}
              style={[
                styles.benefit,
                index < benefits.length - 1 && {
                  borderBottomColor: '#EACB91',
                  borderBottomWidth: 1,
                },
              ]}
            >
              <Text style={[tokens.typography.body, { color: tokens.color.aloe }]}>✓</Text>
              <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>{benefit}</Text>
            </View>
          ))}
        </View>
      </MotionEntrance>
      <View
        accessible
        accessibilityLabel="Free has a daily lesson limit. Premium has unlimited access."
        style={[styles.comparison, { borderColor: tokens.color.border }]}
      >
        <View style={styles.compareColumn}>
          <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>Free</Text>
          <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
            Daily lesson limit
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: tokens.color.border }]} />
        <View style={styles.compareColumn}>
          <Text style={[tokens.typography.body, { color: tokens.color.clay }]}>Premium</Text>
          <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
            Unlimited access
          </Text>
        </View>
      </View>
      <View style={[styles.testimonial, { backgroundColor: '#FFF0D5' }]}>
        <Text style={[tokens.typography.body, { color: tokens.color.sunPressed }]}>★★★★★</Text>
        <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>
          “I finally speak with my family with confidence.” — Lindiwe
        </Text>
      </View>
      <Text style={[tokens.typography.body, styles.center, { color: tokens.color.ink }]}>
        From <Text style={{ color: tokens.color.clay, fontWeight: '700' }}>R49.99/month</Text> with
        annual plan
      </Text>
      <BuaButton label="Try 7 days free" onPress={onCheckout} />
      <Pressable accessibilityRole="button" onPress={onDismiss}>
        <Text style={[tokens.typography.body, styles.link, { color: tokens.color.aloe }]}>
          Continue with Free
        </Text>
      </Pressable>
      <Text style={[tokens.typography.bodySmall, styles.center, { color: tokens.color.textMuted }]}>
        Cancel anytime before your trial ends. Display pricing is a demo fixture until verified
        storefront products load.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  benefit: { alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 14 },
  benefits: { borderRadius: 20, paddingHorizontal: 18 },
  center: { textAlign: 'center' },
  close: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  compareColumn: { alignItems: 'center', flex: 1, gap: 2 },
  comparison: { borderRadius: 18, borderWidth: 1, flexDirection: 'row', padding: 14 },
  content: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 720,
    padding: 24,
    paddingBottom: 50,
    width: '100%',
  },
  divider: { width: 1 },
  hero: { alignItems: 'center', gap: 8 },
  link: { textAlign: 'center', textDecorationLine: 'underline' },
  logo: { fontSize: 72, fontWeight: '900', lineHeight: 76 },
  premiumCard: { borderRadius: 26, gap: 12, padding: 18 },
  premiumHero: { height: 245, width: '100%' },
  testimonial: { borderRadius: 20, gap: 6, padding: 18 },
});
