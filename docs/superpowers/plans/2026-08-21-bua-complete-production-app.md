# Bua Complete Production App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the complete, animated, accessible twenty-screen Bua iOS and Android application with deterministic offline behavior, Supabase persistence, and production quality gates.

**Architecture:** Expo SDK 57 and Expo Router keep route files thin while feature modules own screens, machines, schemas, and tests. SQLite is the immediate source of truth and an idempotent outbox reconciles user-owned data with a Supabase backend protected by RLS; provider-dependent speech and purchase behavior stays behind typed adapters with deterministic local implementations.

**Tech Stack:** Expo SDK 57, React Native 0.86, React 19.2.3, TypeScript strict, Expo Router, Reanimated, Gesture Handler, expo-audio, expo-image, expo-sqlite, expo-secure-store, TanStack Query, XState, Zustand, Zod, Supabase, Jest, React Native Testing Library 14, Maestro, ESLint, Prettier, EAS.

**Spec:** `docs/superpowers/specs/2026-08-16-bua-complete-production-app-design.md`

## Global Constraints

- Use Node.js 22.13 or newer; the current implementation baseline is Expo SDK 57 with React Native 0.86 and React 19.2.3.
- Keep all twenty supplied screen PNGs and three asset boards byte-for-byte unchanged as immutable sources.
- Never render a reference screen as an interactive background and never redraw, regenerate, trace, or substitute Thandi.
- Use TypeScript with `strict: true` and `noUncheckedIndexedAccess: true`; validate external data with Zod.
- Only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` may enter the mobile bundle. Never expose `SUPABASE_SECRET_KEY` or AI provider credentials.
- Persist seeded lessons, drafts, attempts, progress, downloads, and the sync outbox locally before attempting network synchronization.
- Enforce ownership with Supabase RLS and idempotency with stable operation, attempt, lesson-run, completion, reminder, and purchase identifiers.
- Every route includes purposeful interruptible motion and a complete reduced-motion result.
- Every pressable exposes an accessible role/name/state, a minimum 44-by-44-point target, and non-color-only feedback.
- Each task follows red → observed failure → minimal implementation → focused green → relevant suite green → `git diff --check` → secret scan → commit → push.
- No required test may be skipped and no visual baseline may be broadly replaced without reviewing the regional diff.

---

### Task 1: Reference Intake and Reproducible Expo Foundation

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `eslint.config.mjs`, `.prettierrc.json`, `.env.example`
- Create: `src/app/_layout.tsx`, `src/app/index.tsx`, `src/core/config/env.ts`, `src/ui/theme/tokens.ts`, `tests/config/env.test.ts`
- Create: `design/reference/bua/manifest.json`, `design/REFERENCE_AUDIT.md`, `design/ASSET_GAPS.md`, `design/reference/bua/mascot-crops.json`, `src/assets/mascot/README.md`
- Move unchanged: root reference PNGs and `assets/*.png` into `design/reference/bua/`

**Interfaces:**
- Produces: `envSchema`, `getPublicEnv()`, `theme`, a bootable Expo Router shell, the immutable reference manifest, and documented asset gaps.

- [x] **Step 1: Create the pinned Expo SDK 57 manifests and install dependencies fail-closed** using `npm install --ignore-scripts`, inspect every package declaring an install script, approve only required Expo/native build scripts, and verify the committed lockfile with `npm ci --ignore-scripts`.
- [x] **Step 2: Write the failing environment test** asserting that missing public variables yield safe variable-name errors and values are never included.
- [x] **Step 3: Run `npm test -- tests/config/env.test.ts --runInBand`** and confirm failure because `getPublicEnv` does not exist.
- [x] **Step 4: Create the minimal router shell and environment reader** with strict compiler options, scripts for format/lint/type/test/start/build, and this Zod contract:

```ts
export const publicEnvSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'test', 'production']),
  EXPO_PUBLIC_DEMO_MODE: z.enum(['true', 'false']),
});
```

- [x] **Step 5: Relocate and hash all twenty-three immutable references** and record dimensions, SHA-256, alpha/color type, measured layout regions, crop rectangles, and extraction limitations without changing source bytes.
- [x] **Step 6: Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm audit signatures`, and the focused test**; verify every command passes or document a registry that does not publish signatures without weakening the release gate.
- [x] **Step 7: Commit and push** with `chore: establish Bua Expo foundation and reference contract`.

### Task 2: Brand Assets, Design Tokens, Motion, and Shared Controls

**Files:**
- Create: `src/ui/theme/ThemeProvider.tsx`, `src/core/motion/MotionProvider.tsx`
- Create: `src/ui/controls/BuaButton.tsx`, `src/ui/controls/IconButton.tsx`, `src/ui/lesson/ProgressHeader.tsx`, `src/ui/lesson/ChoiceCard.tsx`, `src/ui/feedback/FeedbackPanel.tsx`, `src/ui/mascot/Mascot.tsx`
- Create: `tests/ui/shared-controls.test.tsx`, `tests/ui/motion-provider.test.tsx`

**Interfaces:**
- Consumes: `theme` and approved mascot source map from Task 1.
- Produces: `MotionContextValue`, `BuaButtonProps`, `ChoiceCardProps`, and `MascotProps` matching the product contract.

- [x] **Step 1: Write failing RNTL tests** for button enabled/disabled/loading/pressed semantics, selected choice state, minimum hit slop, mascot decorative behavior, and deterministic reduced-motion timing.
- [x] **Step 2: Run the focused tests** and verify imports fail.
- [x] **Step 3: Implement shared controls** using native components, `expo-image`, Reanimated UI-thread opacity/transform, interruptible callbacks, and no product logic timers.
- [x] **Step 4: Add deterministic motion mode** where idle loops freeze and screen transition durations become zero while final visible states remain identical.
- [x] **Step 5: Run shared-control, format, lint, and type checks** and inspect the welcome-sized component fixture.
- [x] **Step 6: Commit and push** with `feat(ui): add Bua design and motion primitives`.

### Task 3: Validated Domain Content and Lesson State Machine

**Files:**
- Create: `src/content/schemas.ts`, `src/content/seed.ts`, `src/types/domain.ts`
- Create: `src/features/lesson-runner/lesson.machine.ts`, `src/features/lesson-runner/progress.ts`, `src/features/lesson-runner/scoring.ts`
- Create: `tests/domain/content.test.ts`, `tests/domain/lesson-machine.test.ts`, `tests/domain/scoring.test.ts`

**Interfaces:**
- Produces: `UserProfile`, `Course`, `Unit`, `Lesson`, `Activity`, `Attempt`, `LessonCompletion`, `PronunciationResult`, `RolePlayTurn`, `ContentPack`, `SyncOperation`, `createLessonMachine()`, and `calculateLessonProgress()`.

- [ ] **Step 1: Write failing schema and machine tests** for the exact seeded Neo/isiZulu content, eight-activity order, duplicate-submission guard, retry behavior, interruption restore, and normalized dictation scoring.
- [ ] **Step 2: Run the three focused test files** and observe missing modules.
- [ ] **Step 3: Implement Zod schemas and stable seeded IDs** with copy outside screen components.
- [ ] **Step 4: Implement the explicit lesson state machine** including hydration, presentation, evaluation, feedback, interruption, offline, error, exit, and completion states.
- [ ] **Step 5: Run domain tests and full unit suite** and verify green.
- [ ] **Step 6: Commit and push** with `feat(domain): model Bua lesson content and progression`.

### Task 4: Supabase Schema, RLS, and Idempotent Server Operations

**Files:**
- Create: `supabase/config.toml`, `supabase/seed.sql`
- Create: `supabase/migrations/202608210001_bua_core.sql`, `supabase/migrations/202608210002_bua_rls.sql`, `supabase/migrations/202608210003_bua_functions.sql`
- Create: `supabase/tests/rls.test.sql`, `supabase/tests/idempotency.test.sql`
- Create: `src/infra/supabase/client.ts`, `src/infra/supabase/database.types.ts`

**Interfaces:**
- Consumes: domain IDs and operation contracts from Task 3.
- Produces: owner-scoped tables, read-only content tables, `complete_lesson_once`, `ack_sync_operation`, and a typed Supabase client.

- [ ] **Step 1: Write failing pgTAP SQL tests** proving owners can access their rows, other users cannot, clients cannot forge entitlements/memberships, duplicate completion returns the existing result, and repeated sync acknowledgements are harmless.
- [ ] **Step 2: Run `npx supabase test db`** and confirm missing relations/functions fail.
- [ ] **Step 3: Implement lowercase snake_case migrations** with `timestamptz`, constraints, foreign-key/RLS indexes, pending-operation partial indexes, least-privilege grants, and `auth.uid()` policies.
- [ ] **Step 4: Implement idempotent SQL functions** with explicit search paths and stable conflict keys; keep purchase and institution authority server-only.
- [ ] **Step 5: Reset the local Supabase database, run pgTAP tests, lint SQL, and generate TypeScript database types.**
- [ ] **Step 6: Commit and push** with `feat(db): add secure Supabase learning schema`.

### Task 5: SQLite Repositories and Offline Synchronization

**Files:**
- Create: `src/infra/local/database.ts`, `src/infra/local/migrations.ts`
- Create: `src/features/sync/repository.ts`, `src/features/sync/sync.machine.ts`, `src/features/sync/reconcile.ts`
- Create: `src/features/lesson-runner/progress.repository.ts`, `tests/sync/offline-sync.test.ts`

**Interfaces:**
- Produces: `ProgressRepository`, `SyncRepository`, `saveAttempt(attempt)`, `completeLesson(input)`, `enqueueSync(operation)`, and `reconcilePendingOperations(signal)`.

- [ ] **Step 1: Write failing integration tests** for local-first writes, process restart restoration, exponential retry, cancellation, outbox deduplication, and server acknowledgement.
- [ ] **Step 2: Run the focused sync test** and confirm missing repositories fail.
- [ ] **Step 3: Implement SQLite migrations and transactions** for content, drafts, runs, attempts, completions, downloads, reminders, entitlement cache, and outbox.
- [ ] **Step 4: Implement Supabase reconciliation** using atomic upserts/RPC calls and explicit conflict rules from the specification.
- [ ] **Step 5: Run sync tests twice against a fresh and migrated database** plus type/lint checks.
- [ ] **Step 6: Commit and push** with `feat(sync): persist learning offline and reconcile safely`.

### Task 6: Supabase Authentication and Page 01 Welcome

**Files:**
- Create: `src/features/auth/auth.repository.ts`, `src/features/auth/auth.machine.ts`, `src/features/auth/WelcomeScreen.tsx`, `src/features/auth/AuthSheet.tsx`, `src/features/auth/InstitutionSheet.tsx`
- Create: `src/app/(auth)/welcome.tsx`, `tests/auth/welcome.test.tsx`, `tests/auth/auth-repository.test.ts`
- Create: `supabase/functions/redeem-institution/index.ts`, `supabase/functions/redeem-institution/index.test.ts`

**Interfaces:**
- Produces: `continueAsGuest`, `sendEmailCode`, `verifyEmailCode`, `joinInstitution`, `signOut`, and an auth hydration result consumed by root routing.

- [ ] **Step 1: Write failing tests** for guest, offline guest, email validation, six-digit OTP, resend cooldown, network failure, institution-code errors, restored sessions, and route-flash prevention.
- [ ] **Step 2: Run auth tests** and observe missing UI/repository failures.
- [ ] **Step 3: Implement Supabase anonymous auth and email OTP adapters** with deterministic demo adapters and server-side institution redemption boundary.
- [ ] **Step 4: Implement Page 01 exactly** using extracted brand/mascot assets, reference spacing, sheets, loading/error states, one-time entrance motion, reduced motion, and scroll-safe small-screen layout.
- [ ] **Step 5: Run tests, capture the reference viewport, and document Page 01 overlay differences.**
- [ ] **Step 6: Commit and push** with `feat(auth): deliver animated welcome and access flows`.

### Task 7: Pages 11 and 12 Onboarding Preferences

**Files:**
- Create: `src/features/onboarding/onboarding.machine.ts`, `src/features/onboarding/draft.repository.ts`
- Create: `src/features/onboarding/LanguageScreen.tsx`, `src/features/onboarding/RoutineScreen.tsx`, `src/features/reminders/reminder.scheduler.ts`
- Create: `src/app/(onboarding)/language.tsx`, `src/app/(onboarding)/routine.tsx`
- Create: `tests/onboarding/language.test.tsx`, `tests/onboarding/routine.test.tsx`, `tests/onboarding/reminders.test.ts`

**Interfaces:**
- Produces: persisted `OnboardingDraft`, locale/reason selection events, and `ReminderScheduler.replace(intent)`.

- [ ] **Step 1: Write failing tests** for one language, multiple reasons, disabled CTA hints, restoration, durations, locale weekday order, time-zone/DST behavior, permission branches, and no-duplicate reminders.
- [ ] **Step 2: Run onboarding tests** and observe failure.
- [ ] **Step 3: Implement the data-driven language/reason and routine models** with immediate draft persistence.
- [ ] **Step 4: Implement Pages 11 and 12** with exact grids/cards, native time picker boundary, restrained selection motion, and accessibility announcements.
- [ ] **Step 5: Run tests and produce Page 11/12 visual overlays at reference dimensions.**
- [ ] **Step 6: Commit and push** with `feat(onboarding): add language and routine setup`.

### Task 8: Pages 13 and 02 Placement and Goal Completion

**Files:**
- Create: `src/features/onboarding/PlacementScreen.tsx`, `src/features/onboarding/GoalScreen.tsx`, `src/features/onboarding/placement.ts`
- Create: `src/app/(onboarding)/placement.tsx`, `src/app/(onboarding)/goal.tsx`
- Create: `tests/onboarding/placement.test.tsx`, `tests/onboarding/goal.test.tsx`

**Interfaces:**
- Consumes: `OnboardingDraft` and machine from Task 7.
- Produces: `recommendLevel(score)`, manual override, idempotent onboarding completion, and first-path seed.

- [ ] **Step 1: Write failing tests** for all three level branches, score bands, override, resume, all four goals, disabled CTA, rapid taps, back restoration, and schema-version idempotency.
- [ ] **Step 2: Run focused tests** and confirm failure.
- [ ] **Step 3: Implement placement recommendation and transactional onboarding completion.**
- [ ] **Step 4: Implement Pages 13 and 02** with exact reference order, progress, mascot crops, selected states, and reduced-motion results.
- [ ] **Step 5: Run the complete onboarding suite and capture Page 13/02 overlays.**
- [ ] **Step 6: Commit and push** with `feat(onboarding): complete placement and learning goal flow`.

### Task 9: Page 03 Learn Home and Tab Navigation

**Files:**
- Create: `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/learn.tsx`, `src/app/(tabs)/talk.tsx`, `src/app/(tabs)/profile.tsx`
- Create: `src/features/learning-path/LearnScreen.tsx`, `src/features/learning-path/path.repository.ts`, `src/ui/navigation/BottomTabs.tsx`
- Create: `tests/learning-path/learn.test.tsx`, `tests/navigation/tabs.test.tsx`

**Interfaces:**
- Produces: `PathRepository.getHomeSnapshot(userId)`, current lesson resume intent, course switch intent, quick-review run, and four working tabs.

- [ ] **Step 1: Write failing tests** for new/resumed/completed/locked/offline/conflict states, long names, course switching, quick review, and functional placeholders.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement local-first path queries and background reconciliation.**
- [ ] **Step 4: Implement Page 03** with exact featured card, path rows, streak semantics, fixed bottom tabs, and changed-progress-only animation.
- [ ] **Step 5: Run tests and review the Page 03 overlay and large-text reflow.**
- [ ] **Step 6: Commit and push** with `feat(learn): add local-first learning path home`.

### Task 10: Lesson Scaffolding, Audio Exclusivity, and Page 04

**Files:**
- Create: `src/ui/lesson/LessonScaffold.tsx`, `src/features/lesson-runner/LessonRoute.tsx`
- Create: `src/features/speech/audio.adapter.ts`, `src/features/lesson-runner/screens/ListenScreen.tsx`, `src/app/lesson/[lessonId]/listen.tsx`
- Create: `tests/lesson/audio.test.ts`, `tests/lesson/listen.test.tsx`

**Interfaces:**
- Produces: `AudioPlaybackAdapter`, exclusive line playback, interruption state, lesson close confirmation, and route-safe lesson hydration.

- [ ] **Step 1: Write failing tests** for play/pause/exclusivity/slow rate/interruption/missing asset/offline/resume/close confirmation and accessible transcript bypass.
- [ ] **Step 2: Run focused tests** and observe failure.
- [ ] **Step 3: Implement the deterministic and expo-audio adapters** with cancellable subscriptions and no layered streams.
- [ ] **Step 4: Implement Page 04** with exact scene crop, lines, speaker controls, slow-audio pill, progress, and reading-safe motion.
- [ ] **Step 5: Run tests and review the Page 04 overlay and audio lifecycle logs.**
- [ ] **Step 6: Commit and push** with `feat(lesson): add listening story and audio lifecycle`.

### Task 11: Pages 14 and 15 Phrase Builder and Picture Match

**Files:**
- Create: `src/features/lesson-runner/screens/PhraseBuilderScreen.tsx`, `src/features/lesson-runner/token-order.ts`
- Create: `src/features/lesson-runner/screens/PictureMatchScreen.tsx`
- Create: `src/app/lesson/[lessonId]/phrase-builder.tsx`, `src/app/lesson/[lessonId]/picture-match.tsx`
- Create: `tests/lesson/phrase-builder.test.tsx`, `tests/lesson/picture-match.test.tsx`

**Interfaces:**
- Produces: ID-safe token reorder operations, normalized token evaluation, semantic concept selection, and idempotent result persistence.

- [ ] **Step 1: Write failing tests** for correct/wrong/duplicate tokens, tap reorder accessibility actions, rapid submit, restore, semantic image labels, wrong-then-correct, and asset/audio failures.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement drag/tap token ordering and semantic picture evaluation** through lesson-machine events.
- [ ] **Step 4: Implement Pages 14 and 15** with exact workspaces/grids, restrained gestures, feedback, mascot swaps, and reduced motion.
- [ ] **Step 5: Run tests and review Page 14/15 overlays and gesture performance.**
- [ ] **Step 6: Commit and push** with `feat(lesson): add phrase building and picture matching`.

### Task 12: Pages 16, 05, and 17 Conversation, Comprehension, and Dictation

**Files:**
- Create: `src/features/lesson-runner/conversation.machine.ts`, `src/features/lesson-runner/screens/ConversationScreen.tsx`
- Create: `src/features/lesson-runner/screens/ComprehensionScreen.tsx`, `src/features/lesson-runner/screens/DictationScreen.tsx`, `src/features/lesson-runner/dictation.ts`
- Create: `src/app/lesson/[lessonId]/conversation.tsx`, `src/app/lesson/[lessonId]/comprehension.tsx`, `src/app/lesson/[lessonId]/dictation.tsx`
- Create: `tests/lesson/conversation.test.tsx`, `tests/lesson/comprehension.test.tsx`, `tests/lesson/dictation.test.tsx`

**Interfaces:**
- Produces: graph validation/cycle guards, branch restoration, translation state, exact comprehension retry behavior, Unicode-aware dictation scoring, and idempotent reveal-one-word hints.

- [ ] **Step 1: Write failing tests** for every seeded branch, translation/replay/speech fallback/loop guard, comprehension double-submit and retry, dictation normalization/Unicode/hints/drafts/keyboard visibility.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement content-driven conversation, comprehension, and dictation behavior** using stable IDs and adapter fallbacks.
- [ ] **Step 4: Implement Pages 16, 05, and 17** with exact dark/light surfaces, audio/input controls, stable readable content, and result motion.
- [ ] **Step 5: Run tests and review three visual overlays plus accessibility traversal.**
- [ ] **Step 6: Commit and push** with `feat(lesson): add conversation comprehension and dictation`.

### Task 13: Pages 18, 07, and 09 Pronunciation, Speaking, and Completion

**Files:**
- Create: `src/features/speech/recognition.adapter.ts`, `src/features/speech/scoring.adapter.ts`, `src/features/speech/recording.machine.ts`
- Create: `src/features/lesson-runner/screens/ClickPronunciationScreen.tsx`, `src/features/lesson-runner/screens/SpeakScreen.tsx`, `src/features/lesson-runner/screens/CompleteScreen.tsx`
- Create: `src/app/lesson/[lessonId]/click-pronunciation.tsx`, `src/app/lesson/[lessonId]/speak.tsx`, `src/app/lesson/[lessonId]/complete.tsx`
- Create: `tests/speech/recording.test.ts`, `tests/lesson/pronunciation.test.tsx`, `tests/lesson/speak.test.tsx`, `tests/lesson/complete.test.tsx`

**Interfaces:**
- Produces: permission-safe recording lifecycle, deterministic bounded scores, raw-audio cleanup, `completeLesson` transaction, active-learning duration, and one-time celebration state.

- [ ] **Step 1: Write failing tests** for permission states, timeout/interruption/failure/high-low score/retry/audio deletion, best-attempt preservation, first/reopened/offline completion, duplicate navigation, and timezone streak boundaries.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement deterministic speech/scoring adapters and guarded recording machine** with expo-audio provider boundary.
- [ ] **Step 4: Implement Pages 18, 07, and 09** with exact dark coaching surfaces, static educational diagram, live-state labels, bounded score animation, and finite completion delight.
- [ ] **Step 5: Run speech/completion suites and review overlays, reduced motion, cleanup, and live announcements.**
- [ ] **Step 6: Commit and push** with `feat(lesson): finish speaking coaching and completion`.

### Task 14: Pages 06 and 08 Specialist Practice Activities

**Files:**
- Create: `src/features/lesson-runner/screens/SoundFocusScreen.tsx`, `src/features/lesson-runner/screens/RolePlayScreen.tsx`, `src/features/lesson-runner/roleplay.machine.ts`
- Create: `src/app/lesson/[lessonId]/sound-focus.tsx`, `src/app/lesson/[lessonId]/role-play.tsx`
- Create: `tests/lesson/sound-focus.test.tsx`, `tests/lesson/role-play.test.tsx`

**Interfaces:**
- Consumes: lesson/audio/progress contracts.
- Produces: specialist runs launched from Practice with the same persistence and restoration semantics.

- [ ] **Step 1: Write failing tests** for normal/slow/repeat/no-autoplay audio, all choices, interruptions, every role-play response, wrong-then-correct, branch restoration, and localized copy growth.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement specialist activity machines and persistence.**
- [ ] **Step 4: Implement Pages 06 and 08** with exact dark/bright compositions, real playback indicators, stable choices, and contextual feedback.
- [ ] **Step 5: Run tests and review Page 06/08 overlays, contrast, and reduced motion.**
- [ ] **Step 6: Commit and push** with `feat(practice): add sound focus and guided role-play`.

### Task 15: Page 10 Practice Library and Downloads

**Files:**
- Create: `src/app/(tabs)/practice.tsx`, `src/features/practice-library/PracticeScreen.tsx`, `src/features/practice-library/practice.repository.ts`, `src/features/practice-library/download.repository.ts`
- Create: `tests/practice/library.test.tsx`, `tests/practice/downloads.test.ts`

**Interfaces:**
- Produces: debounced search/filter, specialist launch intents, article routes, checksum-versioned download lifecycle, removal, and storage recovery.

- [ ] **Step 1: Write failing tests** for search/clear/chips/featured/articles, download success/failure/cancel/remove/offline/storage-full, and tabs.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement local-first search and checksum-versioned download repository.**
- [ ] **Step 4: Implement Page 10** with exact cards, chips, thumbnails, active Practice tab, restrained list motion, and accessible download progress.
- [ ] **Step 5: Run tests and review the Page 10 overlay, long lists, and offline states.**
- [ ] **Step 6: Commit and push** with `feat(practice): deliver explore library and offline packs`.

### Task 16: Pages 19 and 20 Premium and Purchase Safety

**Files:**
- Create: `src/features/purchases/purchase.repository.ts`, `src/features/purchases/purchase.machine.ts`, `src/features/premium/OfferScreen.tsx`, `src/features/premium/CheckoutScreen.tsx`
- Create: `src/app/(premium)/offer.tsx`, `src/app/(premium)/checkout.tsx`, `docs/PURCHASES.md`
- Create: `tests/premium/offer.test.tsx`, `tests/premium/checkout.test.tsx`, `tests/premium/purchases.test.ts`
- Create: `supabase/functions/verify-purchase/index.ts`, `supabase/functions/verify-purchase/index.test.ts`

**Interfaces:**
- Produces: `getProducts`, `purchase`, `restore`, `getEntitlements`, `observeTransactionUpdates`, frequency cap, exact origin restoration, and deterministic South African storefront fixtures.

- [ ] **Step 1: Write failing tests** for offer dismissal/frequency/existing subscriber/product failures, plan switching, trial eligibility, double taps, cancel/pending/decline/offline/duplicate callback/verification failure/restore/entitlement idempotency.
- [ ] **Step 2: Run focused tests** and verify failure.
- [ ] **Step 3: Implement deterministic purchase repository and native-store adapter boundary**; never collect raw card data and never grant production entitlement without server verification.
- [ ] **Step 4: Implement Pages 19 and 20** matching visual hierarchy while labeling native platform payment correctly and sourcing all production price/trial copy from product metadata.
- [ ] **Step 5: Run purchase tests and review overlays, long localized prices, reduced motion, and Terms/Privacy routes.**
- [ ] **Step 6: Commit and push** with `feat(premium): add compliant offer and purchase flow`.

### Task 17: Whole-App Accessibility, Motion, and Visual Regression

**Files:**
- Create: `tests/accessibility/all-routes.test.tsx`, `tests/motion/reduced-motion.test.tsx`
- Create: `scripts/reference-manifest.mjs`, `scripts/visual-diff.mjs`, `design/VISUAL_QA.md`
- Modify: all screen and shared UI files with verified corrections only.

**Interfaces:**
- Produces: deterministic captures, regional overlays/diffs, mascot pixel-change gate, reduced-motion smoke coverage, and final visual correction record.

- [ ] **Step 1: Add failing whole-app audits** for route semantics, focus order, target sizes, non-color feedback, large text, cleanup of loops/audio/timers, and deterministic reduced motion.
- [ ] **Step 2: Generate all twenty initial captures and regional diffs** and record objective failures.
- [ ] **Step 3: Fix accessibility, motion interruption, typography, crop, spacing, color, and layout defects** without altering immutable references.
- [ ] **Step 4: Re-run audits and regenerate all visual artifacts** until major regional discrepancies are resolved or explicitly documented as licensed-font/native-status-bar/asset gaps.
- [ ] **Step 5: Run animation lifecycle and mid-range performance checks** with no orphaned loop and no continuous decorative loop beyond the allowed budget.
- [ ] **Step 6: Commit and push** with `fix(quality): align Bua motion accessibility and visuals`.

### Task 18: E2E, CI, Privacy, Operations, and Production Builds

**Files:**
- Create: `.maestro/*.yaml`, `.github/workflows/ci.yml`, `eas.json`
- Create: `README.md`, `PRIVACY.md`, `docs/COMPLETION_REPORT.md`
- Modify: `package.json`, `app.json`, Supabase/EAS configuration as verified.

**Interfaces:**
- Produces: sixteen deterministic Maestro flows, frozen-install CI, signed-build configuration boundary, environment/setup/release docs, privacy policy, and evidence-backed completion report.

- [ ] **Step 1: Write Maestro flows** for the sixteen scenarios in the master prompt with deterministic fixtures and final-state assertions.
- [ ] **Step 2: Run the seeded happy path and at least one recovery flow** and fix any product defect at its owning feature seam.
- [ ] **Step 3: Add CI** for frozen install, format, lint, strict typecheck, unit/RNTL coverage, content validation, Supabase tests, Maestro smoke, visual artifact generation, dependency audit, and production export/build smoke.
- [ ] **Step 4: Write setup, Supabase, `.env`, development-client, offline, asset, microphone privacy, purchase, testing, and release documentation** with no credentials.
- [ ] **Step 5: Run the full release gate:** `npm ci`, format, lint, typecheck, tests, coverage, Supabase tests, Expo Doctor, dependency audit, seeded E2E, visual generation, Android production build smoke, and iOS configuration validation.
- [ ] **Step 6: Verify no secret is tracked, complete the evidence report, commit and push** with `chore(release): verify Bua production readiness`.
