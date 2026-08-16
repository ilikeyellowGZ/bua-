# Bua Complete Production App Design

Date: 2026-08-16

Status: Approved approach; written specification awaiting final user review

Product: Bua — Speak. Connect. Belong.

## 1. Outcome

Build a production-structured Expo and React Native application that faithfully implements all twenty supplied mobile references as functional native routes. The seeded isiZulu journey works end to end with deterministic local content, without a network, and synchronizes user-owned progress to Supabase when connectivity is available.

The supplied screen PNGs and three brand/mascot boards are immutable visual sources. They are not backgrounds and are never shipped as clickable composites. Thandi is rendered only from pixel-preserving assets extracted from the supplied boards or exact crops from the references. No mascot redraw, trace, regeneration, or stylistic substitution is permitted.

## 2. Approved delivery approach

Use production vertical slices. Each slice contains its design tokens or reusable components, domain behavior, Supabase/local data contract, route UI, purposeful motion, accessibility states, tests, visual evidence, and a green commit. A slice is not complete merely because the screen renders.

The sequence is:

1. Repository safety, reference intake, asset verification, and Expo foundation.
2. Supabase schema, RLS, environment validation, authentication, and offline sync foundation.
3. Welcome plus four-step onboarding.
4. Learn home, lesson runner, and the seeded eight-activity lesson.
5. Practice library and specialist activities.
6. Premium offer, deterministic purchase flow, and production purchase adapter boundary.
7. Whole-app accessibility, motion, visual regression, performance, CI, and release hardening.

Visible review artifacts are produced throughout: reference audit, contact sheet, per-screen captures, overlays, regional diffs, motion recordings, and test output.

## 3. Sources of truth and precedence

When requirements conflict, use this order:

1. The twenty supplied screen references and three supplied brand/mascot boards for visible design and character identity.
2. `prompts/Bua_Complete_20_Screen_Animated_Production_Master_Prompt.md` for behavior, route, state, testing, motion, and delivery requirements.
3. This design specification for architecture, Supabase integration, security, and delivery decomposition.
4. Current stable official Expo, React Native, Supabase, Apple, and Google documentation.
5. Duolingo only as non-copying inspiration for pacing, feedback clarity, and progress communication when the supplied contract is silent.

No new visual direction may override the references.

## 4. Repository structure

Use current Expo project conventions with route files kept thin:

```text
src/
  app/
    _layout.tsx
    (auth)/welcome.tsx
    (onboarding)/language.tsx
    (onboarding)/routine.tsx
    (onboarding)/placement.tsx
    (onboarding)/goal.tsx
    (premium)/offer.tsx
    (premium)/checkout.tsx
    (tabs)/_layout.tsx
    (tabs)/learn.tsx
    (tabs)/practice.tsx
    (tabs)/talk.tsx
    (tabs)/profile.tsx
    lesson/[lessonId]/*.tsx
  assets/
    audio/
    brand/
    illustrations/
    mascot/
  content/
  core/
    config/
    errors/
    motion/
    navigation/
  features/
    auth/
    onboarding/
    learning-path/
    lesson-runner/
    practice-library/
    premium/
    purchases/
    reminders/
    speech/
    streaks/
    sync/
  infra/
    local/
    supabase/
  ui/
    brand/
    controls/
    feedback/
    lesson/
    mascot/
    navigation/
    theme/
  types/
supabase/
  migrations/
  seed.sql
  tests/
design/
  reference/bua/
  visual-regression/
docs/
e2e/
tests/
```

`src/app` contains navigation composition only. Feature folders own screens, machines, schemas, repository interfaces, and feature-specific tests. Shared UI is promoted only after at least two real consumers exist. Database migrations are forward-only, deterministic, and committed.

## 5. Visual and asset system

The five fixed brand colors are `ink #14263D`, `sun #F4B942`, `aloe #2B9C91`, `clay #EF765F`, and `paper #FAF7EF`. Semantic state colors may be derived without mutating those sources. The UI uses an eight-point spacing system with four-point optical corrections, approximately 24-point phone gutters, 44-by-44-point minimum targets, reference-matched radii and shadows, and a rounded humanist sans fallback if the original font is unavailable.

