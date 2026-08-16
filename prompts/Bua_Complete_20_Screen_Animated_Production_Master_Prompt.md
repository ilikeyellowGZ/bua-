# Bua — Complete 20-Screen Animated Codex Production Master Prompt

Copy this entire document into Codex at the root of the application repository. The twenty screen references and three Bua asset boards must be placed in `design/reference/bua/` using the filenames in the reference manifest below before implementation begins.

---

## START OF PROMPT FOR CODEX

You are the lead mobile engineer, interaction designer, motion designer, audio engineer, accessibility specialist, and QA owner for a production-quality language-learning application named **Bua**.

Build the complete, working mobile experience described below. Do not stop at static mockups. Every visible control must work; every state transition must be deterministic; all important flows must be tested; the implementation must visually reproduce all twenty reference screens as closely as a native mobile layout allows. The entire application must feel alive through purposeful, interruptible animation, while remaining calm, fast, accessible, and fully usable with reduced motion enabled.

### Product identity

- Application name: **Bua**
- Tagline: **Speak. Connect. Belong.**
- Initial learning language shown in the reference flow: **isiZulu**
- Brand personality: warm, human, culturally grounded, optimistic, calm, playful without feeling childish
- Mascot: **Thandi**, the exact cream-and-navy 2D hedgehog shown in the Bua reference images
- Core palette:
  - `ink`: `#14263D`
  - `sun`: `#F4B942`
  - `aloe`: `#2B9C91`
  - `clay`: `#EF765F`
  - `paper`: `#FAF7EF`
- Inspiration: borrow the clarity, short feedback loops, visible progression, and motivational pacing of excellent learning apps such as Duolingo. Do **not** copy Duolingo's artwork, mascot, layout, wording, trademarks, sound effects, or proprietary assets.

---

## 1. Non-negotiable rules

1. **Screenshot fidelity is a release requirement.** Treat each reference PNG as a visual-regression baseline, not a loose mood board.
2. **Build real native components.** Never ship a reference screenshot as the screen background, a giant clickable image, or an image map.
3. **The mascot must remain exact.** Never replace Thandi with an emoji, stock animal, 3D character, newly generated hedgehog, or approximate vector trace.
4. **Do not silently redraw missing artwork.** Use the exact supplied raster pose. If a clean transparent source is unavailable, use an exact pixel-preserving crop as a temporary asset, record it in `design/ASSET_GAPS.md`, and keep the implementation ready to swap in an approved transparent PNG without layout changes.
5. **Keep Thandi visually consistent across all screens.** Preserve face proportions, cream body, navy quills, orange flower detail, line weight, expression language, and book/bag styling.
6. **All interactions must have complete states:** default, pressed, selected, disabled, loading, success, recoverable error, offline, and accessibility/reduced-motion where relevant.
7. **No dead controls.** A control may navigate to a clearly labeled, functional placeholder route only if the feature is explicitly outside these twenty screens; it must never do nothing.
8. **No fabricated production services.** Wrap authentication, speech recognition, pronunciation scoring, analytics, and content sync in typed adapters. Provide deterministic local implementations and tests; clearly document where real provider credentials are required.
9. **Offline-first learning.** A downloaded/seeded lesson must remain playable without a network connection. Queue attempts and progress locally, then sync idempotently when connectivity returns.
10. **Accessibility is part of “done.”** Meet WCAG 2.2 AA intent and native platform accessibility conventions: correct roles/names/states, large-text support, minimum 44×44 pt targets, contrast, screen-reader announcements, logical focus order, reduced motion, and no color-only communication.
11. **Performance is part of “done.”** Target fluid 60 fps interaction on a mid-range device. Keep animation work off the JS thread where possible, virtualize long lists, avoid unnecessary renders, and measure startup/navigation performance.
12. **Do not mutate the established palette or invent a second design system.** Derive semantic and state tokens from the five brand colors while preserving the reference appearance.
13. **Do not claim completion until the automated test suite and visual comparison report pass.**

---

## 2. Reference-image manifest

Use these exact files. Record each file's SHA-256 in `design/reference/bua/manifest.json` so accidental replacement is detectable.

| ID | Route | Reference file | Native source size |
|---|---|---|---:|
| 01 | `/(auth)/welcome` | `01_bua_welcome.png` | 853×1844 |
| 02 | `/(onboarding)/goal` | `02_bua_goal_onboarding.png` | 887×1774 |
| 03 | `/(tabs)/learn` | `03_bua_home_learning_path.png` | 853×1844 |
| 04 | `/lesson/[lessonId]/listen` | `04_bua_listening_story.png` | 853×1844 |
| 05 | `/lesson/[lessonId]/comprehension` | `05_bua_comprehension.png` | 852×1846 |
| 06 | `/lesson/[lessonId]/sound-focus` | `06_bua_sound_focus.png` | 864×1821 |
| 07 | `/lesson/[lessonId]/speak` | `07_bua_speaking_feedback.png` | 864×1821 |
| 08 | `/lesson/[lessonId]/role-play` | `08_bua_role_play.png` | 862×1824 |
| 09 | `/lesson/[lessonId]/complete` | `09_bua_lesson_complete.png` | 852×1846 |
| 10 | `/(tabs)/practice` | `10_bua_explore_library.png` | 853×1844 |
| 11 | `/(onboarding)/language` | `11_bua_language_onboarding.png` | 853×1844 |
| 12 | `/(onboarding)/routine` | `12_bua_daily_routine_onboarding.png` | 853×1844 |
| 13 | `/(onboarding)/placement` | `13_bua_level_placement.png` | 853×1844 |
| 14 | `/lesson/[lessonId]/phrase-builder` | `14_bua_phrase_builder.png` | 853×1844 |
| 15 | `/lesson/[lessonId]/picture-match` | `15_bua_picture_match.png` | 852×1846 |
| 16 | `/lesson/[lessonId]/conversation` | `16_bua_branching_conversation.png` | 863×1822 |
| 17 | `/lesson/[lessonId]/dictation` | `17_bua_listen_and_type.png` | 853×1844 |
| 18 | `/lesson/[lessonId]/click-pronunciation` | `18_bua_click_pronunciation.png` | 852×1846 |
| 19 | `/(premium)/offer` | `19_bua_premium_paywall.png` | 853×1844 |
| 20 | `/(premium)/checkout` | `20_bua_premium_checkout.png` | 853×1844 |

Asset reference boards:

| Asset board | Reference file | Native source size | Purpose |
|---|---|---:|---|
| Bua brand board | `bua_logo_and_app_icon_sheet.png` | 1536×1024 | wordmark, app icon, monochrome mark, Premium badge |
| Thandi full-body poses | `thandi_full_body_sprite_sheet.png` | 1448×1086 | approved whole-mascot pose and action references |
| Thandi expressions | `thandi_expression_sprite_sheet.png` | 1254×1254 | approved face states, blink cycle, visemes, emotional reactions |

Before coding:

1. Open all twenty screen references and all three asset boards at original resolution.
2. Produce `design/REFERENCE_AUDIT.md` with measured safe-area offsets, content gutters, type hierarchy, component dimensions, corner radii, border weights, shadows, and color sampling.
3. Produce an overlay/contact sheet that confirms all twenty-three files loaded correctly.
4. Define crop-safe rectangles for each Thandi pose in `design/reference/bua/mascot-crops.json`.
5. Create `assets/mascot/README.md` documenting which exact source image supplies each pose.
6. Preserve the original PNG files unchanged.
7. The asset boards are reference atlases, not automatically production-ready transparent sprite sheets. Extract each approved sprite into a separate lossless PNG without redrawing it, verify the alpha channel, remove only the board background, and compare the extracted pixels against the source. If exact extraction is not possible, record the gap and keep the board as the immutable source of truth.
8. Never infer a missing expression or in-between frame by generative redraw. Whole-image transforms, opacity, and approved-frame swaps are allowed; face warping and synthetic interpolation are not.

### Mascot asset contract

Create one component:

```ts
type MascotPose =
  | 'welcome-wave'
  | 'onboarding-peek'
  | 'lesson-book-wave'
  | 'story-companion'
  | 'feedback-mini'
  | 'sound-focus'
  | 'speaking-coach'
  | 'roleplay-companion'
  | 'celebration'
  | 'profile-avatar'
  | 'language-greeting'
  | 'routine-clock'
  | 'placement-thinking'
  | 'phrase-builder-cheer'
  | 'picture-match-point'
  | 'conversation-passenger'
  | 'dictation-listen'
  | 'pronunciation-coach'
  | 'premium-crown'
  | 'premium-checkout';

type MascotProps = {
  pose: MascotPose;
  size: number;
  accessibilityLabel?: string;
  decorative?: boolean;
  motion?: 'none' | 'idle' | 'celebrate' | 'coach';
};
```

`Mascot` must render approved raster assets only. Motion may transform the whole image or swap approved frames; it may not distort facial features or regenerate artwork. Use `resizeMode="contain"`, preserve aspect ratio, and do not crop quills, feet, flower, hands, book, or bag unless the reference deliberately does so.

---

## 3. Required implementation stack

Use the latest **stable** supported versions at implementation time. Check official documentation before pinning versions; do not use preview/beta packages in production.

