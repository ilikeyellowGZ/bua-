import { suggestFix } from '@/features/monitoring/suggest-fix';

describe('suggestFix', () => {
  it('recognizes a network failure', () => {
    expect(suggestFix(new Error('Network request failed'))).toMatch(/connectivity/i);
  });

  it('recognizes a denied admin check', () => {
    expect(suggestFix(new Error('Administrator access required'))).toMatch(/institution_memberships/i);
  });

  it('recognizes an RLS policy violation', () => {
    expect(suggestFix(new Error('new row violates row-level security policy'))).toMatch(
      /Row-Level Security/i,
    );
  });

  it('recognizes an expired or missing auth session', () => {
    expect(suggestFix(new Error('JWT expired'))).toMatch(/session/i);
  });

  it('recognizes a duplicate-key conflict', () => {
    expect(suggestFix(new Error('duplicate key value violates unique constraint'))).toMatch(
      /idempotent/i,
    );
  });

  it('recognizes a timeout', () => {
    expect(suggestFix(new Error('request timed out'))).toMatch(/backoff/i);
  });

  it('recognizes a validation failure', () => {
    expect(suggestFix(new Error('Invalid input: expected string'))).toMatch(/schema/i);
  });

  it('falls back to a generic hint for an unrecognized error', () => {
    expect(suggestFix(new Error('something entirely novel happened'))).toMatch(
      /no pattern matched/i,
    );
  });

  it('works for a non-Error thrown value', () => {
    expect(suggestFix('a network timeout string')).toMatch(/connectivity|backoff/i);
  });
});
