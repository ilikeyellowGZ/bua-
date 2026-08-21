# Bua Live Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect Buaâ€™s app to live Supabase identity and learner data, add safe Talk conversations, and expose production account, legal, and language controls.

**Architecture:** Expo routes stay thin. Auth, profile, and Talk adapters are individually testable modules over Supabase; migrations own trust boundaries, triggers, and RLS. The client receives only public Supabase settings while Edge Functions receive server-side AI credentials.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, Supabase JS, Supabase Postgres/RLS/Edge Functions, OpenRouter through an Edge Function, TypeScript strict, Zod, Jest.

**Spec:** `docs/superpowers/specs/2026-08-22-bua-live-production-design.md`

## Global Constraints

- Preserve the existing user `.gitignore` edit.
- Never place a service-role, OpenRouter, speech-provider, or payment key in an `EXPO_PUBLIC_*` variable or client source.
- Preserve anonymous/email OTP access when OAuth fails; show Apple only on iOS.
- All app-owned user data uses RLS ownership policies based on `(select auth.uid())`.
- Do not present fake speech scoring as live scoring.
- Preserve supplied mascot art; do not fake limb extraction from posed raster sprites.
- Every behavior change is test-first and each slice ends with fresh targeted verification.

---

### Task 1: Live identity and one-profile-per-user migration

**Files:**
- Create: `supabase/migrations/202608220001_live_identity.sql`
- Modify: `src/infra/supabase/database.types.ts`
- Modify: `src/features/auth/auth.repository.ts`
- Modify: `src/features/auth/auth-sheet.tsx`
- Modify: `src/features/auth/welcome-screen.tsx`
- Test: `tests/auth/auth-repository.test.ts`
- Test: `tests/supabase/migrations.test.ts`

**Interfaces:**
- Produces `AuthRepository.signInWithProvider(provider: 'google' | 'apple'): Promise<void>`.
- Produces migration-owned `profiles.onboarding_completed` and a secure profile trigger.

- [ ] **Step 1: Write failing auth and migration tests.**

```ts
it('starts Google OAuth with a native Bua callback', async () => {
  await repository.signInWithProvider('google');
  expect(signInWithOAuth).toHaveBeenCalledWith(
    expect.objectContaining({ provider: 'google', options: { redirectTo: 'bua://' } }),
  );
});

it('creates exactly one profile for each auth user', () => {
  expect(liveIdentity).toContain('create trigger on_auth_user_created');
  expect(liveIdentity).toContain('on conflict (id) do nothing');
});
```

- [ ] **Step 2: Run the targeted tests and confirm they fail because this interface/migration is absent.**

Run: `npm test -- --runInBand tests/auth/auth-repository.test.ts tests/supabase/migrations.test.ts`

- [ ] **Step 3: Implement the minimum live auth boundary.**

```sql
alter table public.profiles add column onboarding_completed boolean not null default false;
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'Learner'))
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
```

Implement `signInWithProvider` through `client.auth.signInWithOAuth`; use `bua://` on native and the web origin on web. Add provider buttons without removing email OTP or guest access.

- [ ] **Step 4: Rerun the targeted tests and confirm green.**

Run: `npm test -- --runInBand tests/auth/auth-repository.test.ts tests/supabase/migrations.test.ts`

- [ ] **Step 5: Commit the focused slice.**

```bash
git add supabase/migrations/202608220001_live_identity.sql src/infra/supabase/database.types.ts src/features/auth tests/auth tests/supabase/migrations.test.ts
git commit -m "feat(auth): connect live identity flows"
```

### Task 2: Persist onboarding and live profile settings

**Files:**
- Create: `src/features/profile/profile.repository.ts`
- Create: `src/features/profile/profile-screen.tsx`
- Create: `src/app/profile/settings.tsx`
- Modify: `src/features/onboarding/draft.repository.ts`
- Modify: `src/app/(onboarding)/goal.tsx`
- Modify: `src/app/(tabs)/profile.tsx`
- Modify: `src/features/onboarding/language-screen.tsx`
- Test: `tests/profile/profile-repository.test.ts`
- Test: `tests/profile/profile-screen.test.tsx`
- Test: `tests/onboarding/draft-repository.test.ts`

