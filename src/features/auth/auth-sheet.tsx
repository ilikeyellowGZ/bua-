import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { AuthRepository } from '@/features/auth/auth.repository';
import { BuaButton } from '@/ui/controls/bua-button';
import { useTheme } from '@/ui/theme/theme-provider';

type AuthSheetProps = {
  visible: boolean;
  repository: AuthRepository;
  onClose: () => void;
  onComplete: () => void;
};

export function AuthSheet({ visible, repository, onClose, onComplete }: AuthSheetProps) {
  const tokens = useTheme();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    try {
      if (!sent) {
        await repository.sendEmailCode(email);
        setSent(true);
      } else {
        await repository.verifyEmailCode(email, code);
        onComplete();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: tokens.color.paper }]}>
          <View style={styles.header}>
            <Text style={[tokens.typography.h2, { color: tokens.color.ink }]}>Log in to Bua</Text>
            <Pressable
              accessibilityLabel="Close login"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.close}
            >
              <Text style={[tokens.typography.h3, { color: tokens.color.ink }]}>×</Text>
            </Pressable>
          </View>
          <Text style={[tokens.typography.body, { color: tokens.color.textMuted }]}>
            {sent
              ? 'Enter the six-digit code sent to your email.'
              : 'We’ll email you a secure sign-in code.'}
          </Text>
          <TextInput
            accessibilityLabel="Email address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!sent}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="neo@example.com"
            style={[styles.input, { borderColor: tokens.color.border, color: tokens.color.ink }]}
            value={email}
          />
          {sent ? (
            <TextInput
              accessibilityLabel="Six-digit code"
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={setCode}
              placeholder="123456"
              style={[styles.input, { borderColor: tokens.color.border, color: tokens.color.ink }]}
              value={code}
            />
          ) : null}
          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[tokens.typography.bodySmall, { color: tokens.color.danger }]}
            >
              {error}
            </Text>
          ) : null}
          <BuaButton label={sent ? 'Verify code' : 'Send code'} onPress={submit} />
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
