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
const auditDirectory = resolve(process.cwd(), 'design', 'audit');
await mkdir(auditDirectory, { recursive: true });

for (const route of routes) {
  // See capture-lesson-slice.mjs: a fresh context per route isolates each
  // page's OPFS storage so expo-sqlite's web backend never races two open
  // access handles on the same local database file.
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto(`http://127.0.0.1:4173${route.path}`, { waitUntil: 'networkidle' });
  await page.getByText(route.ready, { exact: true }).first().waitFor();
  // See capture-lesson-slice.mjs: expo-image's web crossfade can still be
  // mid-animation right when the ready text appears.
  await page.waitForTimeout(600);
  if (errors.length > 0) throw new Error(`${route.path}: ${errors.join(' | ')}`);
  await page.screenshot({ path: resolve(auditDirectory, route.file), fullPage: true });
  await context.close();
}

console.log(`PRODUCT_SLICE_SCREENSHOTS=${routes.length}`);
await browser.close();
