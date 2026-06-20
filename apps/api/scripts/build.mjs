import { cp, mkdir } from 'node:fs/promises';

await mkdir('dist/src', { recursive: true });
await cp('src/server.mjs', 'dist/src/server.mjs');
console.log('Built @hubsteriacarepro/api');