- Expo + React Native New Architecture
- TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, and no untyped API payloads
- Expo Router for typed navigation
- React Native Reanimated + React Native Gesture Handler for interruptible native-thread motion
- `expo-audio` for playback and recording; do not introduce deprecated `expo-av` in a new app
- `expo-haptics` for sparing tactile confirmation
- `expo-image` for cached raster artwork
- `expo-sqlite` for offline lesson/progress storage
- `expo-secure-store` for tokens and secrets
- TanStack Query for remote state, cancellation, retries, cache hydration, and offline sync
- XState or an equally explicit typed finite-state machine for onboarding, lesson activity, role-play, and sync flows
- Zustand only for small cross-route UI/session state that is not server state and not lesson-machine state
- Zod for runtime validation of content and API payloads
- React Native Testing Library for component/integration tests
- Maestro for device-level end-to-end flows and screenshot capture
- ESLint, Prettier, TypeScript checks, and CI gates

Do not add a dependency if a stable Expo/native primitive solves the need. Isolate all external SDKs behind adapters.

---

## 4. Recommended project structure

```text
app/
  _layout.tsx
  (auth)/welcome.tsx
  (onboarding)/language.tsx
  (onboarding)/goal.tsx
  (onboarding)/routine.tsx
  (onboarding)/placement.tsx
  (premium)/offer.tsx
  (premium)/checkout.tsx
  (tabs)/_layout.tsx
  (tabs)/learn.tsx
  (tabs)/practice.tsx
  (tabs)/talk.tsx
  (tabs)/profile.tsx
  lesson/[lessonId]/listen.tsx
  lesson/[lessonId]/comprehension.tsx
  lesson/[lessonId]/sound-focus.tsx
  lesson/[lessonId]/speak.tsx
  lesson/[lessonId]/role-play.tsx
  lesson/[lessonId]/phrase-builder.tsx
  lesson/[lessonId]/picture-match.tsx
  lesson/[lessonId]/conversation.tsx
  lesson/[lessonId]/dictation.tsx
  lesson/[lessonId]/click-pronunciation.tsx
  lesson/[lessonId]/complete.tsx
src/
  assets/
  components/
    brand/
    buttons/
    feedback/
    lesson/
    mascot/
    navigation/
  content/
  db/
  features/
    auth/
    onboarding/
    learning-path/
    lesson-runner/
    practice-library/
    premium/
    purchases/
    speech/
    streaks/
    sync/
  machines/
  repositories/
  services/
  theme/
  types/
  utils/
design/
  reference/bua/
  REFERENCE_AUDIT.md
  VISUAL_QA.md
e2e/
tests/
```

If the repository already has a coherent structure, preserve it and map these responsibilities into the existing conventions rather than forcing a migration.

---

## 5. Design system contract

Create tokens before page components.

### Semantic colors

```ts
export const color = {
  background: '#FAF7EF',
  surface: '#FFFFFF',
  text: '#14263D',
  textMuted: '#5F6C78',
  primary: '#F4B942',
  primaryPressed: '#DEA230',
  secondary: '#2B9C91',
  secondaryPressed: '#218178',
  accent: '#EF765F',
  success: '#2B9C91',
  info: '#2B9C91',
  danger: '#C94D45',
  border: '#DDD9CF',
  disabledSurface: '#ECE9E2',
  disabledText: '#9A9A95',
  darkLesson: '#10243B',
  darkLessonSurface: '#18334F',
} as const;
```

Verify contrast in rendered screens. Small muted text must still reach 4.5:1. Adjust derived shades rather than changing the five source brand tokens.

### Layout and type

- Use an 8-point spacing system with 4-point micro adjustments only where the screenshot demonstrates them.
- Standard horizontal page gutter: derive from each reference, then expose as a token; target approximately 24 native points on phone width.
- Minimum hit area: 44×44 pt.
- Use the exact supplied typeface if font files are provided. Otherwise choose one rounded humanist sans fallback for the product UI, record the gap, and do not mix unrelated display fonts.
- Use dynamic type with sensible caps so the interface scales without losing actions. At accessibility sizes, allow vertical scrolling and reflow rather than clipping.
- Use a small reusable component set: `BuaButton`, `IconButton`, `ProgressHeader`, `LessonProgress`, `ChoiceCard`, `AudioButton`, `Mascot`, `FeedbackPanel`, `BottomTabs`, `LessonScaffold`, `OfflineBanner`, and `ErrorState`.
- Buttons use a subtle lower edge/shadow only where the reference shows physical depth; pressed state translates down 2 pt and removes/reduces that edge.

### Visual fidelity procedure

For every page:

1. Capture the implemented screen at the reference aspect ratio and at one real iPhone and one Android viewport.
2. Normalize screenshots to the reference canvas without stretching content.
3. Create an alpha overlay and pixel-difference image.
4. Fix major layout, crop, color, typography, and illustration differences.
5. Document unavoidable differences caused by native status bars, font licensing, or missing transparent artwork in `design/VISUAL_QA.md`.
6. Do not use a single global pixel-difference threshold to hide obvious errors. Review by region: header, hero/mascot, primary content, controls, and bottom navigation.

---

## 6. Core domain and logic

Define validated models for at least:

```ts
type LearningGoal =
  | 'colleagues'
  | 'family'
  | 'campus'
  | 'everyday';

type ActivityKind =
  | 'listen'
  | 'comprehension'
  | 'sound-focus'
  | 'speak'
  | 'role-play';

type AttemptStatus =
  | 'started'
  | 'answered'
  | 'correct'
  | 'incorrect'
  | 'skipped'
  | 'queued-for-sync'
  | 'synced';
```

Also model `UserProfile`, `Course`, `Unit`, `Lesson`, `Activity`, `Choice`, `Attempt`, `PronunciationResult`, `RolePlayTurn`, `StreakState`, `LessonCompletion`, `ContentPack`, and `SyncOperation`.

### Lesson state machine

Use one explicit state machine per active lesson:

```text
hydrating
  -> ready
  -> presenting
  -> awaiting_input
  -> evaluating
  -> feedback_correct | feedback_retry | feedback_partial
  -> advancing
  -> completed

From active states:
  -> paused_for_audio_interruption
  -> offline_available | offline_missing_asset
  -> recoverable_error
  -> exiting_confirmation
```

Rules:

- A repeated tap must never submit an activity twice.
- Navigation back/forward must not create duplicate attempts.
- Lesson completion and streak updates must be idempotent by `lessonRunId`.
- Restore an interrupted lesson from persisted state.
- Audio interruption, Bluetooth route change, phone call, app background/foreground, permission denial, and loss of connectivity must be handled explicitly.
- A correct answer may auto-reveal feedback, but advancing to the next activity requires the visible CTA unless the design explicitly indicates automatic movement.
- Wrong answers provide a calm retry path and an explanation; they do not erase completed progress.
- Progress bars derive from completed required activities, not from time elapsed.
- All analytics event payloads must exclude raw microphone recordings and sensitive free-form speech by default.

### Local deterministic demo content

Seed the exact reference onboarding, eight-activity lesson, specialist practice routes, and premium fixture so the complete twenty-screen flow works without a backend:

- User: `Neo`
- Language: `isiZulu`
- Streak: `4 days`
- Current lesson: `Introduce yourself`
- Duration: `12 min`
- Level: `Beginner`
- Greeting phrases include `Sawubona`, `Igama lami nguNeo`, and `Ngiyabonga`
- Story character: `Lerato`
- Featured practice situation: `At the taxi rank`
- Daily goal: `10 min`
- Reminder: `19:30` local time
- Starting choice: `I know a little`
- Premium products: deterministic annual/monthly South African storefront fixtures matching Pages 19–20

Store copy and content outside page components. Use stable IDs and schema validation.

---

## 7. Motion system

Motion must explain state, confirm input, preserve spatial continuity, or provide rare delight. Do not animate every element.

Create shared motion tokens:

```ts
export const motion = {
  instant: 0,
  fast: 140,
  standard: 220,
  emphasis: 320,
  celebration: 520,
  stagger: 45,
  pressScale: 0.985,
} as const;
```

Use responsive ease-out for entrances and state changes. Use critically damped or lightly playful springs only for Thandi, selection confirmation, and the rare completion celebration. All motion must be interruptible. Avoid `scale(0)`, long blocking sequences, parallax that moves readable content, and layout-property animation when transform/opacity can express the state.

### Global animation recipes

- Screen entry: 180–240 ms fade + 8–12 pt upward translation for the primary content; do not animate the native status bar.
- Press: 90–140 ms scale to `0.985` plus haptic only on meaningful confirmation.
- Choice selection: 160–220 ms border/fill change with checkmark scale from `0.9` to `1`; announce the selection.
- Correct feedback: short success haptic, checkmark draw/scale, feedback panel reveal.
- Retry feedback: gentle horizontal 4 pt nudge, no aggressive shake, calm copy.
- Progress change: animate only the newly earned segment; do not replay completed segments on every render.
- Thandi idle: very subtle 2–3% breathing/float loop, disabled for reduced motion and while reading critical text.
- Thandi wave/celebrate: play once on first entry or confirmed completion, then settle.
- Reduced motion: remove travel, bouncing, confetti motion, and looping mascot motion; preserve instantaneous state visibility with optional opacity under 100 ms.

Add tests that assert reduced-motion branches and that repeated navigation does not replay first-time celebration indefinitely.

### Whole-application animation contract

