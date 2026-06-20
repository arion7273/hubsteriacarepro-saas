import assert from 'node:assert/strict';
import test from 'node:test';
import { once } from 'node:events';
import { buildServer } from '../src/server.mjs';

const tenantHeaders = {
  'x-tenant-id': 'tenant_01HUBSTERIA',
  'x-actor-id': 'user_admin_001',
  'x-request-id': 'req_test_001'
};

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

test('health endpoint responds without tenant context', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/healthz`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).ok, true);
  });
});

test('tenant routes require tenant boundary header', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/tenants/current`);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, 'tenant_header_required');
  });
});

test('tenant endpoint returns envelope for current tenant', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/tenants/current`, { headers: tenantHeaders });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-request-id'), 'req_test_001');
    assert.equal(body.data.slug, 'hubsteria-demo');
  });
});

test('resident and care plan modules are tenant scoped', async () => {
  await withServer(async (baseUrl) => {
    const residentsResponse = await fetch(`${baseUrl}/v1/residents`, { headers: tenantHeaders });
    const residentsBody = await residentsResponse.json();
    assert.equal(residentsResponse.status, 200);
    assert.equal(residentsBody.data.length, 2);

    const carePlanResponse = await fetch(`${baseUrl}/v1/residents/resident_001/care-plans`, { headers: tenantHeaders });
    const carePlanBody = await carePlanResponse.json();
    assert.equal(carePlanResponse.status, 200);
    assert.equal(carePlanBody.data[0].residentId, 'resident_001');
  });
});

test('task and mobile workflow routes expose shift-ready data', async () => {
  await withServer(async (baseUrl) => {
    const tasksResponse = await fetch(`${baseUrl}/v1/tasks?status=open`, { headers: tenantHeaders });
    const tasksBody = await tasksResponse.json();
    assert.equal(tasksResponse.status, 200);
    assert.equal(tasksBody.data.every((task) => task.status === 'open'), true);

    const mobileResponse = await fetch(`${baseUrl}/v1/mobile/today`, { headers: tenantHeaders });
    const mobileBody = await mobileResponse.json();
    assert.equal(mobileResponse.status, 200);
    assert.equal(mobileBody.data.navigation.includes('/v1/mobile/today'), true);
  });
});

test('audit events are recorded with request ids', async () => {
  await withServer(async (baseUrl) => {
    await fetch(`${baseUrl}/v1/residents/resident_001`, { headers: tenantHeaders });
    const auditResponse = await fetch(`${baseUrl}/v1/audit-events`, { headers: tenantHeaders });
    const auditBody = await auditResponse.json();
    assert.equal(auditResponse.status, 200);
    assert.equal(auditBody.data.some((event) => event.eventType === 'resident.viewed'), true);
  });
});

test('handoff and incident modules are tenant scoped', async () => {
  await withServer(async (baseUrl) => {
    const handoffResponse = await fetch(`${baseUrl}/v1/handoffs`, { headers: tenantHeaders });
    const handoffBody = await handoffResponse.json();
    assert.equal(handoffResponse.status, 200);
    assert.equal(handoffBody.data[0].status, 'ready');

    const incidentResponse = await fetch(`${baseUrl}/v1/incidents`, { headers: tenantHeaders });
    const incidentBody = await incidentResponse.json();
    assert.equal(incidentResponse.status, 200);
    assert.equal(incidentBody.data[0].severity, 'moderate');
  });
});

test('sync push requires idempotency and replays duplicate keys', async () => {
  await withServer(async (baseUrl) => {
    const missingKey = await fetch(`${baseUrl}/v1/sync/push`, { method: 'POST', headers: tenantHeaders });
    assert.equal(missingKey.status, 400);

    const headers = { ...tenantHeaders, 'idempotency-key': 'idem_test_001', 'x-client-timestamp': '2026-06-20T14:05:00.000Z' };
    const first = await fetch(`${baseUrl}/v1/sync/push`, { method: 'POST', headers });
    const firstBody = await first.json();
    assert.equal(first.status, 202);
    assert.equal(firstBody.data.operation.idempotencyKey, 'idem_test_001');

    const replay = await fetch(`${baseUrl}/v1/sync/push`, { method: 'POST', headers });
    const replayBody = await replay.json();
    assert.equal(replay.status, 200);
    assert.equal(replayBody.idempotentReplay, true);
    assert.equal(replayBody.data.operation.idempotencyKey, 'idem_test_001');
  });
});

test('mobile handoff route includes incidents and open tasks', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/mobile/handoff`, { headers: tenantHeaders });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.data.handoffs.length, 1);
    assert.equal(body.data.incidents.length, 1);
    assert.equal(body.data.openTasks.length, 2);
  });
});
