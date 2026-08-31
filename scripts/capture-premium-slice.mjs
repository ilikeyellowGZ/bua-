import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const routes = [
  ['/offer', 'Speak without limits', '19-premium-offer-390x844.png'],
  ['/checkout', 'Choose your Bua Premium plan', '20-premium-checkout-390x844.png'],
  ['/profile', 'Learn without limits', 'profile-premium-entry-390x844.png'],
];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const auditDirectory = resolve(process.cwd(), 'design', 'audit', 'premium');
await mkdir(auditDirectory, { recursive: true });

for (const [route, ready, file] of routes) {
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
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
  await page.getByText(ready, { exact: true }).first().waitFor();
  // See capture-lesson-slice.mjs: expo-image's web crossfade can still be
  // mid-animation right when the ready text appears.
  await page.waitForTimeout(600);
  if (errors.length) throw new Error(`${route}: ${errors.join(' | ')}`);
  await page.screenshot({ path: resolve(auditDirectory, file), fullPage: true });
  await context.close();
}
console.log(`PREMIUM_SLICE_SCREENSHOTS=${routes.length}`);
await browser.close();