Every route must have motion, but motion is not the same as constant movement. Each screen needs at least one purposeful transition for entry, input, feedback, or continuity; no screen needs every element moving at once.

Use three coordinated layers:

1. **Navigation continuity:** shared header/progress elements remain spatially stable, content enters in the travel direction, and back navigation reverses it. Preserve scroll and focus when dismissing overlays.
2. **Interaction response:** every pressable has a consistent pressed/selected/disabled/loading response. Input animation never replaces explicit text or accessibility state.
3. **Character emotion:** Thandi reacts at high-value moments using only exact approved frames. Idle motion is a whole-sprite transform, not a redrawn or warped body.

Create one `MotionProvider` that reads the native reduced-motion setting, exposes deterministic test mode, and owns:

```ts
type MotionPreference = 'system' | 'full' | 'reduced';

type MotionContextValue = {
  reduceMotion: boolean;
  deterministic: boolean;
  screenTransitionMs: number;
  celebrationEnabled: boolean;
};
```

Animation implementation rules:

- Prefer opacity and transforms on the UI thread. Avoid animating width/height/top/left for high-frequency effects.
- Mount/unmount transitions must be cancellable. Navigating away stops audio, waveform subscriptions, timers, mascot frame loops, and pending animation callbacks.
- Never chain product logic to `setTimeout`. State transitions occur in machines/repositories; animation observes state and calls a guarded completion callback only when necessary.
- Use stable shared values and derived values; do not recreate worklets on every render.
- Looping animation is limited to: subtle Thandi idle when the screen is otherwise static, active audio indicator, microphone meter, and bounded loading feedback. All loops stop when the app backgrounds.
- Haptics are never emitted for visual-only motion, while scrolling, or repeatedly during a loop.
- Use deterministic motion fixtures in screenshot/E2E mode: freeze idle frames, set progress/time data, and expose `testID` values for final states.
- Set a performance budget: no dropped-frame clusters in the primary flows, no more than one continuous decorative loop per screen, and no full-resolution sprite decoding during interaction. Preload the exact next mascot frame and next lesson illustration.

Approved Thandi frame playback:

- `idle`: whole-sprite translateY 0 to -2 pt and scale 1 to 1.012 over 1600–2200 ms, alternating, only when critical text is not being read.
- `blink`: exact open -> half -> closed -> half -> open expression frames over approximately 160 ms; randomized 3–7 second interval; cancel on background. If separate clean frames are unavailable, omit blink.
- `talk`: exact approved viseme frame swaps driven by authored cue timing, capped near 8–12 fps. Never infer phoneme mouths.
- `wave`, `nod`, `point`, `listen`, `coach`, `cheer`, and `crown`: use the corresponding exact full-body or expression sprite. Enter/exit with whole-image opacity/transform only.
- `celebrate`: one finite sequence no longer than 900 ms plus a static final pose. It may not replay when returning to a completed screen.

Per-screen signature motion:

| Page | Signature animation | Trigger | Reduced-motion result |
|---:|---|---|---|
| 01 | Thandi wave; CTA rise | first app entry | static welcome pose and controls |
| 02 | goal-card selection; progress segment | user selection | immediate selected state |
| 03 | path-node focus pulse; streak increment | new lesson/streak only | static focus ring/count |
| 04 | audio progress ring; sentence reveal | playback | static playback indicator/text |
| 05 | answer check and feedback reveal | submit | final correct/incorrect panel |
| 06 | mouth-step emphasis; sound waveform | listen/practice | static step and level bar |
| 07 | recording meter; score arcs | record/result | static meter and final scores |
| 08 | dialogue bubble/choice continuity | new turn/choice | instant stable bubbles |
| 09 | finite Thandi celebration/confetti | first committed completion | final celebration composition |
| 10 | featured-card/section reveal; download morph | first load/download | static list and status icon |
| 11 | language-card stagger; Thandi greeting | first load/selection | final grid and selected state |
| 12 | duration/weekday selection; clock tick | selection | immediate selected state |
| 13 | card elevation; Thandi nod | level choice | selected outline and static pose |
| 14 | drag lift/drop; sentence success sweep | tile interaction/result | instant tile position/result |
| 15 | correct ring and tiny water bounce | answer result | final check and feedback |
| 16 | layered scene entry; viseme dialogue | turn/audio | static scene and dialogue |
| 17 | audio ring/wave; answer underline | playback/result | static play state/final marking |
| 18 | articulation step and score meters | demo/record/result | static steps and scores |
| 19 | one premium glint; benefit stagger | first offer entry | static badge and benefits |
| 20 | plan check/price crossfade; success check | selection/purchase | immediate plan and result |

Animation QA must include real-device recordings at 1× and slowed playback, interruption during every interactive animation, app background/foreground, navigation spam, VoiceOver/TalkBack, `reduceMotion=true`, and a performance trace on a mid-range device.

---

## 8. Shared service adapters

Define interfaces before provider code:

```ts
interface AuthRepository {
  continueAsGuest(): Promise<UserProfile>;
  sendEmailCode(email: string): Promise<void>;
  verifyEmailCode(email: string, code: string): Promise<UserProfile>;
  joinInstitution(code: string): Promise<UserProfile>;
  signOut(): Promise<void>;
}

interface SpeechRecognitionAdapter {
  requestPermission(): Promise<'granted' | 'denied' | 'blocked'>;
  start(locale: string): Promise<void>;
  stop(): Promise<{ transcript: string; audioUri?: string }>;
  cancel(): Promise<void>;
}

interface PronunciationScoringAdapter {
  score(input: {
    expectedText: string;
    transcript: string;
    locale: string;
    audioUri?: string;
  }): Promise<PronunciationResult>;
}

interface ProgressRepository {
  saveAttempt(attempt: Attempt): Promise<void>;
  completeLesson(input: LessonCompletion): Promise<StreakState>;
  enqueueSync(operation: SyncOperation): Promise<void>;
}
```

Ship deterministic local/mock adapters so the app and test suite work immediately. Provider-backed adapters must be optional and configured through documented environment variables. Never hard-code credentials.

---

## 9. Page-specific build prompts

Implement these prompts in order. Each page inherits every global requirement above.

### Page 01 — Welcome and access

**Reference:** `design/reference/bua/01_bua_welcome.png`  
**Route:** `/(auth)/welcome`

Reproduce the warm paper background, oversized navy `Bua` wordmark with clay speech mark, teal tagline, exact full-body Thandi welcome pose, flower/leaf ground details, large sun-yellow `Get started` CTA, outlined `Log in` CTA, and small institution-code link. Respect the large calm negative space and the reference's vertical rhythm.

Behavior:

- `Get started` creates/resumes a local guest session and navigates to Page 02.
- `Log in` opens a native modal/sheet with email input, six-digit verification-code flow, resend countdown, loading/error states, and dismiss/back support.
- `Join with institution code` opens an institution-code form with validation, helpful error copy, and a cancel path.
- On launch, hydrate auth state. An authenticated, onboarded user routes to Page 03; an authenticated user without a goal routes to Page 02.
- Prevent route flashes while hydrating; show the centered Bua mark on `paper` only if hydration exceeds 250 ms.

Motion:

- Wordmark and tagline fade in over 220 ms.
- Thandi enters with a 320 ms gentle rise and plays the exact wave pose once.
- Buttons stagger by 45 ms.
- Press depth mirrors the reference's tactile yellow button.
- Reduced motion displays the final state immediately.

Acceptance tests:

- Guest, login, invalid email, invalid code, resend cooldown, network error, institution code, restore-session, and screen-reader flows pass.
- No button is obscured by small screens; content scrolls if necessary.

### Page 02 — Goal onboarding

**Reference:** `design/reference/bua/02_bua_goal_onboarding.png`  
**Route:** `/(onboarding)/goal`

Reproduce the top back arrow, reference progress bar exactly as pictured, Thandi peeking from behind the main white rounded sheet, centered title `What would you like to do first?`, supporting copy, four outlined goal cards, selected teal state with trailing checkmark, and bottom sun-yellow `Continue` button. In the expanded onboarding machine this is the final preference step even though the original art does not print a numeric step label; do not add a visible number that is absent from the reference.

Exact choices:

1. `Speak with colleagues`
2. `Connect with family`
3. `Study and campus life`
4. `Everyday conversations`

Behavior:

- This is single select. `Continue` is disabled until a goal is selected.
- Persist selection immediately and again transactionally with onboarding completion.
- Back returns to Page 13 without losing a valid selection. A legacy deep link without an onboarding draft may fall back to Page 01.
- `Continue` seeds/recommends the first isiZulu learning path and routes to Page 03.
- Restore the previous selection after process death.

Motion:

- The progress segment enters at the exact reference length over 300 ms and is marked internally as the final onboarding preference step.
- Thandi peeks up 16 pt with a lightly damped spring.
- Goal cards enter with a restrained 35 ms stagger.
- Selection changes use color/border/checkmark animation only; do not move the list.

Acceptance tests:

- Disabled CTA, all four selections, restore, back, rapid repeated taps, large text, and keyboard/screen-reader selection pass.

### Page 03 — Learn home and path

**Reference:** `design/reference/bua/03_bua_home_learning_path.png`  
**Route:** `/(tabs)/learn`

