import { z } from 'zod';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { getSupabaseClient } from '@/infra/supabase/client';

export type AuthProvider = 'google' | 'apple';

export type AuthSession = {
  userId: string;
  anonymous: boolean;
};

export type AuthRepository = {
  restoreSession(): Promise<AuthSession | null>;
  continueAsGuest(): Promise<AuthSession>;
  sendEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<AuthSession>;
  signInWithProvider(provider: AuthProvider): Promise<void>;
  handleOAuthRedirect(url: string): Promise<AuthSession | null>;
  joinInstitution(code: string): Promise<AuthSession>;
  signOut(): Promise<void>;
};

const emailSchema = z.email('Enter a valid email address.');
const otpSchema = z.string().regex(/^\d{6}$/, 'Enter the six-digit code.');
const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
});

type SupabaseAuthClient = ReturnType<typeof getSupabaseClient>;

type SupabaseAuthRepositoryOptions = {
  client?: Pick<SupabaseAuthClient, 'auth'>;
  openURL?: (url: string) => Promise<unknown>;
  platform?: typeof Platform.OS;
  webOrigin?: string;
};

function createRedirectTo(platform = Platform.OS, webOrigin?: string) {
  if (platform === 'web') {
    return webOrigin ?? (typeof window === 'undefined' ? 'http://localhost:8081' : window.location.origin);
  }

  return 'bua://';
}

function parseOAuthTokens(url: string) {
  const tokenPart = url.includes('#') ? url.slice(url.indexOf('#') + 1) : url.split('?')[1];
  const params = new URLSearchParams(tokenPart);
  return tokenSchema.safeParse({
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
  });
}

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
    async signInWithProvider() {
      session = { userId: 'demo-provider-neo', anonymous: false };
    },
    async handleOAuthRedirect() {
      return session ? { ...session } : null;
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

export function createSupabaseAuthRepository({
  client = getSupabaseClient(),
  openURL = Linking.openURL,
  platform = Platform.OS,
  webOrigin,
}: SupabaseAuthRepositoryOptions = {}): AuthRepository {
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
      const { error } = await client.auth.signInWithOtp({
        email: validEmail,
        options: { emailRedirectTo: createRedirectTo(platform, webOrigin) },
      });
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
    async signInWithProvider(provider) {
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: createRedirectTo(platform, webOrigin), skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Sign-in provider did not return an authorization URL.');
      await openURL(data.url);
    },
    async handleOAuthRedirect(url) {
      const parsed = parseOAuthTokens(url);
      if (!parsed.success) return null;

      const { data, error } = await client.auth.setSession(parsed.data);
      if (error) throw error;
      return data.session
        ? { userId: data.session.user.id, anonymous: data.session.user.is_anonymous ?? false }
        : null;
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

export const authRepository: AuthRepository =
  process.env.EXPO_PUBLIC_DEMO_MODE === 'false'
    ? createSupabaseAuthRepository()
    : createDemoAuthRepository();
