import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertCarePlanStatus,
  assertPatientStatus,
  assertTenantSlug,
  createFixtureCarePlan,
  createFixturePatient,
  createFixtureTenant,
  isTenantSlug
} from '../src/index.mjs';

test('validates tenant slugs', () => {
  assert.equal(isTenantSlug('care-team-1'), true);
  assert.equal(isTenantSlug('Bad Slug'), false);
  assert.equal(assertTenantSlug('abc'), 'abc');
});

test('validates patient and care plan statuses', () => {
  assert.equal(assertPatientStatus('active'), 'active');
  assert.equal(assertCarePlanStatus('completed'), 'completed');
  assert.throws(() => assertPatientStatus('archived'), /Patient status/);
  assert.throws(() => assertCarePlanStatus('paused'), /Care plan status/);
});

test('creates domain fixtures', () => {
  assert.equal(createFixtureTenant({ slug: 'phase-one' }).slug, 'phase-one');
  assert.equal(createFixturePatient({ preferredName: 'Casey' }).preferredName, 'Casey');
  assert.equal(createFixtureCarePlan({ title: 'Phase 2 plan' }).title, 'Phase 2 plan');
});