Reproduce the header greeting `Sawubona, Neo`, circular Thandi avatar, isiZulu selector, `4 days` streak pill, warm featured lesson card, exact Thandi book/wave pose, `Introduce yourself` title, `12 min · Beginner`, `3 of 8 activities`, dark navy `Continue lesson` CTA, `Your path` list, numbered unit markers, completion/current/locked states, `Quick review` card, and four-item bottom tab bar with `Learn` active.

Behavior:

- Hydrate profile, streak, current lesson, path, downloads, and sync state from local storage first; reconcile with the network in the background.
- `Continue lesson` resumes the exact incomplete activity and routes to Page 04 for the seeded run.
- Completed unit opens review; current unit opens its lesson list; locked unit explains the prerequisite in an accessible sheet.
- Language selector opens a functional course switcher. Switching updates content atomically.
- Quick review starts a short review run from due phrases.
- Bottom tabs navigate to Learn, Practice (Page 10), Talk placeholder, and Profile placeholder. Placeholders must contain a working back/tab path and a truthful `Coming next` state.
- Streak is derived from completion history, never incremented by merely opening the app.

Motion:

- Featured card enters first, path rows follow with 35 ms stagger.
- Current lesson progress animates only when it has changed.
- Avatar plays a single subtle acknowledgement on first daily open.
- Tab changes use native/standard transitions; no heavy carousel movement.

Acceptance tests:

- New user, resumed lesson, fully completed unit, locked unit, no network, sync conflict, language switch, long username, large text, and tab navigation pass.

### Page 04 — Listening story

**Reference:** `design/reference/bua/04_bua_listening_story.png`  
**Route:** `/lesson/[lessonId]/listen`

Reproduce the close control, segmented lesson progress, `Listen` label, large KWA CAFE scene artwork, the two audio/text lines, circular speaker controls, translations, centered `Slow audio` pill, and sun-yellow `Continue` CTA. The scene must use the exact supplied illustration and exact embedded Thandi companion artwork from the reference.

Seed copy:

- `Sawubona! Igama lami nguNeo.` / `Hello! My name is Neo.`
- `Sawubona, Neo. Mina nginguLerato.` / `Hello, Neo. I'm Lerato.`

Behavior:

- Prefetch local audio. The screen works offline when the lesson pack is downloaded.
- Speaker buttons toggle play/pause for their line and stop any other line first.
- Highlight the currently spoken sentence/word only if time-coded metadata exists; do not fake word timings.
- `Slow audio` plays an approved slower recording or a high-quality 0.75× mode without pitch distortion.
- Respect silent mode/platform audio rules and restore playback after permitted interruptions.
- `Continue` becomes active after the user listens to at least one required line or activates an explicit transcript-accessibility path; route to Page 05.
- Close opens an exit confirmation that preserves progress.

Motion:

- Progress segment fills on entry.
- Speaker icon uses a subtle waveform/pulse only during playback.
- Text highlight follows actual audio timing.
- Do not animate the scene while the user is reading.

Acceptance tests:

- Play, pause, switch lines, slow audio, audio interruption, missing asset, offline pack, resume, close confirmation, and VoiceOver/TalkBack controls pass.

### Page 05 — Comprehension check

**Reference:** `design/reference/bua/05_bua_comprehension.png`  
**Route:** `/lesson/[lessonId]/comprehension`

Reproduce the close control, segmented `3 of 8` progress, `Understand` label, question `What did Lerato say?`, supporting line `Choose the best meaning.`, cropped Lerato image, round replay button, three stacked answer cards, selected teal state with trailing check, Thandi feedback panel, and sun-yellow `Continue` button.

Choices:

- `I'm Lerato.` — correct
- `I'm leaving.`
- `I'm studying.`

Correct feedback copy:

- `That’s right`
- `Mina nginguLerato means “I’m Lerato.”`

Behavior:

- Initial state shows choices and a disabled/check-answer CTA or selection-to-check behavior consistent with the reference layout.
- Selecting a choice does not immediately navigate.
- On evaluation, persist the attempt exactly once.
- Correct answer reveals the feedback panel and changes the CTA to `Continue`.
- Incorrect answer explains the meaning, keeps the user in the activity, and allows retry without losing lesson progress.
- Replay button plays Lerato's line and exposes slow audio through an accessible secondary action.
- Continue routes to Page 06.

Motion:

- Choice selection uses border/fill/checkmark animation.
- Feedback panel expands/fades without animating readable text position excessively.
- Correct: subtle success haptic. Incorrect: gentle nudge and neutral haptic, never a red punitive flash.

Acceptance tests:

- Every option, repeat selection, double submit, replay, wrong-then-correct, restore-after-kill, large text, and screen-reader feedback announcement pass.

### Page 06 — Sound focus

**Reference:** `design/reference/bua/06_bua_sound_focus.png`  
**Route:** `/lesson/[lessonId]/sound-focus`

Reproduce the dark navy lesson surface, close control, `4 of 8` segmented progress, `Sound focus` label, exact small Thandi sound-focus pose, question `Which word did you hear?`, supporting copy, circular waveform/replay control, three large cream answer cards, secondary `Play slowly` and `Hear again` pills, and sun-yellow `Check answer` CTA.

Choices:

- `Sawubona` — correct for seeded audio
- `Siyabonga`
- `Hamba`

Behavior:

- Auto-play once only when user preferences and platform policies permit; otherwise focus the replay control.
- `Hear again` plays normal speed. `Play slowly` plays approved slow audio or quality 0.75× playback.
- `Check answer` remains disabled until selection.
- Wrong answer provides phonetic/audio support and allows retry.
- Correct answer persists the attempt and routes to Page 07 after explicit continue.
- Dark mode colors must preserve contrast and exact reference mood.

Motion:

- Waveform reflects real playback state, not a decorative infinite loop.
- Selected card gets a 160 ms sun border/fill response.
- Correct progress segment illuminates once.

Acceptance tests:

- Normal/slow/repeat audio, no-autoplay preference, all choices, interruption, offline, high contrast, reduced motion, and screen-reader labels pass.

### Page 07 — Speaking and pronunciation feedback

**Reference:** `design/reference/bua/07_bua_speaking_feedback.png`  
**Route:** `/lesson/[lessonId]/speak`

Reproduce the dark navy surface, close control, `5 of 8` progress, `Speak` label, exact coaching Thandi pose, instruction `Say the phrase`, large phrase `Sawubona. Igama lami nguNeo.`, circular live waveform and teal microphone button, `Good clarity` state, three-part phrase feedback card, `Try again` secondary CTA, and sun-yellow `Continue` CTA.

Behavior:

- Ask for microphone permission only when the user taps the microphone, with a pre-permission explanation.
- State flow: idle → requesting permission → listening → processing → feedback → retry/continue.
- Use voice activity detection or a clear manual stop; enforce a reasonable timeout and show remaining state accessibly.
- Score through `PronunciationScoringAdapter`. Never present a mock score as a real linguistic assessment outside demo mode.
- Seeded deterministic demo result:
  - `Sawubona` correct
  - `Igama lami` correct
  - `nguNeo` needs more practice
  - overall `Good clarity`
- `Try again` resets only the current attempt. `Continue` preserves the best attempt and routes to Page 08.
- Permission denied: offer `Open settings` and a non-microphone accessibility fallback such as listen-and-self-confirm or typed practice; never trap the user.
- Do not store raw audio after scoring unless the user explicitly opts in.

Motion:

- Microphone button transitions into listening with a 220 ms ring expansion.
- Waveform is driven by actual input level when available.
- Processing uses a restrained loop with a text label.
- Feedback rows reveal in order with 45 ms stagger.

Acceptance tests:

- Granted, denied, blocked, interrupted, silence timeout, speech service offline, partial result, retry, privacy cleanup, reduced motion, and screen-reader live announcements pass.

### Page 08 — Guided role-play

**Reference:** `design/reference/bua/08_bua_role_play.png`  
**Route:** `/lesson/[lessonId]/role-play`

Reproduce the close control, `7 of 8` segmented progress, teal `Role-play` label, title `Meet a classmate`, subtitle `Outside your first lecture`, university/campus scene, Lerato and exact Thandi companion artwork, audio prompt card, Thandi instruction card `Answer with your name.`, and three outlined response choices above the disabled/active `Choose a reply` CTA area.

Seed prompt:

- Lerato: `Sawubona! Igama lakho ngubani?`
- Translation: `Hello! What is your name?`

Choices:

- `Igama lami nguNeo.` — best answer
- `Ngiyabonga.`
- `Hamba kahle.`

Behavior:

- Implement role-play as a branching state machine driven by content JSON, not route-specific `if` statements.
- Replay prompt audio through the speaker control.
- Selecting a response updates the CTA to an active `Choose this reply`/reference-consistent state.
- Evaluate on CTA press, show brief contextual feedback, persist the chosen turn, then advance.
- Correct completion routes to Page 09. Non-best responses explain context and allow retry.
- Support future typed and spoken branches through the same `RolePlayTurn` schema even if the seeded screen uses choices.

Motion:

- Scene enters with a gentle fade; do not animate the people while reading.
- Prompt card appears first, instruction card second, answer choices third.
- Chosen reply gains a teal border/check without shifting neighboring options.

Acceptance tests:

- Replay, all choices, rapid taps, branch restore, wrong-then-correct, offline, exit/resume, localization growth, and accessibility pass.

### Page 09 — Lesson completion

**Reference:** `design/reference/bua/09_bua_lesson_complete.png`  
**Route:** `/lesson/[lessonId]/complete`

