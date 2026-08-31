import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const port = 4173;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.hbc': 'application/octet-stream',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
};

const server = createServer(async (request, response) => {
  const requestedPath = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
  const filePath = resolve(root, relativePath);

  if (!filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    let resolvedFilePath = filePath;
    let file;
    try {
      file = await stat(resolvedFilePath);
    } catch {
      try {
        resolvedFilePath = `${filePath}.html`;
        file = await stat(resolvedFilePath);
      } catch {
        const lessonTemplate = relativePath.replace(/^lesson\/[^/]+\//, 'lesson/[lessonId]/');
        resolvedFilePath = resolve(root, `${lessonTemplate}.html`);
        file = await stat(resolvedFilePath);
      }
    }
    if (!file.isFile()) {
      throw new Error('Not a file');
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes[extname(resolvedFilePath)] ?? 'application/octet-stream',
    });
    createReadStream(resolvedFilePath).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Bua production export available at http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
