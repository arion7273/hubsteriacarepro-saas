import assert from 'node:assert/strict';
import test from 'node:test';
import { once } from 'node:events';
import { buildServer } from '../src/server.mjs';

async function withServer(assertions) {
  const server = buildServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  try {
    await assertions(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}

test('health endpoint responds', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/healthz`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
  });
});

test('tenant endpoint returns fixture tenant', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/tenant`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).slug, 'hubsteria-demo');
  });
});