Reproduce the warm radial-paper celebration background, small brand confetti marks, title `Lesson complete`, subtitle `You can now introduce yourself and ask someone's name.`, exact celebratory Thandi pose with `Aloe` speech bubble, botanical ground details, large `12 min` metric, `active learning` label, metrics `8 activities`, `5 phrases`, `4 day streak`, outlined skill-unlocked card, navy `Keep learning` CTA, and `Back to home` link.

Behavior:

- Enter only from a completed lesson run or a valid deep link to a previously completed result.
- Commit lesson completion, XP/progress, skill unlock, and streak in one idempotent transaction keyed by `lessonRunId`.
- If sync is unavailable, show the completed local result and queue one sync operation.
- Reopening this page never adds another streak day or duplicates rewards.
- `Keep learning` routes to the next recommended lesson. `Back to home` routes to Page 03 and clears only transient run state.
- The displayed duration uses measured active-learning time, excluding background/paused time; the seeded reference result is 12 minutes.

Motion:

- This is the rare delight moment: progress completes, Thandi celebrates once, the Aloe bubble pops in from 0.94 scale, metrics count/reveal, and a restrained confetti burst settles within 520 ms.
- No endless confetti. Do not obscure text or buttons.
- Reduced motion shows final state instantly with a static celebratory composition.

Acceptance tests:

- First completion, reopen, double navigation, offline queue, sync retry, streak timezone boundary, next lesson, home, reduced motion, and screen-reader summary pass.

### Page 10 — Explore and practice library

**Reference:** `design/reference/bua/10_bua_explore_library.png`  
**Route:** `/(tabs)/practice`

Reproduce the `Explore` header, circular Thandi profile avatar, rounded search field, horizontal category chips, sun-yellow featured `At the taxi rank` card with artwork and circular arrow CTA, `Culture and connection` section with two illustrated cards, `Phrase packs` list with thumbnails, phrase counts, download buttons, and four-item bottom tab bar with `Practice` active.

Exact visible categories:

- `Everyday`
- `Campus`
- `Work`
- `Travel`

Exact visible content:

- Featured: `At the taxi rank` — `6 min · Listen and speak`
- `Ubuntu in conversation` — `3 min read`
- `When to use Sawubona` — `3 min read`
- Phrase pack: `Meeting new people` — `12 phrases`
- Phrase pack: `Getting around` — `16 phrases`

Behavior:

- Search filters titles, phrases, situations, and tags with a 200–300 ms debounce.
- Chips are horizontally scrollable and update results without replacing the header.
- Featured card opens its situation lesson through the lesson runner.
- Culture cards open readable article/story routes with offline error states.
- Download controls expose queued/downloading/progress/downloaded/error states and remain accessible.
- Downloaded packs are stored with version/checksum and can be removed from a details sheet.
- Bottom tabs function exactly as on Page 03; `Practice` is active here.
- Empty search, offline search, download failure, and storage-full states must have clear recovery copy.

Motion:

- Featured card and sections enter with restrained stagger.
- Chip selection uses a fast fill transition.
- Download icon morphs through progress to checkmark without rotating forever.
- List items do not animate on every keystroke; use layout transitions only where they clarify result changes.

Acceptance tests:

- Search, clear, each chip, featured route, article route, download success/failure/cancel/remove, offline content, storage full, tab navigation, large text, and screen reader pass.

### Page 11 — Language and motivation onboarding

**Reference:** `design/reference/bua/11_bua_language_onboarding.png`  
**Route:** `/(onboarding)/language`

Reproduce the light paper background, back arrow, segmented `1 of 4` progress bar, compact Thandi greeting pose, centered title `What would you like to speak?`, subtitle `Choose one to begin. You can add more later.`, six illustrated language cards in a two-column grid, `Why are you learning?` heading, four reason chips, and bottom navy `Continue` button.

Exact language choices:

- `isiZulu`
- `Sesotho`
- `Setswana`
- `isiXhosa`
- `Afrikaans`
- `English`

Exact learning reasons:

- `Family`
- `Travel`
- `Work`
- `School`

Behavior:

- Permit exactly one initial language and one or more learning reasons. Make the selection model data-driven so more languages can be added later.
- Keep `Continue` disabled until a language and at least one reason are selected. Disabled state must remain legible and have an accessibility hint explaining what is missing.
- Persist each selection immediately to the onboarding draft so process death or back navigation restores it.
- On continue, save the target locale and reason IDs, advance onboarding progress, and route to Page 12.
- Tapping the selected language again does not clear the only language; it remains selected. Reason chips toggle independently.

Motion:

- On first entry, Thandi performs one approved-frame wave and settles into the subtle idle loop.
- Language cards reveal row by row with 35–45 ms stagger. A selected card changes border/fill in 180 ms and its checkmark springs once without moving the grid.
- The progress bar grows only its first segment. It must not replay when returning from the next page.
- Reduced motion renders final positions immediately and uses only a short color transition.

Acceptance tests:

- Each language, multiple reason combinations, disabled CTA, restore after relaunch, back/forward persistence, localization growth, large text, screen reader selection states, and reduced motion pass.

### Page 12 — Daily routine and reminders onboarding

**Reference:** `design/reference/bua/12_bua_daily_routine_onboarding.png`  
**Route:** `/(onboarding)/routine`

Reproduce the `2 of 4` progress indicator, Thandi holding/gesturing toward a clock, title `Make Bua fit your day`, subtitle `A little practice every day makes speaking feel natural.`, four duration cards, reminder time selector, seven weekday toggles, streak note, and bottom navy `Continue` button.

Exact duration choices:

- `5 min` — `A quick start`
- `10 min` — `Build momentum`
- `15 min` — `Make real progress`
- `20 min` — `Go further`

Behavior:

- Select exactly one daily target. Seed `10 min` only for the visual-demo fixture; real users must actively confirm or keep the seeded recommendation.
- Tapping the reminder time opens the platform time picker. Weekday buttons are independent toggles; default to the user's locale-aware weekdays, never assume Sunday/Monday order.
- Request notification permission only after the user confirms a reminder—not on page mount. Explain denied and blocked states with a settings recovery action.
- Schedule/cancel local notifications through a typed `ReminderScheduler`; rescheduling must replace, not duplicate, existing notifications.
- Respect time-zone and daylight-saving changes. Store local wall-clock intent plus IANA zone; recalculate scheduled triggers when the zone changes.
- `Continue` commits the duration, reminder, and weekdays transactionally and advances to Page 13.

Motion:

- Thandi's clock hand may tick once; no continuous ticking.
- Duration selection uses a calm 180 ms outline/fill transition and one small haptic. Time-picker and permission education use native sheets.
- Weekday toggles pop from 0.96 to 1.0 on selection. The streak note fades in after a valid schedule exists.
- Reduced motion removes the pop and Thandi loop but preserves all selected states.

Acceptance tests:

- All durations, time changes, each weekday, locale week order, permission granted/denied/blocked, reschedule without duplicates, DST/time-zone changes, restart restore, and accessibility pass.

### Page 13 — Starting level and placement choice

**Reference:** `design/reference/bua/13_bua_level_placement.png`  
**Route:** `/(onboarding)/placement`

Reproduce the `3 of 4` progress bar, thinking/clipboard Thandi, title `Where should we begin?`, subtitle `Choose the starting point that feels right.`, three large illustrated options, reassurance `You can change your level anytime.`, and bottom `Continue` button.

Exact options:

- `I'm new` — `Start with greetings and everyday words.`
- `I know a little` — `Take a quick 3-minute placement check.`
- `I can hold a conversation` — `Focus on fluency, listening and confidence.`

Behavior:

- Permit one selected starting level. Persist it immediately.
- `I'm new` creates a beginner path and routes to Page 03 after onboarding completion.
- `I know a little` routes to a deterministic 3-minute placement flow built from existing activity primitives. Score bands determine the starting unit, but the user can override the recommendation.
- `I can hold a conversation` creates a fluency-focused path with advanced listening and speaking unlocked.
- The seeded demo fixture selects `I know a little`; production must not silently claim a level without consent.
- Completion of this page stores the recommended level and routes to Page 02 for the final goal selection. Page 02 then marks onboarding complete idempotently and records the schema version for future migrations.

Motion:

- The chosen card rises no more than 2 pt with a shadow/outline transition; do not make unselected cards jump.
- Thandi reacts with one approved nod/check pose after selection, then settles.
- On placement-test choice, the CTA label crossfades to `Start placement check`; other choices use `Continue`.

Acceptance tests:

- All three branches, placement score bands, manual override, resume placement, onboarding idempotency, app update migration, reduced motion, large text, and screen readers pass.

### Page 14 — Drag-and-tap phrase builder

**Reference:** `design/reference/bua/14_bua_phrase_builder.png`  
**Route:** `/lesson/[lessonId]/phrase-builder`

Reproduce the top close control, `2 of 8` activity progress, title `Build the sentence`, English prompt `Hello, my name is Neo.`, speaker replay button, rounded sentence workspace, draggable isiZulu word tiles, unused-word bank, compact encouraging Thandi pose, back control, and bottom answer CTA.

Seeded correct answer:

```text
Sawubona. Igama lami nguNeo.
```

