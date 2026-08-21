import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PNG } from 'pngjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'design', 'reference', 'bua', 'bua_logo_and_app_icon_sheet.png');
const outputDirectory = join(root, 'assets');
const source = PNG.sync.read(readFileSync(sourcePath));
const rect = { x: 82, y: 575, width: 276, height: 266 };
const navy = [16, 36, 59, 255];
const output = new PNG({ width: 276, height: 276, colorType: 6 });

for (let pixel = 0; pixel < output.width * output.height; pixel += 1) {
  output.data.set(navy, pixel * 4);
}

for (let y = 0; y < rect.height; y += 1) {
  for (let x = 0; x < rect.width; x += 1) {
    const sourceOffset = ((rect.y + y) * source.width + rect.x + x) * 4;
    const outputOffset = ((y + 5) * output.width + x) * 4;
    const red = source.data[sourceOffset];
    const green = source.data[sourceOffset + 1];
    const blue = source.data[sourceOffset + 2];
    const neutralBoard =
      Math.min(red, green, blue) >= 220 &&
      Math.max(red, green, blue) - Math.min(red, green, blue) <= 12;
    if (!neutralBoard) {
      output.data[outputOffset] = red;
      output.data[outputOffset + 1] = green;
      output.data[outputOffset + 2] = blue;
      output.data[outputOffset + 3] = 255;
    }
  }
}

mkdirSync(outputDirectory, { recursive: true });
const encoded = PNG.sync.write(output, { colorType: 6 });
for (const filename of ['icon.png', 'adaptive-icon.png', 'favicon.png']) {
  writeFileSync(join(outputDirectory, filename), encoded);
}
writeFileSync(
  join(outputDirectory, 'manifest.json'),
  `${JSON.stringify({ source: 'bua_logo_and_app_icon_sheet.png', crop: rect, boardPixelsReplacedWith: '#10243B', sha256: createHash('sha256').update(encoded).digest('hex') }, null, 2)}\n`,
);
console.log('Extracted the approved Bua app icon without redrawing foreground artwork.');
