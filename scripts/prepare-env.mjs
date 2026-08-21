import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const environmentPath = resolve(process.cwd(), '.env');
const source = await readFile(environmentPath, 'utf8');
const values = new Map();

for (const line of source.split(/\r?\n/u)) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/u);
  if (match?.[1] !== undefined && match[2] !== undefined) {
    values.set(match[1], match[2]);
  }
}

const aliases = [
  ['EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'],
  ['EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_PUBLISHABLE_KEY'],
];

const additions = [];

for (const [publicName, sourceName] of aliases) {
  if (values.has(publicName)) {
    continue;
  }

  const sourceValue = values.get(sourceName);
  if (sourceValue === undefined || sourceValue.length === 0) {
    throw new Error(`Cannot prepare ${publicName}: ${sourceName} is missing from .env`);
  }

  additions.push(`${publicName}=${sourceValue}`);
}

if (!values.has('EXPO_PUBLIC_APP_ENV')) {
  additions.push('EXPO_PUBLIC_APP_ENV=development');
}

if (!values.has('EXPO_PUBLIC_DEMO_MODE')) {
  additions.push('EXPO_PUBLIC_DEMO_MODE=true');
}

if (additions.length > 0) {
  await writeFile(environmentPath, `${source.trimEnd()}\n${additions.join('\n')}\n`, 'utf8');
}

const preparedNames = additions.map((line) => line.slice(0, line.indexOf('=')));
console.log(
  preparedNames.length > 0
    ? `Prepared public Expo variables: ${preparedNames.join(', ')}`
    : 'Public Expo variables were already prepared.',
);
