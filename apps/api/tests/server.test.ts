import assert from 'node:assert/strict';
import test from 'node:test';
import { buildServer } from '../src/server.js';

test('health endpoint responds', async () => {
  const app = buildServer();
  const response = await app.inject({ method: 'GET', url: '/healthz' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().ok, true);
});