Seeded tile bank includes the correct words plus plausible distractors such as `ngikhona`, `wena`, and `kahle`. Store tokens with stable IDs; punctuation belongs to token metadata and is rendered correctly.

Behavior:

- Support both drag-and-drop and tap-to-move. VoiceOver/TalkBack users must be able to select a tile and use explicit `Move before`, `Move after`, and `Return to word bank` actions.
- Preserve duplicate words by ID, not text. Keep reading order and accessibility traversal identical to the visual sentence order.
- The CTA is disabled while the answer area is empty. Pressing it evaluates a normalized token sequence without destroying the user's arrangement.
- Correct: lock tiles, save attempt, reveal success feedback, and advance. Incorrect: identify the first meaningful mismatch, offer `Try again`, and retain movable tiles.
- Replay pronunciation through cached audio; provide loading, unavailable, interrupted, and offline states.

Motion:

- Dragged tile lifts 4 pt and scales to 1.02; the insertion gap animates without reflow jank. On drop, use a critically damped spring.
- Tap-to-move uses a highlighted source state and 180 ms layout transition.
- Correct sequence sends one subtle sun-colored sweep through the completed sentence and triggers Thandi's approved cheer pose. Incorrect feedback uses a 4 pt nudge, never an aggressive shake.

Acceptance tests:

- Correct/wrong orders, duplicate tokens, drag, tap alternative, screen-reader reorder actions, rotation/resizing, audio unavailable, rapid submissions, state restore, and reduced motion pass.

### Page 15 — Picture-match vocabulary

**Reference:** `design/reference/bua/15_bua_picture_match.png`  
**Route:** `/lesson/[lessonId]/picture-match`

Reproduce the close control, `3 of 8` progress, title `Match the word`, prompt `Tap the picture for:`, large isiZulu word `amanzi` with speaker control, illustrated answer grid, correct green/teal selection treatment, feedback `Kulungile!`, translation `amanzi = water`, `Listen again`, Thandi pointing/celebrating, back control, and bottom next button.

Behavior:

- Load answer assets and audio before interaction or show an explicit skeleton/loading state. Each image must have a meaningful accessibility label, never `image 1`.
- Permit one choice per attempt. Correct locks the grid and reveals feedback; incorrect marks the choice, reads a short hint, and permits a second attempt according to lesson policy.
- The correct concept is keyed by semantic concept ID, not filename or array index.
- Replay is debounced and cancels prior playback cleanly.
- Save attempts idempotently and prefetch the next activity only after the result is stable.

Motion:

- Cards enter with a short row stagger. Press uses 0.985 scale.
- Correct selection draws the check ring and lets the water illustration make a tiny 2–3 pt buoyant motion once. Wrong selection shows a calm nudge.
- Feedback panel reveals upward 8 pt; Thandi swaps to the exact approved pointing/cheer sprite without cross-warping facial features.

Acceptance tests:

- Correct first try, wrong then correct, audio replay, missing image, offline cache, rapid taps, attempt restore, screen-reader image labels/selection states, and reduced motion pass.

### Page 16 — Branching animated conversation

**Reference:** `design/reference/bua/16_bua_branching_conversation.png`  
**Route:** `/lesson/[lessonId]/conversation`

Reproduce the navy immersive scene, close control, `4 of 8` progress, illustrated South African taxi-rank/environment layers, exact Thandi passenger/coach art, dialogue bubbles, speaker icons, three reply cards, `Show translation`, `Say this reply`, and `Choose another` controls.

Seeded turn:

- Prompt: `Sawubona! Unjani namhlanje?`
- Best reply: `Kahle, ngiyabonga. Wena?`
- Alternatives: `Igama lami nguNeo.` and `Hamba kahle.`

Behavior:

- Implement a content-driven finite-state machine: `loading -> promptPlaying -> awaitingChoice -> choiceSelected -> evaluating -> feedback -> nextTurn/completed/error`.
- Each branch has stable turn/choice IDs, optional translation, audio, relationship tone, and next-turn ID. Prevent cycles unless explicitly marked as practice loops.
- `Show translation` toggles a locally cached translation without changing the branch.
- `Say this reply` requests microphone permission at the moment of use, records, transcribes/scores through adapters, and falls back to `Choose this reply` if speech service is unavailable.
- `Choose another` returns to the current turn without losing completed prior turns.
- Exit saves branch state and audio privacy choices; resume reconstructs the exact current turn.

Motion:

- The scene uses layered depth only during entry/exit; readable bubbles remain still while active.
- The active speaker bubble appears with a 180 ms fade/8 pt rise; replies stagger 35 ms. Mouth movement may use only approved viseme frames and only while the character audio is playing.
- On spoken reply, waveform reacts to microphone amplitude; cap updates to avoid JS-thread churn. Disable waveform travel for reduced motion and present a static level meter.

Acceptance tests:

- Every branch, translation toggle, replay, microphone granted/denied/blocked, transcription timeout, fallback choice, exit/resume, loop guard, offline text/audio, reduced motion, and screen-reader conversation order pass.

### Page 17 — Listen and type dictation

**Reference:** `design/reference/bua/17_bua_listen_and_type.png`  
**Route:** `/lesson/[lessonId]/dictation`

Reproduce close control, `6 of 8` progress, title `What do you hear?`, large circular audio control with `Tap to play`, focused text input, optional phoneme/letter hints, `Need help?`, `Reveal one word`, `Slow audio`, native keyboard state, compact listening Thandi, and submit CTA.

Seeded target:

```text
Ngiyaphila, ngiyabonga.
```

Behavior:

- Audio play states are `idle/loading/playing/paused/ended/error`. Rapid taps never layer two streams.
- Normalize whitespace, case, apostrophes, and punctuation for scoring while preserving the user's original input for display. Content may flag diacritics or punctuation as required for languages that need them.
- `Reveal one word` spends one hint token and inserts only the next missing correct token; it is idempotent if pressed rapidly and announced to screen readers.
- `Slow audio` switches to an approved slow recording or stable playback-rate support; never pitch-shift speech unintelligibly.
- Keyboard avoidance must keep the input and CTA visible. Submitting with an empty field is disabled.
- Save draft input locally on every debounced edit; restore on return.

Motion:

- Audio button uses a contained pulse only while playing, with no infinite scale loop; use an animated ring or waveform that stops instantly on pause.
- Correct words may underline/fill from left to right after evaluation. Incorrect segments are highlighted accessibly with text explanations, not color alone.
- Thandi changes from listening to encouraging pose only after result state changes.

Acceptance tests:

- Exact/normalized answers, incorrect spelling, Unicode composition, hint use, slow audio, audio failure/interruption, keyboard sizes, draft restore, rapid taps, reduced motion, and accessibility pass.

### Page 18 — isiZulu click-pronunciation coach

**Reference:** `design/reference/bua/18_bua_click_pronunciation.png`  
**Route:** `/lesson/[lessonId]/click-pronunciation`

Reproduce the close control, `7 of 8` progress, title `Learn the click`, isiZulu `q` sound badge, labeled mouth/tongue instruction diagram, three short articulation steps, `Listen`, `Your turn`, animated recording waveform/timer, timing/clarity/confidence metrics, feedback `Great! Clear!`, `Hear it again`, Thandi coaching pose, and bottom continue action.

Exact articulation steps:

1. `Place the tongue behind your upper teeth`
2. `Pull it down quickly`
3. `Release the click`

Behavior:

- Use an authored educational audio example and localized explanatory copy. Do not claim clinical or absolute phonetic accuracy from a generic speech recognizer.
- Microphone state machine: `idle -> requestingPermission -> ready -> recording -> processing -> result`, with explicit `denied`, `blocked`, `interrupted`, `timeout`, and `serviceError` branches.
- Cap recording duration, display elapsed time, allow cancel, and delete raw local audio after scoring unless the user explicitly opts in to retain/review it.
- `PronunciationResult` contains bounded 0–100 timing, clarity, and confidence scores plus actionable feedback. Deterministic mocks must reproduce the reference result.
- A low score encourages retry without shame. A service failure offers listen/retry and permits lesson continuation according to course policy.

Motion:

- Animate the mouth diagram only with simple arrows/step emphasis; never warp the anatomical illustration.
- While recording, waveform uses metered input amplitude at a throttled rate. During processing, replace it with a calm finite progress indicator.
- Metric arcs/bars animate once from previous to new score in 320 ms. The exact Thandi coach sprite swaps in at success; approved blink/viseme frames may run only in their proper states.
- Reduced motion shows static mouth steps, static level meter, and final score without counting animation.

Acceptance tests:

- Permission states, cancel, max duration, interruption, deterministic high/low score, failure fallback, raw-audio deletion, repeated retry, offline sample audio, reduced motion, and accessible announcements pass.

### Page 19 — Bua Premium offer

**Reference:** `design/reference/bua/19_bua_premium_paywall.png`  
**Route:** `/(premium)/offer`

Reproduce the warm paper-to-sun premium background, close control, crowned celebratory Thandi using the exact supplied artwork, title `Speak without limits`, subtitle `Unlock every lesson and keep learning anywhere.`, Bua Premium badge, four benefit rows, Free-vs-Premium comparison, testimonial card, localized annual-plan teaser, primary premium CTA, `Continue with Free`, and transparent trial disclaimer.

Exact benefits:

- `Unlimited speaking practice`
- `Offline lessons and downloads`
- `Detailed pronunciation coaching`
- `No ads, just learning`

