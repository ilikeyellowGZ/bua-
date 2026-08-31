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
const auditDirectory = resolve(process.cwd(), 'design', 'audit', 'lesson');
await mkdir(auditDirectory, { recursive: true });

for (const [route, ready, file] of routes) {
  // A fresh context per route (rather than one context shared across the
  // loop) gives each page its own storage partition. expo-sqlite's web
  // backend opens the local database through an OPFS sync access handle,
  // which only one open page may hold at a time — sharing a context across
  // sequential page loads on the same origin raced two handles on the same
  // file and threw NoModificationAllowedError.
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
  await page.goto(`http://127.0.0.1:4173/lesson/lesson-introduce-yourself/${route}`, {
    waitUntil: 'networkidle',
  });
  await page.getByText(ready, { exact: true }).first().waitFor();
  // expo-image fades images in on web even with reducedMotion set (its
  // crossfade is a JS-driven opacity animation, not the CSS media query), so
  // screenshotting immediately after the ready text appears can catch photo
  // cards mid-fade or fully transparent. Give the fade time to finish.
  await page.waitForTimeout(600);
  if (errors.length > 0) throw new Error(`${route}: ${errors.join(' | ')}`);
  await page.screenshot({ path: resolve(auditDirectory, file), fullPage: true });
  await context.close();
}

console.log(`LESSON_SLICE_SCREENSHOTS=${routes.length}`);
await browser.close();
