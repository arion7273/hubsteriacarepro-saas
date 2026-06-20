import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const problems = [];
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    if (entry.isFile() && /\.(mjs|json|md|css|html|yaml|sql)$/.test(path)) {
      const source = await readFile(path, 'utf8');
      if (!source.endsWith('\n')) problems.push(`${path}: missing trailing newline`);
      if (/\t/.test(source)) problems.push(`${path}: contains tab indentation`);
    }
  }
}

await collect('.');
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('Lint checks passed.');
