import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MotionEntrance } from '@/core/motion/motion-entrance';
import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

type LearnScreenProps = { onContinueLesson: () => void; onQuickReview: () => void };

export function LearnScreen({ onContinueLesson, onQuickReview }: LearnScreenProps) {
  const tokens = useTheme();
  const { height } = useWindowDimensions();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={[styles.content, { minHeight: height, padding: tokens.space[3] }]}
    >
      <View style={styles.greeting}>
        <View style={styles.greetingCopy}>
          <Mascot decorative pose="profile-avatar" size={62} />
          <Text
            accessibilityRole="header"
            style={[tokens.typography.h3, { color: tokens.color.ink }]}
          >
            Sawubona, Neo
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Choose language, isiZulu selected"
          accessibilityRole="button"
          style={[styles.language, { borderColor: tokens.color.aloe }]}
        >
          <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>isiZulu⌄</Text>
        </Pressable>
      </View>
      <View style={[styles.streak, { borderColor: tokens.color.sun }]}>
        <Text style={[tokens.typography.bodyLarge, { color: tokens.color.clay }]}>🔥</Text>
        <Text style={[tokens.typography.body, { color: tokens.color.aloe }]}>4 days</Text>
      </View>
      <MotionEntrance style={[styles.featured, { backgroundColor: '#FFF0D3' }]}>
        <View style={styles.featuredTop}>
          <View style={styles.featuredCopy}>
            <Text style={[tokens.typography.caption, styles.eyebrow, { color: tokens.color.clay }]}>
              TODAY’S LESSON
            </Text>
            <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>
              Introduce yourself
            </Text>
            <Text style={[tokens.typography.bodyLarge, { color: tokens.color.textMuted }]}>
              12 min · Beginner
            </Text>
          </View>
          <View style={styles.featuredMascot}>
            <Mascot decorative pose="lesson-book-wave" size={145} />
          </View>
        </View>
        <Text style={[tokens.typography.body, { color: tokens.color.aloe }]}>
          3 of 8 activities
        </Text>
        <View style={[styles.lessonTrack, { backgroundColor: '#F4DDB4' }]}>
          <View style={[styles.lessonFill, { backgroundColor: tokens.color.aloe }]} />
        </View>
        <BuaButton label="Continue lesson" onPress={onContinueLesson} variant="ink" />
      </MotionEntrance>
      <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>Your path</Text>
      <View style={styles.path}>
        {[
          { n: 1, title: 'Greetings', unit: 'Unit 1', state: '✓', active: true },
          { n: 2, title: 'Meeting people', unit: 'Unit 2', state: '›', active: true },
          { n: 3, title: 'Getting around', unit: 'Unit 3', state: '🔒', active: false },
        ].map((item) => (
          <View key={item.n} style={styles.pathRow}>
            <View
              style={[
                styles.number,
                { backgroundColor: item.active ? tokens.color.aloe : tokens.color.disabledSurface },
              ]}
            >
              <Text
                style={[
                  tokens.typography.bodyLarge,
                  { color: item.active ? tokens.color.surface : tokens.color.textMuted },
                ]}
              >
                {item.n}
              </Text>
            </View>
            <View
              style={[
                styles.pathCard,
                { backgroundColor: tokens.color.surface, opacity: item.active ? 1 : 0.65 },
              ]}
            >
              <View
                style={[
                  styles.unitArt,
                  { backgroundColor: item.n === 2 ? '#FFE3C1' : tokens.color.selectionSurface },
                ]}
              >
                <Text style={styles.unitSymbol}>
                  {item.n === 1 ? '👋' : item.n === 2 ? '••' : '⌖'}
                </Text>
              </View>
              <View style={styles.pathCopy}>
                <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>
                  {item.title}
                </Text>
                <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
                  {item.unit}
                </Text>
                {item.n === 2 ? (
                  <Text style={[tokens.typography.caption, { color: tokens.color.aloe }]}>
                    ● ● ● ○ ○ ○ ○
                  </Text>
                ) : null}
              </View>
              <Text
                style={[
                  tokens.typography.h3,
                  { color: item.active ? tokens.color.aloe : tokens.color.disabledText },
                ]}
              >
                {item.state}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Pressable
        accessibilityLabel="Quick review, 5 phrases due"
        accessibilityRole="button"
        onPress={onQuickReview}
        style={[styles.review, { backgroundColor: tokens.color.selectionSurface }]}
      >
        <Text style={styles.reviewArt}>♨</Text>
        <View style={styles.pathCopy}>
          <Text style={[tokens.typography.h3, { color: tokens.color.aloe }]}>Quick review</Text>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
            5 phrases due
          </Text>
        </View>
        <Text style={[tokens.typography.h2, { color: tokens.color.aloe }]}>›</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: 20, paddingBottom: 48 },
  eyebrow: { letterSpacing: 2 },
  featured: {
    borderCurve: 'continuous',
    borderRadius: 28,
    gap: 12,
    overflow: 'hidden',
    padding: 22,
  },
  featuredCopy: { gap: 8, width: '72%' },
  featuredMascot: { position: 'absolute', right: -10, top: -8 },
  featuredTop: { minHeight: 180 },
  greeting: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  greetingCopy: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  language: {
    borderRadius: 999,
    borderWidth: 2,
    minHeight: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  lessonFill: { borderRadius: 999, height: '100%', width: '38%' },
  lessonTrack: { borderRadius: 999, height: 10, overflow: 'hidden', width: '45%' },
  number: {
    alignItems: 'center',
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  path: { gap: 12 },
  pathCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 22,
    boxShadow: '0 6px 16px rgba(20,38,61,0.06)',
    flex: 1,
    flexDirection: 'row',
    gap: 14,
    minHeight: 108,
    padding: 14,
  },
  pathCopy: { flex: 1 },
  pathRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  review: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 16,
    minHeight: 116,
    padding: 18,
  },
  reviewArt: { color: '#176F68', fontSize: 52 },
  streak: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  unitArt: {
    alignItems: 'center',
    borderRadius: 18,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  unitSymbol: { fontSize: 30 },
});
