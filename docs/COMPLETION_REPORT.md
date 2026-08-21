# Bua completion report

Date: 21 August 2026

## Delivered

- All twenty supplied screen concepts are represented in the routed product flow.
- Exact approved Thandi sprites and bounded scene crops are reproducibly extracted with hashes.
- Welcome, email/guest/institution auth seams, five-step onboarding, Learn, Explore, Talk, and Profile.
- Eight-activity lesson order: Listen → Phrase builder → Picture match → Conversation → Comprehension → Dictation → Click pronunciation → Speak → Complete.
- Sound-focus and role-play specialist activities.
- Offline SQLite state, outbox synchronization, idempotent reconciliation, and secure Supabase schema/RLS/functions.
- Premium offer, typed storefront products, safe platform-account checkout boundary, idempotent deterministic purchase fixture, restore, and legal screens.
- Reduced-motion-aware entrances, selection/press feedback, light/navy lesson transitions, accessible roles/names/live feedback.
- CI and EAS release profiles; `.env` is ignored and `.env.example` contains placeholders only.

## Verified locally

- Formatting, ESLint, strict TypeScript, and all Jest suites pass.
- Expo static export completes for Android, iOS, and web.
- Production-route screenshots render without page errors at 390 × 844.
- Generated foreground asset RGB and output hashes are checked by deterministic extraction scripts.

## External release gates

These require owner/provider credentials and cannot be truthfully completed from this repository alone:

1. Replace the inactive Supabase endpoint, deploy migrations, and run `npx supabase test db` in Docker-capable CI.
2. Add licensed isiZulu recordings and the production audio adapter. Current controls expose deterministic accessible demo state without claiming playback.
3. Configure a real pronunciation provider/on-device model; deterministic results are visibly labelled as demo practice.
4. Configure App Store/Google Play products and server-side transaction verification. The app never grants production entitlement from hard-coded raster prices.
5. Add EAS project/signing/store credentials and public production Terms, Privacy, support, and account-deletion URLs.
6. Replace derived checkerboard alpha with original transparent mascot exports if supplied; foreground art is already preserved exactly.

Until those external gates are supplied, the application is a production-structured, fully runnable deterministic demo—not a store-submittable live-service release.