Seeded display copy: `From R49.99/month with annual plan`. The real UI must use localized storefront product metadata; never hard-code a price as the purchase source of truth.

Behavior:

- Show the offer from explicit premium entry points or frequency-capped natural moments, never after every lesson and never as an unskippable surprise.
- Close and `Continue with Free` both dismiss without degrading already-earned progress.
- Primary CTA fetches available products and routes to Page 20 with the selected/recommended product. Loading, products-unavailable, offline, parental-controls, and already-subscribed states are complete.
- The comparison uses real entitlements. If an item is available free, do not falsely mark it premium.
- Testimonial and ratings are approved content only; do not fabricate social proof in production.

Motion:

- Premium badge glints once with a masked 320 ms sweep. Crown/Thandi rises 8 pt and settles; no looping sparkle storm.
- Benefit rows reveal with a 40 ms stagger, then remain static. Primary CTA has standard press motion only.
- Dismiss transitions back to the exact prior route and scroll state. Reduced motion removes glint, travel, and stagger.

Acceptance tests:

- Close, free continuation, product fetch success/failure/offline, existing subscriber, frequency cap, restore entry, localized long prices, reduced motion, and screen-reader benefit/comparison semantics pass.

### Page 20 — Premium plan and secure checkout

**Reference:** `design/reference/bua/20_bua_premium_checkout.png`  
**Route:** `/(premium)/checkout`

Reproduce the secure-checkout header, small premium Thandi/brand mark, title `Choose your Bua Premium plan`, annual and monthly plan cards, savings badge, cancellation copy, payment method section, trial summary, `Due today` row, renewal date/price, primary `Start free trial` CTA, no-charge assurance, and `Restore purchases`, `Terms`, and `Privacy` links.

Seeded South African storefront fixture:

- Annual: `R599.99 / year`, equivalent `R49.99 per month`
- Monthly: `R79.99 / month`
- Trial: `7-day free trial`
- Due today: `R0.00`
- Seeded renewal sentence: `Then R599.99/year starting 23 Aug`

Behavior and purchase correctness:

- Implement a typed `PurchaseRepository` with `getProducts`, `purchase`, `restore`, `getEntitlements`, and `observeTransactionUpdates` methods. Use a deterministic local mock for tests.
- For native digital subscriptions, the actual transaction must use the current platform-approved StoreKit/App Store or Google Play Billing purchase flow. Product ID, trial eligibility, localized price, renewal interval, tax wording, and currency come from verified store product metadata.
- The reference card/Apple Pay area may be used only in an allowed external/web checkout implementation. Do not collect raw card numbers in React Native, store them, log them, or imitate a native-store payment form. On native builds, preserve the visual hierarchy but label the method as the platform account and let the operating-system purchase sheet collect payment.
- Default the recommended annual plan only after products load. Changing plans updates the trial, due-today, and renewal summary atomically.
- Disable the CTA while a purchase is in flight. Double taps and replayed transaction callbacks must never create duplicate entitlement writes.
- Verify completed transactions through the configured entitlement backend before granting production access; deterministic demo mode may use signed fixtures. Handle pending/ask-to-buy, user cancelled, declined, network lost after charge, already owned, and verification failure.
- `Restore purchases` is always available and reports restored/no-purchases/error states clearly. Terms and Privacy open working localized documents.
- On verified success, activate `premium`, persist entitlement expiry/source, celebrate once, and return to the route that opened the offer. Never block basic free learning if checkout fails.

Motion:

- Selecting a plan uses a 180 ms outline/check transition and a restrained total-price crossfade; card heights must not jump.
- On purchase press, keep the selected summary visible, replace CTA label with a progress state, and present the native purchase sheet. Do not use an indeterminate full-screen blocker.
- Verified success triggers one sun-to-aloe check animation and an approved happy Thandi frame; failure returns to a stable actionable state without shaking the whole screen.
- Reduced motion shows state changes and final confirmation immediately.

Acceptance tests:

- Annual/monthly switch, localized metadata, trial eligible/ineligible, double tap, cancel, pending, decline, offline, charged-then-network-loss recovery, duplicate callback, verification failure, restore success/none/error, existing entitlement, terms/privacy, reduced motion, and screen reader pass.

---

## 10. Navigation and end-to-end flow

The seeded happy path must work exactly:

```text
01 Welcome
  -> 11 Language onboarding
  -> 12 Daily routine onboarding
  -> 13 Starting level / placement
  -> 02 Goal onboarding
  -> 03 Learn home
  -> 04 Listening
  -> 14 Phrase builder
  -> 15 Picture match
  -> 16 Branching conversation
  -> 05 Comprehension
  -> 17 Listen and type
  -> 18 Click pronunciation
  -> 07 Speaking feedback
  -> 09 Lesson complete
  -> 03 Learn home

03 Learn home <-> 10 Explore/Practice
10 Explore/Practice -> 06 Sound focus or 08 Guided role-play
03 Learn home or 10 Explore/Practice -> 19 Premium offer -> 20 Checkout -> originating route
```

The seeded eight-activity lesson uses Pages 04, 14, 15, 16, 05, 17, 18, and 07 in that exact progress order. Pages 06 and 08 remain fully functional specialist activities launched from Learn/Practice and must use the same lesson-runner contracts. Deep links must validate route parameters and recover gracefully when a lesson or asset is missing. Android hardware back and iOS gestures must preserve machine state and follow platform expectations. Do not allow the user to navigate into impossible activity states. Premium dismissal and completion must return to the exact originating route and scroll state.

---

## 11. Testing and quality gates

### Unit and model tests

- Zod schemas and content validation
- Lesson progress calculation
- Streak timezone logic
- Active-learning duration calculation
- Idempotent completion
- Retry and sync backoff
- Role-play branch evaluation
- Pronunciation-result mapping
- Audio-playback exclusivity
- Token reorder and normalized dictation scoring
- Reminder scheduling, DST, and no-duplicate replacement
- Placement score-band recommendation and user override
- Branching-conversation graph validation and cycle guards
- Purchase entitlement verification, idempotency, renewal metadata, and restore mapping
- Trial eligibility and localized storefront presentation

### React Native Testing Library

- Render and interact with every page state
- Verify button enabled/disabled states
- Verify accessibility names, roles, selected/checked state, and live announcements
- Verify reduced-motion branches
- Verify no duplicate submission on rapid taps

### Maestro end-to-end

Create deterministic device flows for:

1. First launch through completed lesson
2. Wrong answer then correct recovery
3. Microphone permission denied fallback
4. Offline downloaded lesson
5. Interrupted lesson restored after relaunch
6. Explore search and phrase-pack download
7. Completion reopened without duplicate streak/reward
8. Large-text smoke flow
9. Complete four-step onboarding and relaunch-state restore
10. Phrase-builder drag and screen-reader tap alternative
11. Branching conversation with speech-service fallback
12. Dictation hints and click-pronunciation microphone interruption
13. Premium offer dismisses back to origin
14. Annual purchase success using deterministic store fixture
15. Purchase cancel, pending, duplicate callback, and restore flows
16. Whole-app reduced-motion smoke flow

### Visual regression

- Capture all twenty seeded states at their reference canvas/aspect ratio plus the three immutable asset boards in the audit contact sheet.
- Save current, overlay, and diff images as CI artifacts.
- Add per-region tolerances for native status bar/font rasterization only.
- Fail the build for large position, size, crop, palette, or asset differences.
- Require human review when mascot-region pixels change.

### CI gates

The merge gate runs:

```text
format check
lint
TypeScript strict check
unit tests with coverage
React Native component/integration tests
content schema validation
Maestro seeded happy path
visual regression generation
production build smoke check
```

No ignored failures, no `test.skip` for required flows, and no broad visual-baseline replacement without reviewing diffs.

---

## 12. Skill set to use during production

Research snapshot: **2026-08-16**. Inspect every third-party skill before installation. Prefer publishers with passing security audits, pin reviewed source revisions in CI, and never run a skill's arbitrary scripts or request credentials until its repository and permissions have been reviewed. If a skill conflicts with the product contract above, this product contract wins.

### 12A. Fifteen Skills.sh skills — engineering and production reliability

Install with the command shown on each linked page. For the Expo skills, the command follows `npx skills add https://github.com/expo/skills --skill <skill-name>`.

