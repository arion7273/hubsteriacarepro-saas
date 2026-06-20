import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertTenantSlug,
  createAuditEvent,
  createFixtureCarePlan,
  createFixtureHandoff,
  createFixtureIncident,
  createFixtureResident,
  createFixtureSyncOperation,
  createFixtureTask,
  createFixtureTenant,
  isTenantSlug,
  normalizeTenantId
} from '../src/index.mjs';

test('validates tenant slugs and public tenant ids', () => {
  assert.equal(isTenantSlug('care-team-1'), true);
  assert.equal(isTenantSlug('Bad Slug'), false);
  assert.equal(assertTenantSlug('abc'), 'abc');
  assert.equal(normalizeTenantId('tenant_01HUBSTERIA'), 'tenant_01HUBSTERIA');
  assert.throws(() => normalizeTenantId('bad'));
});

test('creates phase 2 domain fixtures', () => {
  assert.equal(createFixtureTenant({ slug: 'phase-two' }).slug, 'phase-two');
  assert.equal(createFixtureResident({ preferredName: 'Casey' }).preferredName, 'Casey');
  assert.equal(createFixtureCarePlan().residentId, 'resident_001');
  assert.equal(createFixtureTask().priority, 'high');
  assert.equal(createFixtureHandoff().status, 'ready');
  assert.equal(createFixtureIncident().severity, 'moderate');
  assert.equal(createFixtureSyncOperation().idempotencyKey, 'idem_shift_001');
});

test('creates audit events with normalized tenant boundaries', () => {
  const event = createAuditEvent({
    tenantId: 'tenant_01HUBSTERIA',
    eventType: 'resident.viewed',
    resourceType: 'resident',
    resourceId: 'resident_001',
    requestId: 'req_test'
  });
  assert.equal(event.tenantId, 'tenant_01HUBSTERIA');
  assert.equal(event.id, 'audit_req_test');
});
