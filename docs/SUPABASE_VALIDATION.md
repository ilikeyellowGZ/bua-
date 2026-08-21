# Supabase validation status

The Bua schema is defined in three ordered migrations with seeded public content, owner-indexed RLS, least-privilege grants, and idempotent completion/sync functions. Repository checks validate the security contract during `npm test`.

## External validation required

On 2026-08-21, this workstation could not execute `supabase start` because Docker Desktop and Podman are not installed. Consequently, the pgTAP files in `supabase/tests/` are committed but still require execution in a Docker-capable CI or development environment:

```text
npx supabase start
npx supabase db reset
npx supabase test db
```

The configured Supabase project URL also failed DNS resolution during the read-only `npm run supabase:check`. No secret was printed or committed. Replace the URL and publishable key in the ignored `.env` with an active project, then deploy the migrations and rerun the check. The deterministic offline/demo app does not depend on remote availability.
