import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const viewports = [
  { name: 'iphone-se-320x568', width: 320, height: 568 },
  { name: 'small-android-360x640', width: 360, height: 640 },
  { name: 'iphone-se3-375x667', width: 375, height: 667 },
  { name: 'iphone-12-390x844', width: 390, height: 844 },
  { name: 'pixel-412x915', width: 412, height: 915 },
  { name: 'iphone-14-pro-max-428x926', width: 428, height: 926 },
  { name: 'galaxy-fold-280x653', width: 280, height: 653 },
  { name: 'short-landscape-ish-360x600', width: 360, height: 600 },
];

const outDir = resolve(process.cwd(), 'design', 'audit', 'welcome-viewports');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
    viewport: { width: vp.width, height: vp.height },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.getByText('Speak. Connect. Belong.', { exact: true }).first().waitFor();
  await page.waitForTimeout(500);

  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    return { docWidth, winWidth, docHeight, winHeight, horizontalOverflow: docWidth > winWidth };
  });

  console.log(
    `${vp.name}: window=${vp.width}x${vp.height} doc=${overflow.docWidth}x${overflow.docHeight} hOverflow=${overflow.horizontalOverflow} errors=${errors.length}`,
  );
  if (errors.length) console.log(`  errors: ${errors.join(' | ')}`);

  await page.screenshot({ path: resolve(outDir, `${vp.name}.png`), fullPage: true });
  await context.close();
}

await browser.close();
console.log('done');
