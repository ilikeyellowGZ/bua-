import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { PNG } from 'pngjs';

const root = process.cwd();
const referenceDir = path.join(root, 'design', 'reference', 'bua');
const outputDir = path.join(root, 'src', 'assets', 'mascot', 'generated');
const cropContract = JSON.parse(
  await readFile(path.join(referenceDir, 'mascot-crops.json'), 'utf8'),
);

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const isBoardBackground = (red, green, blue) => {
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  return minimum >= 238 && maximum - minimum <= 8;
};

function removeConnectedBoard(crop) {
  const visited = new Uint8Array(crop.width * crop.height);
  const queue = new Int32Array(crop.width * crop.height);
  let head = 0;
  let tail = 0;

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= crop.width || y >= crop.height) return;
    const pixel = y * crop.width + x;
    if (visited[pixel]) return;
    const offset = pixel * 4;
    if (!isBoardBackground(crop.data[offset], crop.data[offset + 1], crop.data[offset + 2])) {
      return;
    }
    visited[pixel] = 1;
    queue[tail++] = pixel;
  };

  for (let x = 0; x < crop.width; x += 1) {
    enqueue(x, 0);
    enqueue(x, crop.height - 1);
  }
  for (let y = 0; y < crop.height; y += 1) {
    enqueue(0, y);
    enqueue(crop.width - 1, y);
  }

  while (head < tail) {
    const pixel = queue[head++];
    const x = pixel % crop.width;
    const y = Math.floor(pixel / crop.width);
    crop.data[pixel * 4 + 3] = 0;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  return tail;
}

await mkdir(outputDir, { recursive: true });
const manifest = {
  schemaVersion: 1,
  method:
    'Crop measured rectangles, then clear only border-connected near-neutral board pixels (RGB minimum >= 238; channel spread <= 8). Foreground RGB is never rewritten.',
  generatedAt: 'reproducible-build-step',
  sprites: [],
};

for (const sourceContract of cropContract.sources) {
  const sourcePath = path.join(referenceDir, sourceContract.file);
  const sourceBuffer = await readFile(sourcePath);
  const source = PNG.sync.read(sourceBuffer);

  if (source.width !== sourceContract.size.width || source.height !== sourceContract.size.height) {
    throw new Error(`Source dimensions changed for ${sourceContract.file}`);
  }

  for (const rect of sourceContract.crops) {
    const crop = new PNG({ width: rect.width, height: rect.height, colorType: 6 });
    PNG.bitblt(source, crop, rect.x, rect.y, rect.width, rect.height, 0, 0);
    const transparentPixels = removeConnectedBoard(crop);
    if (transparentPixels === 0) throw new Error(`No board background removed for ${rect.id}`);

    for (let y = 0; y < rect.height; y += 1) {
      for (let x = 0; x < rect.width; x += 1) {
        const cropOffset = (y * rect.width + x) * 4;
        const sourceOffset = ((rect.y + y) * source.width + rect.x + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          if (crop.data[cropOffset + channel] !== source.data[sourceOffset + channel]) {
            throw new Error(`Foreground RGB changed for ${rect.id}`);
          }
        }
      }
    }

    const outputBuffer = PNG.sync.write(crop, { colorType: 6 });
    const outputFile = `${rect.id}.png`;
    await writeFile(path.join(outputDir, outputFile), outputBuffer);
    manifest.sprites.push({
      id: rect.id,
      source: sourceContract.file,
      sourceSha256: sha256(sourceBuffer),
      rect,
      output: outputFile,
      outputSha256: sha256(outputBuffer),
      transparentPixels,
      foregroundRgbVerified: true,
    });
  }
}

await writeFile(
  path.join(outputDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Extracted and verified ${manifest.sprites.length} approved Thandi sprites.`);