| # | Skill | Why Bua needs it | Use in phase |
|---:|---|---|---|
| 1 | [react-native-best-practices](https://www.skills.sh/software-mansion-labs/skills/react-native-best-practices) | Reanimated, gestures, audio, SVG, threading, and native performance from React Native specialists | foundation, motion, performance review |
| 2 | [vercel-react-native-skills](https://www.skills.sh/vercel-labs/agent-skills/vercel-react-native-skills) | Navigation, list performance, native APIs, rendering, and production React Native patterns | foundation and code review |
| 3 | [building-native-ui](https://www.skills.sh/expo/skills/building-native-ui) | Native tabs, sheets, lists, haptics, and platform-appropriate components | shared components and navigation |
| 4 | [native-data-fetching](https://www.skills.sh/expo/skills/native-data-fetching) | Offline caching, background refresh, cancellation, and sync | repositories and offline mode |
| 5 | [expo-native-ui](https://www.skills.sh/expo/skills/expo-native-ui) | Expo-specific native controls, storage, media, icons, and Reanimated guidance | components, media, storage |
| 6 | [expo-router](https://www.skills.sh/expo/skills/expo-router) | Typed routes, tabs, modals, headers, and deep linking | route architecture |
| 7 | [expo-project-structure](https://www.skills.sh/expo/skills/expo-project-structure) | A safe starting structure for a new Expo project | initial scaffold only |
| 8 | [expo-design-system](https://www.skills.sh/expo/skills/expo-design-system) | Shared tokens and reusable cross-screen components | design-system build |
| 9 | [expo-deployment](https://www.skills.sh/expo/skills/expo-deployment) | Correct production build, signing, distribution, and store-release workflow | release configuration |
| 10 | [expo-dev-client](https://www.skills.sh/expo/skills/expo-dev-client) | Test microphone/audio/native modules on physical devices | native integration testing |
| 11 | [expo-cicd-workflows](https://www.skills.sh/expo/skills/expo-cicd-workflows) | Repeatable preview, build, test, and release workflows | CI/CD |
| 12 | [expo-observe](https://www.skills.sh/expo/skills/expo-observe) | Startup/navigation/custom-event performance measurement | performance verification |
| 13 | [react-native-testing](https://www.skills.sh/callstack/react-native-testing-library/react-native-testing) | Correct RNTL patterns for native component behavior and accessibility | component/integration tests |
| 14 | [tdd](https://www.skills.sh/mattpocock/skills/tdd) | Red-green-refactor discipline for lesson and sync state machines | domain logic |
| 15 | [improve-codebase-architecture](https://www.skills.sh/mattpocock/skills/improve-codebase-architecture) | Identify shallow modules and strengthen adapter/test seams before release | architecture review |

Recommended install order:

```bash
# Inspect each linked page and repository first.
npx skills add https://github.com/software-mansion-labs/skills --skill react-native-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-native-skills
npx skills add https://github.com/expo/skills --skill building-native-ui
npx skills add https://github.com/expo/skills --skill native-data-fetching
npx skills add https://github.com/expo/skills --skill expo-native-ui
npx skills add https://github.com/expo/skills --skill expo-router
npx skills add https://github.com/expo/skills --skill expo-project-structure
npx skills add https://github.com/expo/skills --skill expo-design-system
npx skills add https://github.com/expo/skills --skill expo-deployment
npx skills add https://github.com/expo/skills --skill expo-dev-client
npx skills add https://github.com/expo/skills --skill expo-cicd-workflows
npx skills add https://github.com/expo/skills --skill expo-observe
npx skills add https://github.com/callstack/react-native-testing-library --skill react-native-testing
npx skills add https://github.com/mattpocock/skills --skill tdd
npx skills add https://github.com/mattpocock/skills --skill improve-codebase-architecture
```

### 12B. Fifteen AI UX Playground skills — fidelity, motion, accessibility, and copy

Open each page and use its **Codex** installation action. Review the source repository and `SKILL.md` before installing. Some of these skills are web-oriented; apply their visual, writing, accessibility, and motion principles to React Native primitives rather than copying web-only CSS/ARIA instructions literally.

| # | Skill | Why Bua needs it | Use in phase |
|---:|---|---|---|
| 1 | [Image to Code](https://aiuxplayground.com/skills/image-to-code/) | Systematic screenshot analysis and faithful layout/component extraction | reference audit and every page |
| 2 | [Design Handoff](https://aiuxplayground.com/skills/design-handoff/) | Exact measurements, states, edge cases, motion, and accessibility specs | pre-implementation handoff |
| 3 | [Design Engineering](https://aiuxplayground.com/skills/emil-design-eng/) | Craft-level component details and animation decisions | shared UI and motion |
| 4 | [Frontend Design](https://aiuxplayground.com/skills/frontend-design/) | Prevent generic AI-looking output and preserve a distinctive product identity | design implementation review |
| 5 | [Impeccable](https://aiuxplayground.com/skills/impeccable/) | End-to-end hierarchy, accessibility, motion, typography, spacing, and edge-case audit | polish and final audit |
| 6 | [Better UI](https://aiuxplayground.com/skills/better-ui/) | Surfaces, shadows, optical alignment, icon states, press feedback, and restrained micro-interactions | component polish |
| 7 | [Better Typography](https://aiuxplayground.com/skills/better-typography/) | Type hierarchy, wrapping, scaling, and readable interface copy | typography pass |
| 8 | [Better Colors](https://aiuxplayground.com/skills/better-colors/) | Contrast, semantic tokens, state colors, and dark lesson surfaces | color/accessibility pass |
| 9 | [Better Layout](https://aiuxplayground.com/skills/better-layout/) | Grouping, spacing, reading order, target separation, RTL, and localization stress | layout pass |
| 10 | [Better Accessibility](https://aiuxplayground.com/skills/better-accessibility/) | Focus, semantics, screen readers, hit areas, zoom/large text, and reduced motion | every component and QA |
| 11 | [Design Motion Principles](https://aiuxplayground.com/skills/design-motion-principles/) | A coherent, purposeful motion language rather than decorative animation | motion specification |
| 12 | [Animate](https://aiuxplayground.com/skills/animate/) | Implement interruptible, performant, purposeful animations with exact timing | motion implementation |
| 13 | [Review Animations](https://aiuxplayground.com/skills/review-animations/) | Strict post-build review of easing, duration, frequency, interruption, performance, and a11y | motion QA |
| 14 | [Animation Vocabulary](https://aiuxplayground.com/skills/animation-vocabulary/) | Shared language for transitions, choreography, anticipation, overshoot, continuity, and feedback | motion specification and code review |
| 15 | [Find Animation Opportunities](https://aiuxplayground.com/skills/find-animation-opportunities/) | Identify meaningful animation moments while preventing gratuitous motion and distraction | per-screen motion audit |

### Skill execution order

Use skills in focused passes; do not activate all 30 simultaneously.

1. **Reference pass:** Image to Code → Design Handoff → Better Layout → Better Typography → Better Colors
2. **Foundation pass:** expo-project-structure → expo-router → expo-design-system → expo-native-ui → building-native-ui
3. **Logic pass:** tdd → native-data-fetching → react-native-testing → improve-codebase-architecture
4. **Page implementation:** react-native-best-practices → vercel-react-native-skills → Better UI → Frontend Design
5. **Motion planning pass:** Animation Vocabulary → Find Animation Opportunities → Design Motion Principles
6. **Motion implementation/QA:** Animate → Review Animations
7. **Accessibility pass:** Better Accessibility, including full reduced-motion and screen-reader review
8. **Release pass:** Impeccable → expo-dev-client → expo-observe → expo-cicd-workflows → expo-deployment

Never let a skill overwrite Bua's brand, introduce web-only primitives into native code, weaken tests, or substitute generated mascot art.

---

## 13. Required deliverables

Do not provide only a plan. Produce:

- Working iOS and Android app source
- All twenty routes and the seeded end-to-end flows
- Original untouched twenty screen references and three asset boards in `design/reference/bua/`
- `design/REFERENCE_AUDIT.md`
- `design/ASSET_GAPS.md`
- `design/VISUAL_QA.md` with overlays/diffs and unresolved deviations
- Brand/design tokens and reusable components
- Exact pixel-preserving extracted Bua/Thandi production assets where extraction is possible, with alpha verification and an asset-source manifest
- A documented whole-app motion system, approved mascot frame map, reduced-motion alternatives, and real-device animation QA recordings
- Local/offline seed content and audio manifest
- Typed service adapters and deterministic mocks
- Unit, integration, E2E, accessibility, and visual-regression tests
- CI workflow and production build configuration
- `README.md` with setup, development client, tests, environment variables, offline behavior, asset policy, and release steps
- `PRIVACY.md` covering microphone/audio handling and retention
- `PURCHASES.md` covering product IDs, native-store compliance, entitlement verification, restore behavior, trial eligibility, and test fixtures
- A completion report listing what works, what requires real credentials, test results, and known limitations

---

## 14. Definition of done

The work is done only when:

- All twenty screenshots are represented by functional native routes, and all three asset boards remain immutable sources of truth.
- The exact Bua identity and exact Thandi artwork are preserved.
- Every screen has purposeful, interruptible motion plus a complete reduced-motion state; no orphaned loops, timers, audio, or callbacks survive navigation/backgrounding.
- The seeded user can complete the entire lesson without a backend.
- The same downloaded lesson works offline.
- Audio, microphone, denied-permission, interruption, and service-failure paths recover cleanly.
- Progress, lesson completion, and streak updates are idempotent.
- Reminder updates do not duplicate notifications, and premium transaction callbacks do not duplicate entitlements.
- Native subscription purchases use platform-approved billing, verified store metadata, safe restoration, and never collect or log raw card details.
- Every page works with VoiceOver/TalkBack, large text, high contrast, and reduced motion.
- The test and type/lint suites pass.
- Visual overlay/diff artifacts have been reviewed and major discrepancies fixed.
- A physical-device development build has passed the happy path on iOS and Android.
- No known dead controls, silent errors, duplicated rewards, raw-audio privacy leaks, or placeholder mascot substitutions remain.

Start by auditing the repository and reference files. Then create a short execution plan with vertical slices. Implement the seeded happy path first, page by page, with tests in the same slice. Keep working until the complete definition of done is satisfied; do not stop after scaffolding.

## END OF PROMPT FOR CODEX
