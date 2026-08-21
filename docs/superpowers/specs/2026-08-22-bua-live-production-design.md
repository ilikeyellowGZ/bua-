# Bua Live Production Design

## Goal

Turn the existing Expo application from a deterministic offline demo into a safe live language-learning application without exposing provider credentials or making user-owned data writable by another user.

## Decisions

- Supabase remains the system of record for authentication, profiles, onboarding preferences, courses, lesson attempts, completions, entitlements, and account lifecycle data.
- The client uses only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Service-role, OpenRouter, payment, and speech-provider keys remain in Supabase secrets or EAS secrets and are called only through an authenticated Edge Function.
- The release offers email OTP and anonymous guest access on every platform. Google OAuth is offered when the provider responds successfully; Apple OAuth is offered only on iOS. A provider failure keeps email and guest access available and explains how to continue.
- A signed-in user has exactly one profile row, created by a database trigger from `auth.users`. A guest retains the same Supabase identity until they link a permanent identity; client-local state is a cache, never authoritative progress.
- Onboarding persists after every step to a user-owned profile/preferences record. Re-entry resumes the incomplete step; completed onboarding enters Learn.
- Language selection contains isiZulu, English, French, Spanish, Italian, and Arabic. Course data uses stable language and lesson IDs, so existing progress remains attached to its originally completed lesson.
- The Talk tab is a bounded text conversation surface. The app sends only authenticated, rate-limited requests to the `talk` Edge Function, which in turn calls the configured server-side AI provider. It never sends the OpenRouter key to the device. A provider outage leaves the learner with a clear retry state and guided role-play.
- Pronunciation recording is not claimed to be live until a speech-scoring provider is configured. The UI requests microphone permission only on action, supports denial recovery, and identifies unavailable scoring clearly rather than returning a fictitious score.
- Profile is live data, not the `Neo` fixture. It supports editable display name, target language, daily goal, sign out, application sharing, legal links, and a destructive account-deletion confirmation. The delete request is performed by an authenticated Edge Function and revokes the session.
- The in-app Terms and Privacy routes contain the actual processing model, account-deletion path, audio retention choice, and a revision date. Public web policy URLs remain a release configuration item because the store listing requires publicly reachable links.
- The supplied mascot source contains posed raster sprites, not independently exported limbs. Runtime animation therefore uses pose transitions and reduced-motion-safe whole-character motion only. Limb animation is intentionally blocked until transparent, separately layered Thandi source artwork is supplied; no synthetic limb cut-outs will alter the approved art.

## Architecture

```text
Expo client
  -> Supabase Auth (guest, email OTP, OAuth)
  -> Supabase Postgres (RLS-protected profiles and learning data)
  -> Supabase Edge Functions (talk, account deletion, future speech/payment adapters)
  -> OpenRouter and other private providers
```

`AuthRepository` owns session restoration, guest sign-in, email OTP, OAuth, and sign-out. `ProfileRepository` owns the client-safe subset of profile and onboarding changes. Route guards use the restored session and `onboarding_completed` rather than routing based on temporary component state. The existing SQLite/outbox layer continues to make attempts and completions resilient to loss of connectivity, then synchronizes only after a valid session exists.

The `talk` Edge Function validates the bearer token, request shape, requested language, history size, and per-user daily allowance before contacting the configured model. It returns a small, structured reply, never raw provider errors or credentials. It must not store a transcript unless the user explicitly agrees through the privacy setting.

Account deletion is server-only. It verifies the caller, removes private recordings and user-owned app rows according to the privacy policy, removes the Auth user with the admin API, and returns success only after the deletion job is accepted. The device then clears its secure session and local cache.

## Vertical Slices

1. **Live identity and profiles** — add the profile/auth schema, trigger, RLS policies, typed repository, persistent session routing, real email/guest/OAuth flows, and tests for provider failure and no duplicate profile.
2. **Onboarding, profile, and legal controls** — persist learner choices; add the six requested language choices; replace fixture profile data; add share, session, privacy, Terms, data and deletion controls; test all user-owned writes.
3. **Safe live Talk** — add an authenticated Supabase function and typed client adapter for rate-limited text conversation, a usable Talk UI, and failure states. Do not use a server key in Expo.
4. **Speaking capability** — add microphone permission and recording states only after a verified speech provider contract is configured. Route audio to a private bucket/function, enforce retention, and return calibrated feedback bands. This slice is blocked from being described as live while only demo scoring exists.
5. **Release hardening** — apply migrations to the supplied Supabase project, configure auth redirect URLs and OAuth providers, deploy Edge Functions/secrets, publish legal URLs, add physical-device QA, create EAS production builds, and verify actual account, RLS, talking, and deletion behavior.

## Error Handling and Safety

- All remote calls show loading, retry, and offline states; none silently converts a provider error into success.
- RLS guards every new user-owned record with `(select auth.uid()) = owner_id` and clients do not receive write grants for entitlements, audit logs, or other authority data.
- Every destructive control requires a confirmation phrase or confirmation step, has clear irreversible-copy, and clears local session state only after remote confirmation.
- OAuth redirect URLs use the existing `bua://` scheme for native and the configured production web URL for web. Localhost redirects are not shipped in the production EAS profile.
- All screens retain roles, labels, touch target sizing, dynamic type behavior, and reduced-motion handling.

## Verification

- Jest unit/component tests prove input validation, live-repository request construction, profile ownership, onboarding resume decisions, OAuth/provider errors, account deletion confirmation, Talk request boundaries, and the no-secret public environment contract.
- Migration contract tests prove RLS, profile-trigger security, idempotency, and no client authority writes. pgTAP tests run against the deployed schema in Docker-capable CI.
- `npm run validate`, production static export, and `npx expo-doctor` must be clean before a release claim.
- A physical iOS and Android development build must complete guest, email OTP, Google, Apple, session restore, logged-out, profile update, sign-out, account deletion, and Talk failure/retry checks against the configured project.

## External Release Configuration

The source can enforce safe boundaries, but these changes require the project ownerâ€™s provider access before store submission: enable anonymous/email/OAuth providers, add native and web redirect URLs, deploy migrations/functions, set Edge Function secrets, configure a speech provider and private storage bucket, configure payment server verification, publish support/legal URLs, and create EAS signing/store credentials.
