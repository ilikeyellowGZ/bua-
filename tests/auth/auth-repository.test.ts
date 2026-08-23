import { createDemoAuthRepository, createSupabaseAuthRepository } from '@/features/auth/auth.repository';

describe('deterministic auth repository', () => {
  it('restores anonymous guest sessions without a route flash', async () => {
    const repository = createDemoAuthRepository();
    expect(await repository.restoreSession()).toBeNull();

    const session = await repository.continueAsGuest();
    expect(session).toMatchObject({ userId: 'demo-guest-neo', anonymous: true });
    expect(await repository.restoreSession()).toEqual(session);
  });

  it('validates email and six-digit codes without exposing secrets', async () => {
    const repository = createDemoAuthRepository();
    await expect(repository.sendEmailCode('not-an-email')).rejects.toThrow(/valid email/i);
    await expect(repository.verifyEmailCode('neo@example.test', '123')).rejects.toThrow(
      /six-digit/i,
    );
    await repository.sendEmailCode('neo@example.test');
    await expect(repository.verifyEmailCode('neo@example.test', '123456')).resolves.toMatchObject({
      userId: 'demo-email-neo',
      anonymous: false,
    });
  });

  it('rejects invalid institution codes deterministically', async () => {
    const repository = createDemoAuthRepository();
    await expect(repository.joinInstitution('bad')).rejects.toThrow(/institution code/i);
    await expect(repository.joinInstitution('BUA-DEMO')).resolves.toMatchObject({
      userId: 'demo-institution-neo',
    });
  });
});

describe('Supabase auth repository', () => {
  it('starts Google OAuth with a native Bua callback', async () => {
    const signInWithOAuth = jest.fn().mockResolvedValue({ data: { url: 'https://auth.test' } });
    const openURL = jest.fn().mockResolvedValue(undefined);
    const repository = createSupabaseAuthRepository({
      client: {
        auth: {
          signInWithOAuth,
        },
      },
      openURL,
      platform: 'ios',
    });

    await repository.signInWithProvider('google');

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'bua://', skipBrowserRedirect: true },
    });
    expect(openURL).toHaveBeenCalledWith('https://auth.test');
  });

  it('stores an OAuth redirect session without exposing the token', async () => {
    const setSession = jest.fn().mockResolvedValue({
      data: { session: { user: { id: 'user-1', is_anonymous: false } } },
      error: null,
    });
    const repository = createSupabaseAuthRepository({
      client: {
        auth: {
          setSession,
        },
      },
    });

    await expect(
      repository.handleOAuthRedirect('bua://#access_token=access-token&refresh_token=refresh-token'),
    ).resolves.toEqual({ userId: 'user-1', anonymous: false });
    expect(setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });
});
