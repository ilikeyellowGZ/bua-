import { readFile } from 'node:fs/promises';

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/u)
      .filter((line) => line && !line.trimStart().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

const values = parseEnv(await readFile('.env', 'utf8'));
const url = values.EXPO_PUBLIC_SUPABASE_URL ?? values.SUPABASE_URL;
const key = values.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? values.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) throw new Error('Missing public Supabase URL or publishable key in .env.');

const response = await fetch(`${url}/rest/v1/lessons?select=id&limit=1`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
  signal: AbortSignal.timeout(15_000),
});

if (!response.ok) {
  throw new Error(`Supabase schema health check failed with HTTP ${response.status}.`);
}

const rows = await response.json();
if (!Array.isArray(rows)) throw new Error('Supabase schema health check returned invalid JSON.');
console.log(`SUPABASE_PUBLIC_SCHEMA_OK rows=${rows.length}`);
