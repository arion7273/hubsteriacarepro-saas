export const TENANT_STATUSES = ['trial', 'active', 'suspended'];
export const CARE_ROLES = ['owner', 'administrator', 'clinician', 'care_coordinator', 'billing'];
export const RESIDENT_STATUSES = ['intake', 'active', 'transferred', 'discharged'];
export const CARE_PLAN_STATUSES = ['draft', 'active', 'paused', 'completed'];
export const TASK_STATUSES = ['open', 'in_progress', 'blocked', 'done', 'cancelled'];
export const TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
export const HANDOFF_STATUSES = ['draft', 'ready', 'accepted', 'archived'];
export const INCIDENT_SEVERITIES = ['low', 'moderate', 'high', 'critical'];
export const INCIDENT_STATUSES = ['reported', 'triaged', 'resolved', 'closed'];
export const SYNC_OPERATION_TYPES = ['create', 'update', 'delete', 'ack'];
export const AUDIT_EVENT_TYPES = ['tenant.accessed', 'resident.viewed', 'care_plan.viewed', 'task.updated', 'handoff.created', 'incident.reported', 'sync.applied'];

export function isTenantSlug(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9-]{2,62}$/.test(value);
}

export function assertTenantSlug(value) {
  if (!isTenantSlug(value)) {
    throw new Error('Tenant slug must be 3-63 lowercase letters, numbers, or hyphens.');
  }
  return value;
}

export function normalizeTenantId(value) {
  if (typeof value !== 'string' || !/^tenant_[A-Za-z0-9_-]{6,64}$/.test(value)) {
    throw new Error('Tenant id is required and must use the tenant_* public id format.');
  }
  return value;
}

export function createFixtureTenant(overrides = {}) {
  return {
    id: 'tenant_01HUBSTERIA',
    name: 'Hubsteria Care Demo',
    slug: 'hubsteria-demo',
    status: 'trial',
    timezone: 'America/New_York',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}

export function createFixtureResident(overrides = {}) {
  return {
    id: 'resident_001',
    tenantId: 'tenant_01HUBSTERIA',
    medicalRecordNumber: 'MRN-0001',
    preferredName: 'Jordan Patient',
    legalName: 'Jordan Lee Patient',
    room: 'A-104',
    status: 'active',
    acuity: 'moderate',
    dateOfBirth: '1980-01-01',
    ...overrides
  };
}

export function createFixtureCarePlan(overrides = {}) {
  return {
    id: 'care_plan_001',
    tenantId: 'tenant_01HUBSTERIA',
    residentId: 'resident_001',
    title: 'Mobility and medication adherence',
    status: 'active',
    goals: ['Walk 100 feet twice daily', 'Complete medication reconciliation each shift'],
    interventions: ['Use gait belt for hallway ambulation', 'Escalate missed medication to nurse lead'],
    updatedAt: '2026-06-01T12:00:00.000Z',
    ...overrides
  };
}

export function createFixtureTask(overrides = {}) {
  return {
    id: 'task_001',
    tenantId: 'tenant_01HUBSTERIA',
    residentId: 'resident_001',
    carePlanId: 'care_plan_001',
    title: 'Morning mobility walk',
    status: 'open',
    priority: 'high',
    dueAt: '2026-06-20T14:00:00.000Z',
    assignedRole: 'care_coordinator',
    ...overrides
  };
}

export function createFixtureHandoff(overrides = {}) {
  return {
    id: 'handoff_001',
    tenantId: 'tenant_01HUBSTERIA',
    fromShift: 'day',
    toShift: 'evening',
    status: 'ready',
    summary: 'Two residents need mobility and fall-risk follow-up.',
    residentIds: ['resident_001', 'resident_002'],
    taskIds: ['task_001', 'task_002'],
    createdBy: 'user_admin_001',
    createdAt: '2026-06-20T18:00:00.000Z',
    ...overrides
  };
}

export function createFixtureIncident(overrides = {}) {
  return {
    id: 'incident_001',
    tenantId: 'tenant_01HUBSTERIA',
    residentId: 'resident_002',
    severity: 'moderate',
    status: 'reported',
    category: 'fall_risk',
    summary: 'Resident reported dizziness during transfer; no injury observed.',
    reportedBy: 'user_admin_001',
    reportedAt: '2026-06-20T16:30:00.000Z',
    ...overrides
  };
}

export function createFixtureSyncOperation(overrides = {}) {
  return {
    id: 'sync_001',
    tenantId: 'tenant_01HUBSTERIA',
    idempotencyKey: 'idem_shift_001',
    operationType: 'update',
    resourceType: 'task',
    resourceId: 'task_001',
    payload: { status: 'in_progress' },
    clientTimestamp: '2026-06-20T14:05:00.000Z',
    ...overrides
  };
}

export function createAuditEvent({ tenantId, actorId = 'system', eventType, resourceType, resourceId, requestId, metadata = {} }) {
  return {
    id: `audit_${requestId}`,
    tenantId: normalizeTenantId(tenantId),
    actorId,
    eventType,
    resourceType,
    resourceId,
    requestId,
    metadata,
    occurredAt: new Date().toISOString()
  };
}