Before page implementation:

- Move unchanged originals into `design/reference/bua/` and record dimensions and SHA-256 values in `manifest.json`.
- Produce `design/REFERENCE_AUDIT.md`, `design/ASSET_GAPS.md`, and a twenty-three-image contact sheet.
- Record safe crop rectangles in `mascot-crops.json`.
- Extract independent lossless mascot and brand assets only where foreground/background separation is pixel-safe.
- Verify dimensions, color type, and alpha channel for every extracted file and retain a source-to-output mapping in `src/assets/mascot/README.md`.
- If the checkerboard is baked into a board rather than transparent alpha, record that as an asset gap and use an exact screen crop until a clean extraction is possible.

The reusable visual contract includes `BuaButton`, `IconButton`, `ProgressHeader`, `LessonProgress`, `ChoiceCard`, `AudioButton`, `Mascot`, `FeedbackPanel`, `BottomTabs`, `LessonScaffold`, `OfflineBanner`, `ErrorState`, and premium plan controls. Components expose default, pressed, selected, disabled, loading, success, error, offline, large-text, screen-reader, and reduced-motion behavior where applicable.

## 6. Navigation and product flow

The seeded happy path is fixed:

```text
Welcome
→ Language
→ Routine
→ Placement
→ Goal
→ Learn
→ Listen
→ Phrase builder
→ Picture match
→ Branching conversation
→ Comprehension
→ Dictation
→ Click pronunciation
→ Speaking feedback
→ Lesson complete
→ Learn
```

Practice launches Sound Focus and Guided Role-play through the same lesson-runner contracts. Premium may open from Learn or Practice and must return to the exact origin and scroll state after dismissal or success. Route parameters are validated. Android back, iOS gestures, deep links, restoration, and impossible-state recovery all observe the active machines instead of mutating progress ad hoc.

## 7. State and domain boundaries

Use Zod-validated domain models for profiles, courses, units, lessons, activities, choices, attempts, pronunciation results, role-play turns, streaks, completions, content packs, reminders, purchase products, entitlements, and sync operations.

XState machines own onboarding, active lesson, specialist conversation, recording, purchases, and synchronization. TanStack Query owns remote fetching, retries, cancellation, invalidation, and background reconciliation. Zustand is limited to small ephemeral cross-route UI state such as premium origin and presentation preferences. It does not own server data or lesson progression.

The active lesson machine follows the supplied lifecycle from hydration through completion, with explicit interruption, offline, recoverable-error, and exit-confirmation states. Attempt submission, lesson completion, streak updates, reminder replacement, sync operations, and entitlement writes use stable idempotency keys.

## 8. Offline-first data flow

SQLite is the immediate source for seeded lesson content, active lesson snapshots, draft answers, attempt outbox entries, downloads, completion history, reminder intent, and the last verified entitlement. The UI reads local state first and remains usable while Supabase is unavailable.

Writes follow this path:

```text
validated user intent
→ local transaction
→ stable outbox operation
→ immediate UI result
→ background Supabase upsert/RPC
→ server acknowledgement
→ mark outbox operation synced
```

An operation has a stable UUID, owner ID, operation type, aggregate ID, schema version, payload checksum, creation time, retry count, and status. Sync uses exponential backoff with jitter, cancels when the app backgrounds, and resumes safely. `on conflict` upserts and unique idempotency constraints prevent duplicate attempts, rewards, and entitlements. Conflicts use explicit per-aggregate rules: server-authoritative content and entitlements; monotonic merge for completed activities; latest validated draft for mutable onboarding; and transaction/RPC authority for completion and streaks.

## 9. Supabase backend

Supabase provides Auth, Postgres, the Data API protected by RLS, optional Storage for versioned lesson assets, Realtime only where it materially improves sync, and Edge Functions for server-only operations such as institution-code redemption and purchase verification.

### Authentication

