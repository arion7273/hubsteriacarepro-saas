import assert from 'node:assert/strict';
import test from 'node:test';
import { assertTenantSlug, createFixtureTenant, isTenantSlug } from '../src/index.js';

test('validates tenant slugs', () => {
  assert.equal(isTenantSlug('care-team-1'), true);
  assert.equal(isTenantSlug('Bad Slug'), false);
  assert.equal(assertTenantSlug('abc'), 'abc');
});

test('creates tenant fixtures', () => {
  assert.equal(createFixtureTenant({ slug: 'phase-one' }).slug, 'phase-one');
});
