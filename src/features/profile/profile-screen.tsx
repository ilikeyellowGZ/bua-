import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { buaSeedContent } from '@/content/seed';
import { getAdminRepository, type AdminRepository } from '@/features/admin/admin.repository';
import { authRepository, type AuthRepository } from '@/features/auth/auth.repository';
import { getOwnerId } from '@/features/auth/session';
import {
  accountRepository,
  type AccountRepository,
  type DeletionStatus,
} from '@/features/compliance/account.repository';
import { getProgressTracker } from '@/features/progress/default-tracker';
import type { ProgressTracker } from '@/features/progress/progress-tracker';
import { BuaButton } from '@/ui/controls/bua-button';
import { FeedbackPanel } from '@/ui/feedback/feedback-panel';
import { Mascot } from '@/ui/mascot/mascot';
import { useTheme } from '@/ui/theme/theme-provider';
import type { Progress } from '@/types/domain';

type ProfileScreenProps = {
  onOpenPremium: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenAdmin: () => void;
  onSignedOut: () => void;
  loadOwnerId?: () => Promise<string>;
  loadProgressTracker?: () => Promise<ProgressTracker>;
  loadAdminRepository?: () => Promise<Pick<AdminRepository, 'isAdmin'>>;
  account?: Pick<AccountRepository, 'getDeletionStatus' | 'requestDeletion' | 'cancelDeletionRequest'>;
  auth?: Pick<AuthRepository, 'signOut'>;
};

export function ProfileScreen({
  onOpenPremium,
  onOpenPrivacy,
  onOpenTerms,
  onOpenAdmin,
  onSignedOut,
  loadOwnerId = getOwnerId,
  loadProgressTracker = getProgressTracker,
  loadAdminRepository = getAdminRepository,
  account = accountRepository,
  auth = authRepository,
}: ProfileScreenProps) {
  const tokens = useTheme();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ownerId = await loadOwnerId();
      const tracker = await loadProgressTracker();
      const admin = await loadAdminRepository();
      const [loadedProgress, loadedDeletion, adminAllowed] = await Promise.all([
        tracker.getProgress(ownerId),
        account.getDeletionStatus(),
        admin.isAdmin(),
      ]);
      if (!cancelled) {
        setProgress(loadedProgress);
        setDeletionStatus(loadedDeletion);
        setIsAdmin(adminAllowed);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account, loadAdminRepository, loadOwnerId, loadProgressTracker]);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await auth.signOut();
      onSignedOut();
    } finally {
      setBusy(false);
    }
  };

  const handleRequestDeletion = async () => {
    setBusy(true);
    try {
      const status = await account.requestDeletion();
      setDeletionStatus(status);
      setConfirmingDeletion(false);
    } finally {
      setBusy(false);
    }
  };

  const handleCancelDeletion = async () => {
    setBusy(true);
    try {
      await account.cancelDeletionRequest();
      setDeletionStatus({ requestedAt: null });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ backgroundColor: tokens.color.paper }}
    >
      <Mascot accessibilityLabel="Thandi profile avatar" pose="profile-avatar" size={150} />
      <Text style={[tokens.typography.h1, { color: tokens.color.ink }]}>Learner</Text>
      <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
        Learning {buaSeedContent.course.languageName}
      </Text>
      <View style={[styles.card, { backgroundColor: tokens.color.selectionSurface }]}>
        <Text style={[tokens.typography.h3, { color: tokens.color.aloe }]}>
          {progress?.streak.currentDays ?? 0} day streak
        </Text>
        <Text style={[tokens.typography.body, { color: tokens.color.ink }]}>
          {progress?.totalXP ?? 0} XP earned
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#FFF0D5' }]}>
        <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>Learn without limits</Text>
        <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
          See verified storefront plans, offline lessons, and speaking practice.
        </Text>
        <BuaButton label="Explore Bua Premium" onPress={onOpenPremium} />
      </View>
      <View style={styles.links}>
        <BuaButton label="Privacy" variant="outline" onPress={onOpenPrivacy} style={styles.link} />
        <BuaButton label="Terms" variant="outline" onPress={onOpenTerms} style={styles.link} />
      </View>

      {deletionStatus?.requestedAt ? (
        <View style={styles.dangerCard}>
          <FeedbackPanel
            tone="coaching"
            title="Account deletion requested"
            message="Your data will be deleted within 30 days. You can cancel this any time before then."
          />
          <BuaButton
            label="Cancel deletion request"
            variant="outline"
            onPress={handleCancelDeletion}
            disabled={busy}
          />
        </View>
      ) : confirmingDeletion ? (
        <View style={styles.dangerCard}>
          <FeedbackPanel
            tone="coaching"
            title="Delete your account?"
            message="This requests permanent deletion of your account and learning data within 30 days."
          />
          <View style={styles.links}>
            <BuaButton
              label="Cancel"
              variant="outline"
              onPress={() => setConfirmingDeletion(false)}
              style={styles.link}
            />
            <BuaButton
              label="Yes, request deletion"
              variant="outline"
              onPress={handleRequestDeletion}
              disabled={busy}
              style={styles.link}
            />
          </View>
        </View>
      ) : (
        <BuaButton
          label="Delete my account"
          variant="outline"
          onPress={() => setConfirmingDeletion(true)}
        />
      )}

      <BuaButton label="Sign out" variant="outline" onPress={handleSignOut} disabled={busy} />

      {isAdmin ? (
        <BuaButton label="Admin dashboard" variant="outline" onPress={onOpenAdmin} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, gap: 10, padding: 20, width: '100%' },
  content: { alignItems: 'center', gap: 16, padding: 24, paddingBottom: 50 },
  dangerCard: { gap: 12, width: '100%' },
  link: { flex: 1 },
  links: { flexDirection: 'row', gap: 12, width: '100%' },
});
