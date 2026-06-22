import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, relative, resolve, sep } from 'node:path';

const root = resolve(process.env.WEB_ROOT ?? process.cwd());
const port = Number(process.env.WEB_PORT ?? 5173);
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8']
]);

function isWithinRoot(filePath) {
  const pathFromRoot = relative(root, filePath);
  return pathFromRoot === '' || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..');
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (url.pathname === '/src/config.js') {
    response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
    response.end(`globalThis.HUBSTERIA_CONFIG = ${JSON.stringify({ apiBaseUrl }, null, 2)};\n`);
    return;
  }

  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = resolve(root, `.${requested}`);

  if (!isWithinRoot(filePath) || !existsSync(filePath)) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, { 'content-type': contentTypes.get(extname(filePath)) ?? 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`HubsteriaCarePro web listening on http://0.0.0.0:${port}`);
});
