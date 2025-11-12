import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const root = resolve('.');
const port = process.env.PORT ? Number(process.env.PORT) : 5173;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif'
};

function sendFile(res, path){
  const ext = extname(path).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  createReadStream(path).pipe(res);
}

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  let filePath = join(root, decodeURIComponent(url.pathname));

  try {
    const stats = statSync(filePath);
    if (stats.isDirectory()){
      filePath = join(filePath, 'index.html');
    }
    sendFile(res, filePath);
  } catch (err) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
