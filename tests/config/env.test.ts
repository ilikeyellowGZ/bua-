import { ConfigurationError, getPublicEnv } from '@/core/config/env';

const validEnvironment = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://bua-test.supabase.co',
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_abcdefghijklmnopqrstuvwxyz',
  EXPO_PUBLIC_APP_ENV: 'test',
  EXPO_PUBLIC_DEMO_MODE: 'true',
} as const;

describe('getPublicEnv', () => {
  it('names missing variables without echoing any supplied value', () => {
    const environment = {
      ...validEnvironment,
      EXPO_PUBLIC_SUPABASE_URL: undefined,
    };

    let thrown: unknown;
    try {
      getPublicEnv(environment);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ConfigurationError);
    expect((thrown as Error).message).toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect((thrown as Error).message).not.toContain(
      validEnvironment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  });

  it('returns a validated public environment', () => {
    expect(getPublicEnv(validEnvironment)).toEqual(validEnvironment);
  });
});
