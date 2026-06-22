import assert from 'node:assert/strict';
import test from 'node:test';
import { once } from 'node:events';
import { createFixturePatient, createFixtureTenant } from '@hubsteriacarepro/domain';
import { buildServer } from '../src/server.mjs';
import { createRepository } from '../src/repositories/index.mjs';

async function withServer(assertions, options = {}) {
  const server = buildServer(options);
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

test('creates patients and care plans', async () => {
  await withServer(async (baseUrl) => {
    const patientResponse = await fetch(`${baseUrl}/v1/patients`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        medicalRecordNumber: 'MRN-0002',
        preferredName: 'Avery Resident',
        dateOfBirth: '1975-05-20',
        status: 'active'
      })
    });
    assert.equal(patientResponse.status, 201);
    const patient = await patientResponse.json();
    assert.equal(patient.preferredName, 'Avery Resident');

    const carePlanResponse = await fetch(`${baseUrl}/v1/care-plans`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ patientId: patient.id, title: 'Fall prevention plan', status: 'draft' })
    });
    assert.equal(carePlanResponse.status, 201);
    assert.equal((await carePlanResponse.json()).title, 'Fall prevention plan');
  });
});

test('servers keep isolated in-memory stores', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/patients`);
    assert.equal((await response.json()).data.length, 1);
  });
});

test('scopes patient lists by request tenant', async () => {
  const primaryTenant = createFixtureTenant();
  const secondaryTenant = createFixtureTenant({ id: 'tenant_SECONDARY', slug: 'secondary-demo', name: 'Secondary Demo' });
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/patients`, { headers: { 'x-tenant-slug': 'secondary-demo' } });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].tenantId, 'tenant_SECONDARY');
  }, {
    seed: {
      tenants: [primaryTenant, secondaryTenant],
      patients: [
        createFixturePatient({ tenantId: primaryTenant.id }),
        createFixturePatient({ id: 'patient_SECONDARY', tenantId: secondaryTenant.id, preferredName: 'Secondary Patient' })
      ],
      carePlans: []
    }
  });
});

test('rejects invalid patient payloads', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/patients`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ preferredName: 'Missing fields' })
    });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, 'bad_request');
  });
});

test('returns not found for care plans with unknown tenant patient', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/care-plans`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ patientId: 'patient_missing', title: 'Missing patient plan' })
    });
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, 'not_found');
  });
});

test('records manual and automatic audit events', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/v1/audit-events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-actor-user-id': 'user_001' },
      body: JSON.stringify({
        eventType: 'patient.viewed',
        resourceType: 'patient',
        resourceId: 'patient_001',
        metadata: { reason: 'care_coordination' }
      })
    });
    assert.equal(createResponse.status, 202);
    assert.equal((await createResponse.json()).data.actorUserId, 'user_001');

    await fetch(`${baseUrl}/v1/patients`);

    const listResponse = await fetch(`${baseUrl}/v1/audit-events`);
    const body = await listResponse.json();
    assert.equal(body.data.length, 2);
    assert.deepEqual(body.data.map((event) => event.eventType), ['patient.viewed', 'patient.listed']);
  });
});


test('constructs postgres repository driver without connecting during setup', () => {
  const repository = createRepository({ driver: 'postgres', databaseUrl: 'postgres://example@example.com/example' });
  assert.equal(typeof repository.getTenantBySlug, 'function');
  assert.equal(typeof repository.addPatient, 'function');
});
