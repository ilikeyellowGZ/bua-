import { z } from 'zod';

import { getSupabaseClient } from '@/infra/supabase/client';

export type AuthSession = {
  userId: string;
  anonymous: boolean;
};

export type AuthRepository = {
  restoreSession(): Promise<AuthSession | null>;
  continueAsGuest(): Promise<AuthSession>;
  sendEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<AuthSession>;
  joinInstitution(code: string): Promise<AuthSession>;
  signOut(): Promise<void>;
};

const emailSchema = z.email('Enter a valid email address.');
const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the six-digit code.');

export function createDemoAuthRepository(): AuthRepository {
  let session: AuthSession | null = null;
  let requestedEmail: string | null = null;

  return {
    async restoreSession() {
      return session ? { ...session } : null;
    },
    async continueAsGuest() {
      session = { userId: 'demo-guest-neo', anonymous: true };
      return { ...session };
    },
    async sendEmailCode(email) {
      requestedEmail = emailSchema.parse(email);
    },
    async verifyEmailCode(email, code) {
      const validEmail = emailSchema.parse(email);
      otpSchema.parse(code);
      if (requestedEmail !== validEmail) throw new Error('Request a new email code first.');
      session = { userId: 'demo-email-neo', anonymous: false };
      return { ...session };
    },
    async joinInstitution(code) {
      if (code.trim().toUpperCase() !== 'BUA-DEMO') {
        throw new Error('Enter a valid institution code.');
      }
      session = { userId: 'demo-institution-neo', anonymous: false };
      return { ...session };
    },
    async signOut() {
      session = null;
    },
  };
}

export function createSupabaseAuthRepository(): AuthRepository {
  const client = getSupabaseClient();
  return {
    async restoreSession() {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session
        ? { userId: data.session.user.id, anonymous: data.session.user.is_anonymous ?? false }
        : null;
    },
    async continueAsGuest() {
      const { data, error } = await client.auth.signInAnonymously();
      if (error || !data.user) throw error ?? new Error('Anonymous sign-in did not return a user.');
      return { userId: data.user.id, anonymous: true };
    },
    async sendEmailCode(email) {
      const validEmail = emailSchema.parse(email);
      const { error } = await client.auth.signInWithOtp({ email: validEmail });
      if (error) throw error;
    },
    async verifyEmailCode(email, code) {
      const validEmail = emailSchema.parse(email);
      const validCode = otpSchema.parse(code);
      const { data, error } = await client.auth.verifyOtp({
        email: validEmail,
        token: validCode,
        type: 'email',
      });
      if (error || !data.user) throw error ?? new Error('Email verification failed.');
      return { userId: data.user.id, anonymous: false };
    },
    async joinInstitution() {
      throw new Error('Institution redemption is available through the secure server function.');
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
  };
}

export const authRepository: AuthRepository = createDemoAuthRepository();
