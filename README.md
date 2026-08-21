# Bua — Speak. Connect. Belong.

Bua is an Expo/React Native isiZulu learning application implemented from the twenty supplied mobile references. The app contains the complete onboarding, learning path, eight-activity lesson, specialist practice, completion, Explore, Talk, Profile, and Premium flows. All Thandi and scene artwork is extracted from the approved files under `design/reference/bua/`; no generated substitute mascot is used.

## Run locally

Requirements: Node 22.13+ and npm 11.

```bash
npm ci
copy .env.example .env
npm run env:prepare
npm start
```

Use `npm run web`, `npm run android`, or `npm run ios` for a target. The checked-in `.env.example` contains placeholders only. The actual `.env` is ignored and must never be committed.

## Environment modes

- `EXPO_PUBLIC_DEMO_MODE=true`: deterministic offline auth, lesson speech feedback, and storefront fixtures. This mode is fully runnable without external services.
- `EXPO_PUBLIC_DEMO_MODE=false`: Supabase auth/session persistence and production service adapters. Provide an active Supabase URL/publishable key through local or EAS environment secrets.
- Server/service-role, AI-provider, store, and signing credentials belong in Supabase/EAS/provider secret stores, never in `EXPO_PUBLIC_*` variables.

## Quality gates

```bash
npm run assets:extract
npm run validate
npm run export
npm run doctor
```

`validate` runs formatting, lint, strict TypeScript, and Jest. Visual checkpoints are retained in `design/audit/`. CI repeats deterministic asset extraction, validation, and static web export.

## Backend

The Supabase schema, RLS, functions, seed, and pgTAP suites live in `supabase/`. See `docs/SUPABASE_VALIDATION.md` before connecting a production project. The local-first SQLite/outbox path keeps learning available offline and reconciles idempotently.

## Release

`eas.json` defines development, preview, and production profiles. Before store submission, configure the Expo project owner/project ID, signing credentials, active Supabase project, native subscription products, verified entitlement service, licensed audio/speech provider, and public legal/support URLs. Current external gaps are recorded in `design/ASSET_GAPS.md` and `docs/COMPLETION_REPORT.md`.
