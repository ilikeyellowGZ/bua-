import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Mascot } from '@/ui/mascot/mascot';
import { BuaButton } from '@/ui/controls/bua-button';
import { useTheme } from '@/ui/theme/theme-provider';

type PracticeScreenProps = {
  onFeatured: () => void;
  onSoundFocus: () => void;
  onPremium?: () => void;
};

export function PracticeScreen({ onFeatured, onSoundFocus, onPremium }: PracticeScreenProps) {
  const tokens = useTheme();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: tokens.color.paper }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={[tokens.typography.h1, { color: tokens.color.ink }]}
        >
          Explore
        </Text>
        <Mascot decorative pose="profile-avatar" size={62} />
      </View>
      <TextInput
        accessibilityLabel="Search phrases and stories"
        placeholder="Search phrases and stories"
        style={[styles.search, { borderColor: tokens.color.border, color: tokens.color.ink }]}
      />
      <View style={styles.chips}>
        {['☕ Everyday', '◆ Campus', '▣ Work', '▰ Travel'].map((label, index) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            style={[
              styles.chip,
              {
                backgroundColor: index === 0 ? tokens.color.aloe : tokens.color.surface,
                borderColor: tokens.color.aloe,
              },
            ]}
          >
            <Text
              style={[
                tokens.typography.bodySmall,
                { color: index === 0 ? tokens.color.surface : tokens.color.aloe },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityLabel="At the taxi rank, 6 minutes, listen and speak"
        accessibilityRole="button"
        onPress={onFeatured}
        style={[styles.featured, { backgroundColor: '#FFE39A' }]}
      >
        <View style={styles.featuredCopy}>
          <Text style={[tokens.typography.caption, styles.eyebrow, { color: '#DD8B00' }]}>
            FEATURED SITUATION
          </Text>
          <Text style={[tokens.typography.h1, { color: tokens.color.ink }]}>At the taxi rank</Text>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
            6 min · Listen and speak
          </Text>
          <View style={[styles.arrow, { backgroundColor: tokens.color.ink }]}>
            <Text style={[tokens.typography.h2, { color: tokens.color.surface }]}>→</Text>
          </View>
        </View>
        <Mascot decorative pose="conversation-passenger" size={145} />
      </Pressable>
      <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>
        Culture and connection
      </Text>
      <View style={styles.articles}>
        {['Ubuntu in conversation', 'When to use Sawubona'].map((title, index) => (
          <View
            key={title}
            style={[
              styles.article,
              { backgroundColor: index ? '#FFE8DC' : tokens.color.selectionSurface },
            ]}
          >
            <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>{title}</Text>
            <Text
              style={[
                tokens.typography.bodySmall,
                { color: index ? tokens.color.clay : tokens.color.aloe },
              ]}
            >
              3 min read
            </Text>
          </View>
        ))}
      </View>
      <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>Phrase packs</Text>
      {['Meeting new people · 12 phrases', 'Getting around · 16 phrases'].map((title, index) => (
        <Pressable
          key={title}
          accessibilityLabel={`Download ${title}`}
          accessibilityRole="button"
          onPress={index === 0 ? onSoundFocus : undefined}
          style={[styles.pack, { borderColor: tokens.color.border }]}
        >
          <Text style={[tokens.typography.bodyLarge, { color: tokens.color.ink }]}>{title}</Text>
          <Text style={[tokens.typography.h3, { color: tokens.color.aloe }]}>⇩</Text>
        </Pressable>
      ))}
      {onPremium ? (
        <BuaButton label="Explore Bua Premium" onPress={onPremium} variant="outline" />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  arrow: {
    alignItems: 'center',
    borderRadius: 999,
    height: 56,
    justifyContent: 'center',
    marginTop: 14,
    width: 56,
  },
  article: { borderRadius: 24, gap: 12, minHeight: 190, padding: 18, width: '48%' },
  articles: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  content: { gap: 20, padding: 20, paddingBottom: 48 },
  eyebrow: { letterSpacing: 2 },
  featured: {
    borderRadius: 28,
    flexDirection: 'row',
    minHeight: 280,
    overflow: 'hidden',
    padding: 22,
  },
  featuredCopy: { flex: 1, gap: 8 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  pack: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 88,
    padding: 18,
  },
  search: { borderRadius: 20, borderWidth: 1, fontSize: 17, minHeight: 56, paddingHorizontal: 18 },
});
