import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
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
page.on('pageerror', (error) => errors.push(error.message));

await page.goto('http://127.0.0.1:4173/component-showcase', {
  waitUntil: 'networkidle',
});
await page.getByText('Start speaking', { exact: true }).waitFor();
if (errors.length > 0) throw new Error(`Browser runtime errors: ${errors.join(' | ')}`);

const auditDirectory = resolve(process.cwd(), 'design', 'audit');
await mkdir(auditDirectory, { recursive: true });
const screenshotPath = resolve(auditDirectory, 'shared-controls-390x844.png');
await page.screenshot({ path: screenshotPath, fullPage: true });

console.log(`SHARED_CONTROLS_SCREENSHOT=${screenshotPath}`);
await browser.close();
