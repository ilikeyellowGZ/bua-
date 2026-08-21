import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { AuthRepository } from '@/features/auth/auth.repository';
import { BuaButton } from '@/ui/controls/bua-button';
import { useTheme } from '@/ui/theme/theme-provider';

type InstitutionSheetProps = {
  visible: boolean;
  repository: AuthRepository;
  onClose: () => void;
  onComplete: () => void;
};

export function InstitutionSheet({
  visible,
  repository,
  onClose,
  onComplete,
}: InstitutionSheetProps) {
  const tokens = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const redeem = async () => {
    setError('');
    try {
      await repository.joinInstitution(code);
      onComplete();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not join institution.');
    }
  };
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: tokens.color.paper }]}>
          <View style={styles.header}>
            <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>
              Join your institution
            </Text>
            <Pressable
              accessibilityLabel="Close institution code"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.close}
            >
              <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>×</Text>
            </Pressable>
          </View>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
            Enter the code provided by your school or workplace.
          </Text>
          <TextInput
            accessibilityLabel="Institution code"
            autoCapitalize="characters"
            onChangeText={setCode}
            placeholder="BUA-DEMO"
            style={[styles.input, { borderColor: tokens.color.border, color: tokens.color.ink }]}
            value={code}
          />
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[tokens.typography.bodySmall, { color: tokens.color.danger }]}
            >
              {error}
            </Text>
          ) : null}
          <BuaButton label="Join institution" onPress={redeem} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(16,36,59,0.35)', flex: 1, justifyContent: 'flex-end' },
  close: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  input: { borderRadius: 16, borderWidth: 1, fontSize: 17, minHeight: 52, paddingHorizontal: 16 },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 16,
    padding: 24,
    paddingBottom: 40,
  },
});
