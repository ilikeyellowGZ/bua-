import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
const runtimeErrors = [];
const failedResponses = [];

page.on('console', (message) => {
  if (message.type() === 'error') {
    const location = message.location();
    if (location.url.endsWith('/favicon.ico')) {
      return;
    }
    runtimeErrors.push(`${message.text()} @ ${location.url}:${location.lineNumber}`);
  }
});
page.on('pageerror', (error) => runtimeErrors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400) {
    failedResponses.push(`${response.status()} ${response.url()}`);
  }
});

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
await page.getByText('Foundation ready', { exact: true }).waitFor();

const bodyText = await page.locator('body').innerText();
if (bodyText.includes('Configuration required')) {
  throw new Error('The exported app did not receive its prepared public environment.');
}
if (runtimeErrors.length > 0) {
  throw new Error(
    `Browser runtime errors: ${runtimeErrors.join(' | ')}; failed responses: ${failedResponses.join(' | ')}`,
  );
}

const auditDirectory = resolve(process.cwd(), 'design', 'audit');
await mkdir(auditDirectory, { recursive: true });
const screenshotPath = resolve(auditDirectory, 'foundation-boot-390x844.png');
await page.screenshot({ path: screenshotPath, fullPage: true });

console.log('FOUNDATION_RENDER_OK=390x844');
console.log(`FOUNDATION_SCREENSHOT=${screenshotPath}`);

await browser.close();
