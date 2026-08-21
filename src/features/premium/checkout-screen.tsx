import { Image } from 'expo-image';
import { useEffect, useId, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import {
  purchaseRepository as defaultPurchaseRepository,
  type PurchaseProduct,
  type PurchaseRepository,
} from '@/features/premium/purchase.repository';
import { BuaButton } from '@/ui/controls/bua-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { useTheme } from '@/ui/theme/theme-provider';

type CheckoutScreenProps = {
  onBack: () => void;
  onComplete: () => void;
  onPrivacy?: () => void;
  onTerms?: () => void;
  purchaseRepository?: PurchaseRepository;
};

export function CheckoutScreen({
  onBack,
  onComplete,
  onPrivacy,
  onTerms,
  purchaseRepository = defaultPurchaseRepository,
}: CheckoutScreenProps) {
  const tokens = useTheme();
  const { height } = useWindowDimensions();
  const [products, setProducts] = useState<readonly PurchaseProduct[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [state, setState] = useState<'loading' | 'ready' | 'purchasing' | 'success' | 'error'>(
    'loading',
  );
  const [restoreMessage, setRestoreMessage] = useState<string>();
  const requestId = useId();

  useEffect(() => {
    let active = true;
    purchaseRepository
      .getProducts()
      .then((items) => {
        if (!active) return;
        setProducts(items);
        setSelectedId(items.find((item) => item.interval === 'year')?.id ?? items[0]?.id);
        setState(items.length ? 'ready' : 'error');
      })
      .catch(() => active && setState('error'));
    return () => {
      active = false;
    };
  }, [purchaseRepository]);

  const selected = products.find((product) => product.id === selectedId);
  const purchase = async () => {
    if (!selected || state === 'purchasing') return;
    setState('purchasing');
    try {
      await purchaseRepository.purchase(selected.id, `checkout-${requestId}`);
      setState('success');
      onComplete();
    } catch {
      setState('error');
    }
  };

  const restore = async () => {
    try {
      const entitlements = await purchaseRepository.restore();
      setRestoreMessage(
        entitlements.some((item) => item.active) ? 'Premium restored' : 'No purchases to restore',
      );
    } catch {
      setRestoreMessage('Restore unavailable. Please try again.');
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={[styles.content, { minHeight: height }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back to Premium offer"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.back}
        >
          <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>‹</Text>
        </Pressable>
        <Text style={[tokens.typography.body, { color: tokens.color.aloe }]}>
          ♢ Secure checkout
        </Text>
      </View>
      <View style={styles.brand}>
        <Image
          accessibilityLabel="Thandi with the Bua Premium badge"
          contentFit="contain"
          source={require('@/assets/scenes/generated/premium-checkout-hero.png')}
          style={styles.checkoutHero}
        />
      </View>
      <Text
        accessibilityRole="header"
        style={[tokens.typography.h1, styles.center, { color: tokens.color.ink }]}
      >
        Choose your Bua Premium plan
      </Text>
      {state === 'loading' ? (
        <Text style={[tokens.typography.body, styles.center, { color: tokens.color.textMuted }]}>
          Loading verified storefront plans…
        </Text>
      ) : null}
      <View accessibilityRole="radiogroup" style={styles.plans}>
        {products.map((product) => {
          const checked = product.id === selectedId;
          return (
            <Pressable
              key={product.id}
              accessibilityLabel={`${product.title} ${product.localizedPrice}${product.monthlyEquivalent ? ` ${product.monthlyEquivalent}` : ''}`}
              accessibilityRole="radio"
              accessibilityState={{ checked }}
              onPress={() => setSelectedId(product.id)}
              style={[
                styles.plan,
                {
                  backgroundColor: checked ? tokens.color.selectionSurface : tokens.color.surface,
                  borderColor: checked ? tokens.color.aloe : tokens.color.border,
                },
              ]}
            >
              <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>
                {checked ? '✓ ' : '○ '}
                {product.title}
              </Text>
              <Text style={[tokens.typography.h2, { color: tokens.color.aloe }]}>
                {product.localizedPrice}
              </Text>
              {product.monthlyEquivalent ? (
                <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
                  {product.monthlyEquivalent}
                </Text>
              ) : null}
              {product.interval === 'year' ? (
                <Text
                  style={[
                    tokens.typography.caption,
                    styles.savings,
                    { backgroundColor: tokens.color.aloe, color: tokens.color.surface },
                  ]}
                >
                  BEST VALUE · Save 37%
                </Text>
              ) : (
                <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
                  Cancel anytime
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
      <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>Payment method</Text>
      <View
        style={[
          styles.method,
          { borderColor: tokens.color.aloe, backgroundColor: tokens.color.selectionSurface },
        ]}
      >
        <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>✓ Platform account</Text>
        <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
          Payment is completed securely in the App Store or Google Play purchase sheet. Bua never
          receives raw card details.
        </Text>
      </View>
      {selected ? (
        <View
          accessible
          accessibilityLabel={`${selected.trialDays}-day free trial. Due today R0.00. ${selected.renewalCopy}`}
          style={[styles.summary, { borderColor: '#EFCF8B' }]}
        >
          <View style={styles.summaryRow}>
            <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>
              {selected.trialDays}-day free trial
            </Text>
            <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>R0.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>Due today</Text>
            <Text style={[tokens.typography.h3, { color: tokens.color.aloe }]}>R0.00</Text>
          </View>
          <Text style={[tokens.typography.bodySmall, { color: tokens.color.ink }]}>
            {selected.renewalCopy}
          </Text>
        </View>
      ) : null}
      {state === 'success' ? (
        <FeedbackPanel
          tone="success"
          title="Premium activated"
          message="Your verified entitlement is ready."
        />
      ) : null}
      {state === 'error' ? (
        <FeedbackPanel
          tone="error"
          title="Checkout unavailable"
          message="Free learning is still available. Check your connection and try again."
        />
      ) : null}
      <BuaButton
        label={state === 'purchasing' ? 'Starting secure purchase…' : 'Start free trial'}
        disabled={!selected || state === 'loading' || state === 'error' || state === 'success'}
        loading={state === 'purchasing'}
        onPress={purchase}
        variant="ink"
      />
      <Text style={[tokens.typography.body, styles.center, { color: tokens.color.aloe }]}>
        ♙ You won’t be charged today.
      </Text>
      <View style={styles.links}>
        <Pressable accessibilityRole="button" onPress={restore}>
          <Text style={[tokens.typography.bodySmall, styles.link, { color: tokens.color.aloe }]}>
            Restore purchases
          </Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={onTerms}>
          <Text style={[tokens.typography.bodySmall, styles.link, { color: tokens.color.aloe }]}>
            Terms
          </Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={onPrivacy}>
          <Text style={[tokens.typography.bodySmall, styles.link, { color: tokens.color.aloe }]}>
            Privacy
          </Text>
        </Pressable>
      </View>
      {restoreMessage ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[tokens.typography.bodySmall, styles.center, { color: tokens.color.textMuted }]}
        >
          {restoreMessage}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: 'center', height: 48, justifyContent: 'center', width: 48 },
  brand: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  checkoutHero: { height: 155, width: '100%' },
  center: { textAlign: 'center' },
  content: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 720,
    padding: 24,
    paddingBottom: 50,
    width: '100%',
  },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  link: { textDecorationLine: 'underline' },
  links: { flexDirection: 'row', justifyContent: 'space-around' },
  method: { borderRadius: 20, borderWidth: 2, gap: 6, padding: 18 },
  plan: { borderRadius: 22, borderWidth: 2, gap: 5, minHeight: 150, padding: 18 },
  plans: { gap: 12 },
  savings: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginTop: 4,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  summary: { borderRadius: 20, borderWidth: 1, gap: 10, padding: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
