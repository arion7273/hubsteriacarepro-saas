export const TENANT_STATUSES = ['trial', 'active', 'suspended'];
export const CARE_ROLES = ['owner', 'administrator', 'clinician', 'care_coordinator', 'billing'];
export const PATIENT_STATUSES = ['intake', 'active', 'discharged'];

export function isTenantSlug(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{2,62}$/.test(value);
}

export function assertTenantSlug(value) {
  if (!isTenantSlug(value)) {
    throw new Error('Tenant slug must be 3-63 lowercase letters, numbers, or hyphens.');
  }
  return value;
}

export function createFixtureTenant(overrides = {}) {
  return {
    id: 'tenant_01HUBSTERIA',
    name: 'Hubsteria Care Demo',
    slug: 'hubsteria-demo',
    status: 'trial',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}

export function createFixturePatient(overrides = {}) {
  return {
    id: 'patient_001',
    tenantId: 'tenant_01HUBSTERIA',
    medicalRecordNumber: 'MRN-0001',
    preferredName: 'Jordan Patient',
    status: 'intake',
    dateOfBirth: '1980-01-01',
    ...overrides
  };
}
