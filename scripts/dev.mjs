import { spawn } from 'node:child_process';

const children = [
  spawn(process.execPath, ['apps/api/src/server.mjs'], { stdio: 'inherit' }),
  spawn(process.execPath, ['apps/web/scripts/serve.mjs'], { cwd: 'apps/web', stdio: 'inherit' })
];

function shutdown() {
  for (const child of children) child.kill('SIGTERM');
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