- `Continue as guest` uses Supabase anonymous auth when online and a recoverable local guest identity when offline. The local identity is linked or migrated after a successful anonymous session is created.
- Email login uses Supabase email OTP with six-digit verification UX.
- Anonymous users may later link an email identity without losing progress.
- Institution codes are redeemed through a rate-limited Edge Function; raw codes are never stored in client analytics.
- Sessions use the supported React Native persistence adapter. Tokens are not logged and server secrets are never stored in client-accessible state.

### Core tables

All identifiers are lowercase snake_case. User-owned tables use UUID keys that match or reference `auth.users`; content tables use stable text IDs from authored fixtures. Timestamps use `timestamptz`.

- `profiles`: user identity display fields, target locale, onboarding schema version, goal, level, and preference metadata.
- `courses`, `units`, `lessons`, `activities`, `content_packs`: versioned read-only authored content.
- `lesson_runs`: one row per run with active duration and current machine snapshot version.
- `attempts`: stable attempt ID, run/activity ownership, normalized result, status, and timestamps.
- `lesson_completions`: unique `lesson_run_id`; the idempotent completion record.
- `streak_days`: unique `(user_id, local_date, zone_id)` completion evidence.
- `reminder_preferences`: one active wall-clock reminder intent per user/course.
- `downloads`: user/content-pack version and checksum state.
- `sync_operations`: acknowledged operation IDs and payload checksums for deduplication/audit.
- `purchase_events`: server-written verified transaction events only.
- `entitlements`: current server-verified product, source, validity, and transaction lineage.
- `institution_memberships`: server-issued membership state; users cannot self-grant it.

Every user-owned foreign key is indexed. Common queries receive composite indexes such as attempts by `(user_id, lesson_run_id, created_at)` and lesson runs by `(user_id, status, updated_at)`. Partial indexes cover pending sync operations and active entitlements. Pagination uses stable cursor fields, not deep offsets.

### RLS and privileges

- RLS is enabled on every exposed table.
- Authenticated users, including anonymous users, may select and mutate only rows where `user_id = (select auth.uid())`.
- Public content is read-only to authenticated/anonymous client roles and writable only through migrations or server roles.
- Purchase events, entitlement verification fields, and institution membership authority are server-write only.
- Policies do not rely on editable `raw_user_meta_data` for authorization.
- Columns used by RLS policies are indexed, and `auth.uid()`/JWT functions are wrapped in scalar selects where appropriate.
- The service/secret key exists only in Supabase secrets or trusted local migration tooling and is never exposed to Expo.

Migration tests verify expected access and intentional denial for owner, other user, anonymous user, and unauthenticated role.

## 10. Environment contract

