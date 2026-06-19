import assert from 'node:assert/strict';
import test from 'node:test';
import { assertTenantSlug, createFixturePatient, createFixtureTenant, isTenantSlug } from '../src/index.mjs';

test('validates tenant slugs', () => {
  assert.equal(isTenantSlug('care-team-1'), true);
  assert.equal(isTenantSlug('Bad Slug'), false);
  assert.equal(assertTenantSlug('abc'), 'abc');
});

test('creates domain fixtures', () => {
  assert.equal(createFixtureTenant({ slug: 'phase-one' }).slug, 'phase-one');
  assert.equal(createFixturePatient({ preferredName: 'Casey' }).preferredName, 'Casey');
});
