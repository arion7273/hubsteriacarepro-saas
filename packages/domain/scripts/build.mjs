import { cp, mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await cp('src/index.mjs', 'dist/index.mjs');
console.log('Built @hubsteriacarepro/domain');
