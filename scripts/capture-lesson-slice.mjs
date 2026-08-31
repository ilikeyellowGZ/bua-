import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const routes = [
  ['listen', 'Listen to the conversation', '04-listen-390x844.png'],
  ['phrase-builder', 'Build the sentence', '14-phrase-builder-390x844.png'],
  ['picture-match', 'Match the word', '15-picture-match-390x844.png'],
  ['conversation', 'Choose your reply', '16-conversation-390x844.png'],
  ['comprehension', 'What did Lerato say?', '05-comprehension-390x844.png'],
  ['dictation', 'What do you hear?', '17-dictation-390x844.png'],
  ['click-pronunciation', 'The “q” sound', '18-click-pronunciation-390x844.png'],
  ['speak', 'Say the phrase', '07-speak-390x844.png'],
  ['sound-focus', 'Which word did you hear?', '06-sound-focus-390x844.png'],
  ['role-play', 'Meet a classmate', '08-role-play-390x844.png'],
  ['complete', 'Lesson complete', '09-complete-390x844.png'],
];

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  reducedMotion: 'reduce',
  viewport: { width: 390, height: 844 },
});
const auditDirectory = resolve(process.cwd(), 'design', 'audit', 'lesson');
await mkdir(auditDirectory, { recursive: true });

for (const [route, ready, file] of routes) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.location().url.endsWith('/favicon.ico')) {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    // See capture-product-slice.mjs: known, web-export-only expo-sqlite Worker
    // bundling issue that doesn't reach native iOS/Android builds.
    if (!/Requiring unknown module/.test(error.message)) errors.push(error.message);
  });
  await page.goto(`http://127.0.0.1:4173/lesson/lesson-introduce-yourself/${route}`, {
    waitUntil: 'networkidle',
  });
  await page.getByText(ready, { exact: true }).first().waitFor();
  if (errors.length > 0) throw new Error(`${route}: ${errors.join(' | ')}`);
  await page.screenshot({ path: resolve(auditDirectory, file), fullPage: true });
  await page.close();
}

console.log(`LESSON_SLICE_SCREENSHOTS=${routes.length}`);
await browser.close();
