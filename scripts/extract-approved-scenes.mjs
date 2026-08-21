import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PNG } from 'pngjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'design', 'reference', 'bua');
const destination = join(root, 'src', 'assets', 'scenes', 'generated');

const scenes = [
  ['cafe-story', '04_bua_listening_story.png', 49, 263, 755, 841],
  ['lerato-cafe', '05_bua_comprehension.png', 52, 430, 540, 423],
  ['campus-roleplay', '08_bua_role_play.png', 49, 350, 764, 578],
  ['phrase-classmates', '14_bua_phrase_builder.png', 39, 390, 774, 530],
  ['water', '15_bua_picture_match.png', 70, 600, 300, 300],
  ['bread', '15_bua_picture_match.png', 466, 590, 320, 310],
  ['house', '15_bua_picture_match.png', 50, 1000, 350, 340],
  ['family', '15_bua_picture_match.png', 450, 980, 340, 390],
  ['taxi-rank', '16_bua_branching_conversation.png', 34, 395, 796, 470],
  ['click-instructions', '18_bua_click_pronunciation.png', 63, 413, 726, 484],
  ['premium-offer-hero', '19_bua_premium_paywall.png', 180, 55, 500, 390],
  ['premium-checkout-hero', '20_bua_premium_checkout.png', 135, 105, 550, 220],
];

mkdirSync(destination, { recursive: true });

const manifest = scenes.map(([id, filename, x, y, width, height]) => {
  const input = PNG.sync.read(readFileSync(join(source, filename)));
  if (x + width > input.width || y + height > input.height) {
    throw new Error(`Crop ${id} exceeds ${filename}`);
  }

  const output = new PNG({ width, height });
  PNG.bitblt(input, output, x, y, width, height, 0, 0);
  const encoded = PNG.sync.write(output);
  writeFileSync(join(destination, `${id}.png`), encoded);
  return {
    id,
    source: filename,
    crop: { x, y, width, height },
    sha256: createHash('sha256').update(encoded).digest('hex'),
  };
});

writeFileSync(join(destination, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Extracted ${manifest.length} pixel-preserving approved scene crops.`);
