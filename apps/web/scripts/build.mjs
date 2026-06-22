import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

const apiBaseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src/styles.css', 'dist/src/styles.css');
await cp('src/main.mjs', 'dist/src/main.mjs');
await writeFile('dist/src/config.js', `globalThis.HUBSTERIA_CONFIG = ${JSON.stringify({ apiBaseUrl }, null, 2)};\n`);
console.log('Built @hubsteriacarepro/web');
