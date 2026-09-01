import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MotionEntrance } from '@/core/motion/motion-entrance';
import type { PathItem } from '@/features/learning-path/unit-progress';
import { BuaButton } from '@/ui/controls/bua-button';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';

const UNIT_SYMBOLS: Record<string, string> = {
  'unit-greetings': '👋',
  'unit-meeting-people': '••',
  'unit-getting-around': '⌖',
  'unit-numbers': '#',
  'unit-family': '♥',
  'unit-food': '🍞',
  'unit-routine': '◷',
  'unit-weather': '☀',
  'unit-shopping': '🛍',
  'unit-campus': '🎓',
  'unit-transport': '🚌',
  'unit-work': '💼',
  'unit-health': '⚕',
};

const DEFAULT_PATH: PathItem[] = [
  {
    unitId: 'unit-greetings',
    title: 'Greetings',
    unitLabel: 'Unit 1',
    state: 'complete',
    completedLessons: 1,
    totalLessons: 1,
  },
  {
    unitId: 'unit-meeting-people',
    title: 'Meeting people',
    unitLabel: 'Unit 2',
    state: 'active',
    completedLessons: 0,
    totalLessons: 1,
  },
  {
    unitId: 'unit-getting-around',
    title: 'Getting around',
    unitLabel: 'Unit 3',
    state: 'locked',
    completedLessons: 0,
    totalLessons: 1,
  },
];

type LearnScreenProps = {
  onContinueLesson: () => void;
  onQuickReview: () => void;
  onSelectUnit?: (unitId: string) => void;
  path?: PathItem[] | undefined;
};

export function LearnScreen({
  onContinueLesson,
  onQuickReview,
  onSelectUnit,
  path = DEFAULT_PATH,
}: LearnScreenProps) {
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
        {path.map((item, index) => {
          const active = item.state !== 'locked';
          const stateSymbol = item.state === 'complete' ? '✓' : item.state === 'active' ? '›' : '🔒';
          return (
            <View key={item.unitId} style={styles.pathRow}>
              <View
                style={[
                  styles.number,
                  { backgroundColor: active ? tokens.color.aloe : tokens.color.disabledSurface },
                ]}
              >
                <Text
                  style={[
                    tokens.typography.bodyLarge,
                    { color: active ? tokens.color.surface : tokens.color.textMuted },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`${item.title}, ${item.unitLabel}`}
                accessibilityRole="button"
                disabled={!active}
                onPress={() => onSelectUnit?.(item.unitId)}
                style={[
                  styles.pathCard,
                  { backgroundColor: tokens.color.surface, opacity: active ? 1 : 0.65 },
                ]}
              >
                <View
                  style={[
                    styles.unitArt,
                    {
                      backgroundColor:
                        item.state === 'active' ? '#FFE3C1' : tokens.color.selectionSurface,
                    },
                  ]}
                >
                  <Text style={styles.unitSymbol}>{UNIT_SYMBOLS[item.unitId] ?? '◆'}</Text>
                </View>
                <View style={styles.pathCopy}>
                  <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>
                    {item.title}
                  </Text>
                  <Text style={[tokens.typography.bodySmall, { color: tokens.color.textMuted }]}>
                    {item.unitLabel}
                  </Text>
                  {item.state === 'active' && item.totalLessons > 0 ? (
                    <Text style={[tokens.typography.caption, { color: tokens.color.aloe }]}>
                      {item.completedLessons} of {item.totalLessons} lessons
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    tokens.typography.h3,
                    { color: active ? tokens.color.aloe : tokens.color.disabledText },
                  ]}
                >
                  {stateSymbol}
                </Text>
              </Pressable>
            </View>
          );
        })}
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
