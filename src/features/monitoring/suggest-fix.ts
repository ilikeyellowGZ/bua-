type Rule = { pattern: RegExp; fix: string };

const rules: readonly Rule[] = [
  {
    pattern: /network|fetch failed|unreachable|econnreset|offline/i,
    fix: 'Looks like a connectivity failure. It should retry automatically via the sync outbox once online; if it keeps failing, check the Supabase project status and the device network.',
  },
  {
    pattern: /administrator access required/i,
    fix: 'The caller is not an admin. Grant it via institution_memberships.role = \'administrator\' for that user, or confirm you meant to call this as a regular user.',
  },
  {
    pattern: /row-level security|rls|permission denied|42501/i,
    fix: 'A Row-Level Security policy blocked this. Confirm the caller is authenticated and owns the row it is trying to read/write, or check the relevant policy in supabase/migrations.',
  },
  {
    pattern: /not authenticated|jwt|invalid session|session expired/i,
    fix: 'The Supabase session is missing or expired. Confirm authRepository.restoreSession() succeeded before this call, or prompt the user to sign in again.',
  },
  {
    pattern: /duplicate key|unique constraint|already exists/i,
    fix: 'A unique-constraint conflict. If the write goes through an idempotent upsert (on conflict do nothing), this is likely a safe replay and not a real bug — check whether it is being reported more than once for the same operation id.',
  },
  {
    pattern: /timeout|timed out/i,
    fix: 'The request timed out. Retry with backoff, or check whether the downstream service (Supabase, a third-party provider) is degraded.',
  },
  {
    pattern: /invalid|validation|parse|zod/i,
    fix: 'Input failed validation. Compare the payload against its schema in src/content/schemas.ts or the relevant zod schema, and check for a shape mismatch upstream.',
  },
  {
    pattern: /quota|rate limit/i,
    fix: 'A usage quota or rate limit was hit. Check AI_DAILY_LIMIT / provider dashboard, and consider the rule-based fallback path if one exists for this feature.',
  },
];

/**
 * Best-effort, pattern-matched remediation hint for the console/telemetry log.
 * Not a substitute for reading the stack trace — just a faster first guess.
 */
export function suggestFix(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const match = rules.find((rule) => rule.pattern.test(message));
  return match?.fix ?? 'No pattern matched. Read the stack trace and reproduce locally.';
}
