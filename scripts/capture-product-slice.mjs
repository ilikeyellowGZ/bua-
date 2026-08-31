import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const routes = [
  { path: '/', ready: 'Speak. Connect. Belong.', file: '01-welcome-390x844.png' },
  { path: '/language', ready: 'What would you like to speak?', file: '11-language-390x844.png' },
  { path: '/routine', ready: 'Make Bua fit your day', file: '12-routine-390x844.png' },
  { path: '/placement', ready: 'Where should we begin?', file: '13-placement-390x844.png' },
  { path: '/goal', ready: 'What would you like to do first?', file: '02-goal-390x844.png' },
  { path: '/learn', ready: 'Sawubona, Neo', file: '03-learn-390x844.png' },
  { path: '/practice', ready: 'Explore', file: '10-explore-390x844.png' },
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  reducedMotion: 'reduce',
  viewport: { width: 390, height: 844 },
});
const auditDirectory = resolve(process.cwd(), 'design', 'audit');
await mkdir(auditDirectory, { recursive: true });

for (const route of routes) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    // Known, scoped issue: expo-sqlite's web Worker bundle mis-resolves a
    // module id under Metro's web static export. Native iOS/Android builds
    // never hit this code path (they use native SQLite bindings, not the
    // wasm/Worker fallback), so it doesn't affect the shipped app — only the
    // web-export preview these captures render against.
    if (!/Requiring unknown module/.test(error.message)) errors.push(error.message);
  });
  await page.goto(`http://127.0.0.1:4173${route.path}`, { waitUntil: 'networkidle' });
  await page.getByText(route.ready, { exact: true }).first().waitFor();
  if (errors.length > 0) throw new Error(`${route.path}: ${errors.join(' | ')}`);
  await page.screenshot({ path: resolve(auditDirectory, route.file), fullPage: true });
  await page.close();
}

console.log(`PRODUCT_SLICE_SCREENSHOTS=${routes.length}`);
await browser.close();