**Interfaces:**
- Produces `ProfileRepository.load`, `savePreferences`, and `markOnboardingComplete` scoped to the authenticated user.
- Produces `ProfileScreen` backed by a `ProfileViewModel`, not the `Neo` fixture.

- [ ] **Step 1: Write failing profile, language, and resume tests.**

```ts
it('updates only validated preferences for the signed-in profile', async () => {
  await repository.savePreferences({ displayName: 'Neo', languageCode: 'fr', dailyGoalMinutes: 15 });
  expect(update).toHaveBeenCalledWith(expect.objectContaining({ language_code: 'fr' }));
});

it('offers French, Spanish, Italian, Arabic, and English alongside isiZulu', () => {
  render(<LanguageScreen onBack={jest.fn()} onContinue={jest.fn()} />);
  expect(screen.getByRole('radio', { name: /French/ })).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: /Arabic/ })).toBeOnTheScreen();
});
```

- [ ] **Step 2: Run the profile/onboarding tests and confirm red.**

Run: `npm test -- --runInBand tests/profile tests/onboarding`

- [ ] **Step 3: Implement live profile and settings.**

Validate profile updates with Zod and query/update `profiles` through the authenticated Supabase client. Persist the last onboarding step and `onboarding_completed` on the final route. Add `fr`, `es`, `it`, `ar`, and `en`; render live display name/language/goal; add edit settings, native `Share.share`, sign out, privacy, and terms controls.

- [ ] **Step 4: Rerun the profile/onboarding tests and confirm green.**

Run: `npm test -- --runInBand tests/profile tests/onboarding`

- [ ] **Step 5: Commit the focused slice.**

```bash
git add src/features/profile src/app/profile/settings.tsx src/app/(tabs)/profile.tsx src/features/onboarding src/app/(onboarding) tests/profile tests/onboarding
git commit -m "feat(profile): persist preferences and settings"
```

### Task 3: Account privacy, deletion, and legal disclosures

**Files:**
- Create: `supabase/functions/delete-account/index.ts`
- Create: `src/features/profile/account.repository.ts`
- Modify: `src/features/profile/profile-screen.tsx`
- Modify: `src/features/legal/legal-screen.tsx`
- Create: `PRIVACY.md`
- Test: `tests/profile/account-repository.test.ts`
- Test: `tests/legal/legal-screen.test.tsx`

**Interfaces:**
- Produces `AccountRepository.requestDeletion(): Promise<void>` and `clearLocalAccountData(): Promise<void>`.

- [ ] **Step 1: Write failing confirmation and deletion-recovery tests.**

```ts
it('does not invoke account deletion before the learner confirms DELETE', async () => {
  await user.press(screen.getByRole('button', { name: 'Delete account' }));
  expect(invoke).not.toHaveBeenCalled();
});

it('clears the session only after deletion succeeds', async () => {
  await repository.requestDeletion();
  expect(signOut).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run account/legal tests and confirm red.**

Run: `npm test -- --runInBand tests/profile/account-repository.test.ts tests/legal/legal-screen.test.tsx`

- [ ] **Step 3: Implement the safe account lifecycle.**

The function authenticates the caller, removes app-private data and private recording objects with server credentials, calls `auth.admin.deleteUser`, and returns opaque errors. The client requires typed confirmation, signs out only after success, and keeps a retryable error visible. Update in-app legal copy and `PRIVACY.md` with data categories, audio retention, AI processing, and deletion behavior.

- [ ] **Step 4: Rerun account/legal tests and confirm green.**

Run: `npm test -- --runInBand tests/profile/account-repository.test.ts tests/legal/legal-screen.test.tsx`

- [ ] **Step 5: Commit the focused slice.**

```bash
git add supabase/functions/delete-account src/features/profile src/features/legal PRIVACY.md tests/profile tests/legal
git commit -m "feat(privacy): add account controls and deletion"
```

### Task 4: Authenticated, rate-limited Talk conversation

**Files:**
- Create: `supabase/migrations/202608220002_talk_limits.sql`
- Create: `supabase/functions/talk/index.ts`
- Create: `src/features/talk/talk.repository.ts`
- Create: `src/features/talk/talk-screen.tsx`
- Modify: `src/app/(tabs)/talk.tsx`
- Test: `tests/talk/talk-repository.test.ts`
- Test: `tests/talk/talk-screen.test.tsx`
- Test: `tests/supabase/migrations.test.ts`

**Interfaces:**
- Produces `TalkRepository.reply({ languageCode, message, history }): Promise<TalkReply>`.

- [ ] **Step 1: Write failing Talk request-boundary and retry UI tests.**

```ts
it('sends no more than six prior turns to the server', async () => {
  await repository.reply({ languageCode: 'it', message: 'Ciao', history: twelveTurns });
  expect(invoke).toHaveBeenCalledWith('talk', {
    body: expect.objectContaining({ languageCode: 'it', history: twelveTurns.slice(-6) }),
  });
});

