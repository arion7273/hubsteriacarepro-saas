export const TENANT_STATUSES = ['trial', 'active', 'suspended'];
export const CARE_ROLES = ['owner', 'administrator', 'clinician', 'care_coordinator', 'billing'];
export const PATIENT_STATUSES = ['intake', 'active', 'discharged'];
export const CARE_PLAN_STATUSES = ['draft', 'active', 'needs_review', 'completed'];
export const TASK_PRIORITIES = ['routine', 'high', 'urgent'];

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
    riskLevel: 'moderate',
    primaryCoordinator: 'Alex Clinician',
    ...overrides
  };
}

export function createFixtureCarePlan(overrides = {}) {
  return {
    id: 'care_plan_001',
    tenantId: 'tenant_01HUBSTERIA',
    patientId: 'patient_001',
    title: 'Post-discharge stabilization',
    status: 'active',
    goals: ['Medication reconciliation', 'Primary care follow-up', 'Transportation support'],
    nextReviewDue: '2026-07-01',
    ownerRole: 'care_coordinator',
    ...overrides
  };
}

export function createFixtureTask(overrides = {}) {
  return {
    id: 'task_001',
    tenantId: 'tenant_01HUBSTERIA',
    patientId: 'patient_001',
    carePlanId: 'care_plan_001',
    title: 'Confirm discharge medication list',
    priority: 'high',
    dueDate: '2026-06-24',
    assigneeRole: 'clinician',
    status: 'open',
    ...overrides
  };
}

export function createDashboardSummary(overrides = {}) {
  return {
    activePatients: 1,
    activeCarePlans: 1,
    openTasks: 1,
    overdueTasks: 0,
    auditEventsAcceptedToday: 0,
    ...overrides
  };
}
