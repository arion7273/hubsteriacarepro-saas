import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const roots = ['apps', 'packages', 'scripts'];
const jsFiles = [];

async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    if (entry.isFile() && path.endsWith('.mjs')) jsFiles.push(path);
  }
}

for (const root of roots) await collect(root);
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}
console.log(`Checked ${jsFiles.length} JavaScript modules for syntax errors.`);
