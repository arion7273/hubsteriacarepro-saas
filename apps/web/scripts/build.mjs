import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src/styles.css', 'dist/src/styles.css');
await cp('src/main.mjs', 'dist/src/main.mjs');
console.log('Built @hubsteriacarepro/web');