The existing `.env` remains local and ignored by Git. Expo client code may read only:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_DEMO_MODE
```

Server tooling and Supabase functions may use non-public variables such as:

```text
SUPABASE_SECRET_KEY
SUPABASE_JWK_URL
OPENROUTER_API_KEY
OPENROUTER_BASE_URL
OPENROUTER_MODEL
AI_DAILY_LIMIT
```

The current local `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` values will be mapped to the two `EXPO_PUBLIC_` names required by Expo, without copying the secret key into any public variable. A committed `.env.example` contains placeholders only. `src/core/config/env.ts` validates required public variables with Zod at startup and emits a safe configuration error containing variable names but never values. CI and EAS use encrypted environment configuration.

## 11. Security and privacy design

Trust boundaries are the mobile client, local SQLite, Supabase Data API/Auth, Edge Functions, platform speech/audio APIs, native app stores, and external AI endpoints. Assets include credentials, sessions, learning progress, institution membership, purchases, microphone audio, and free-form speech.

Controls:

- RLS and least-privilege grants enforce ownership even if the client is modified.
- Zod validates content, route parameters, environment presence, adapter responses, and Edge Function payloads.
- Database writes use Supabase parameterization and migrations; no concatenated SQL receives user input.
- Email, OTP, institution code, reminder, and speech inputs have length/format limits and generic recoverable errors.
- Auth and institution endpoints are rate-limited; anonymous account creation is protected against abuse.
- Raw microphone audio is deleted after scoring unless the user explicitly opts in. It is excluded from analytics and sync by default.
- Purchase transactions are collected by StoreKit or Google Play Billing, never by a custom native card form. Production access is granted only after server verification.
- No secret, token, raw recording, card value, or sensitive free-form transcript appears in logs.
- Dependency scripts are reviewed before approval, the lockfile is authoritative, and release audit findings are triaged by reachability.

Abuse-case tests cover cross-user reads/writes, forged completion, repeated attempts, duplicate transaction callbacks, institution-code enumeration, oversized inputs, replayed sync operations, and raw-audio retention.

## 12. Motion and accessibility

`MotionProvider` owns full/reduced/deterministic modes. Navigation continuity, press response, progress, selection feedback, real playback/recording indicators, and finite high-value mascot reactions follow the supplied timing recipes. Motion uses opacity and transform on the UI thread where possible, remains interruptible, and never drives product state through timers.

Only one continuous decorative loop is allowed per screen, all loops stop in the background, and screenshot mode freezes nonessential motion. Mascot animation uses whole-sprite transforms or approved frame swaps only. Reduced motion removes travel, bounce, looping mascot motion, confetti travel, and score counting while preserving immediate state changes.

Accessibility uses native roles, names, states, hints, logical focus, live announcements, 44-point targets, dynamic type with scrolling/reflow, non-color feedback, high-contrast verification, keyboard avoidance, and explicit screen-reader alternatives for drag/reorder and microphone tasks.

## 13. Error handling

Errors are typed as configuration, validation, authentication, permission, unavailable-offline, missing-asset, storage-full, audio-interruption, service-unavailable, sync-conflict, purchase-pending, purchase-cancelled, purchase-verification, and unexpected. UI maps these to calm, actionable messages and never exposes stack traces or internal provider details.

Local completion remains visible when synchronization fails. A failed remote operation remains in the outbox with a bounded retry policy and an explicit manual retry surface. Missing content or audio never produces an impossible lesson state; the runner offers retry, download, accessible transcript/fallback, or safe exit depending on activity policy.

## 14. Approved test seams

The approved public seams are:

1. User-facing screen behavior through accessible roles, names, states, navigation intents, and deterministic visible feedback.
2. Domain/repository interfaces for onboarding, lesson progression, idempotent attempts/completion, streaks, reminders, downloads, purchases, and offline synchronization.
3. Complete seeded journeys through Maestro, including onboarding-to-completion, recovery paths, premium flows, large text, and reduced motion.

Additional database tests exercise migrations, constraints, indexes, RLS, RPC idempotency, and cross-user denial. Visual tests compare all twenty reference states by region and require human review for mascot pixel changes.

TDD proceeds one vertical behavior at a time: failing test, observed failure, minimal implementation, passing focused test, passing relevant suite, visual/accessibility check, then commit.

## 15. Commit and GitHub workflow

- The reference/specification commit establishes immutable inputs and safety rules.
- Every implementation commit corresponds to a completed green test cycle or a coherent non-code artifact checkpoint.
- No commit is made from a failing required suite.
- Before each commit: run the focused test, relevant suite, TypeScript/lint checks when affected, `git diff --check`, and a staged-secret scan.
- Commit messages identify the vertical behavior, for example `feat(onboarding): persist language selection` or `test(sync): reject duplicate completion operation`.
- Push completed green commits to `origin/main` only after local verification. Never include `.env` or generated secrets.
- Required reference files, design artifacts, migrations, tests, lockfile, and CI configuration are versioned; generated build output and local credentials are not.

## 16. Production definition of done

The application is complete only when all twenty routes are functional, all supplied assets remain immutable, the seeded path and offline downloaded lesson work, Supabase ownership and synchronization are verified, progress and purchase effects are idempotent, microphone/purchase privacy requirements hold, every screen has purposeful reduced-motion-aware motion, accessibility and large-text checks pass, visual diffs are reviewed, and format/lint/type/unit/component/E2E/build gates are green.

Actual email delivery, store transactions, production speech scoring, physical-device validation, and app-store submission require valid provider/store configuration. Deterministic adapters keep the full app and test suite operational without those external credentials, while the completion report distinguishes verified local behavior from provider-dependent verification.
