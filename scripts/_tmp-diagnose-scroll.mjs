import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  deviceScaleFactor: 1,
  hasTouch: true,
  isMobile: true,
  reducedMotion: 'reduce',
  viewport: { width: 320, height: 568 },
});
const page = await context.newPage();
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.getByText('Speak. Connect. Belong.', { exact: true }).first().waitFor();
await page.waitForTimeout(500);

const info = await page.evaluate(() => {
  function describe(el) {
    if (!el) return null;
    const style = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: el.className && el.className.toString().slice(0, 80),
      id: el.id,
      overflow: style.overflow,
      overflowY: style.overflowY,
      height: style.height,
      maxHeight: style.maxHeight,
      minHeight: style.minHeight,
      display: style.display,
      position: style.position,
      rectHeight: el.getBoundingClientRect().height,
      scrollHeight: el.scrollHeight,
    };
  }
  const chain = [];
  chain.push(describe(document.documentElement));
  chain.push(describe(document.body));

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let anchorNode = null;
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.includes('Join with institution code')) {
      anchorNode = walker.currentNode;
      break;
    }
  }
  chain.push({ foundAnchor: Boolean(anchorNode) });

  let cur = anchorNode ? anchorNode.parentElement : null;
  while (cur) {
    chain.push(describe(cur));
    cur = cur.parentElement;
  }
  return chain;
});

console.log(JSON.stringify(info, null, 2));

const linkVisibleBeforeScroll = await page
  .getByText('Join with institution code', { exact: true })
  .isVisible()
  .catch(() => false);
console.log('link visible before scroll (in-viewport check):', linkVisibleBeforeScroll);

await page.getByText('Join with institution code', { exact: true }).scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await page.screenshot({ path: 'design/audit/welcome-viewports/_scrolled-320x568.png' });

const linkVisibleAfterScroll = await page
  .getByText('Join with institution code', { exact: true })
  .isVisible()
  .catch(() => false);
console.log('link visible after scrollIntoView:', linkVisibleAfterScroll);

await browser.close();
