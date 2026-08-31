import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const routes = [
  ['/offer', 'Speak without limits', '19-premium-offer-390x844.png'],
  ['/checkout', 'Choose your Bua Premium plan', '20-premium-checkout-390x844.png'],
  ['/profile', 'Learn without limits', 'profile-premium-entry-390x844.png'],
];
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  reducedMotion: 'reduce',
  viewport: { width: 390, height: 844 },
});
const auditDirectory = resolve(process.cwd(), 'design', 'audit', 'premium');
await mkdir(auditDirectory, { recursive: true });

for (const [route, ready, file] of routes) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => {
    // See capture-product-slice.mjs: known, web-export-only expo-sqlite Worker
    // bundling issue that doesn't reach native iOS/Android builds.
    if (!/Requiring unknown module/.test(error.message)) errors.push(error.message);
  });
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
  await page.getByText(ready, { exact: true }).first().waitFor();
  if (errors.length) throw new Error(`${route}: ${errors.join(' | ')}`);
  await page.screenshot({ path: resolve(auditDirectory, file), fullPage: true });
  await page.close();
}
console.log(`PREMIUM_SLICE_SCREENSHOTS=${routes.length}`);
await browser.close();