it('keeps the learner message and offers retry when Talk is unavailable', async () => {
  await user.press(screen.getByRole('button', { name: 'Send message' }));
  expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();
});
```

- [ ] **Step 2: Run Talk/migration tests and confirm red.**

Run: `npm test -- --runInBand tests/talk tests/supabase/migrations.test.ts`

- [ ] **Step 3: Implement the private conversation path.**

Add an RLS-protected daily quota table keyed by owner/local day. The function validates JWT, language (`zu`, `en`, `fr`, `es`, `it`, `ar`), a nonempty 500-character message, six-turn/4,000-character history cap, then atomically increments quota and calls OpenRouter with its Edge Function secret. Return `{ text, translation? }`; map provider failures to safe messages. The app disables duplicate sends, keeps history in memory by default, and supports retry.

- [ ] **Step 4: Rerun Talk/migration tests and confirm green.**

Run: `npm test -- --runInBand tests/talk tests/supabase/migrations.test.ts`

- [ ] **Step 5: Commit the focused slice.**

```bash
git add supabase/migrations/202608220002_talk_limits.sql supabase/functions/talk src/features/talk src/app/(tabs)/talk.tsx tests/talk tests/supabase/migrations.test.ts
git commit -m "feat(talk): add private guided conversation"
```

### Task 5: Release documentation and real-provider gate

**Files:**
- Modify: `README.md`
- Modify: `docs/COMPLETION_REPORT.md`
- Modify: `docs/SUPABASE_VALIDATION.md`
- Modify: `eas.json`
- Test: `tests/config/env.test.ts`

- [ ] **Step 1: Write a failing public-environment test.**

```ts
it('rejects unexpected public variables so server keys cannot become client configuration', () => {
  expect(() => getPublicEnv({ ...validEnvironment, EXPO_PUBLIC_OPENROUTER_API_KEY: 'x' } as never)).toThrow(
    ConfigurationError,
  );
});
```

- [ ] **Step 2: Run the config test and confirm red.**

Run: `npm test -- --runInBand tests/config/env.test.ts`

- [ ] **Step 3: Document and enforce release configuration.**

Retain the strict public-environment whitelist. Document `supabase db push`, `supabase functions deploy talk delete-account`, `supabase secrets set OPENROUTER_API_KEY=...`, OAuth redirects (`bua://` plus production web origin), EAS secrets, physical-device checks, and the remaining speech-provider block.

- [ ] **Step 4: Run complete local validation.**

Run: `npm run validate && npm run export && npm run doctor`

- [ ] **Step 5: Commit release artifacts.**

```bash
git add README.md docs/COMPLETION_REPORT.md docs/SUPABASE_VALIDATION.md eas.json tests/config/env.test.ts
git commit -m "docs(release): document live deployment gates"
```

## Plan Self-Review

- **Spec coverage:** Tasks 1â€“4 cover live identity, profiles/onboarding/languages/share, privacy/deletion/legal, and server-brokered Talk. Task 5 provides release verification. The source-art and speech-provider constraints remain explicit rather than being faked.
- **Placeholder scan:** Each implementation step names concrete source files, test commands, and interfaces.
- **Type consistency:** The plan introduces `AuthRepository`, `ProfileRepository`, `AccountRepository`, and `TalkRepository` before their consuming routes; language codes match the spec.
