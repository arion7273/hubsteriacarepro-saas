export type TenantStatus = 'trial' | 'active' | 'suspended';
export type CareRole = 'owner' | 'administrator' | 'clinician' | 'care_coordinator' | 'billing';
export type PatientStatus = 'intake' | 'active' | 'discharged';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
}

export interface CareTeamMember {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  roles: CareRole[];
}

export interface Patient {
  id: string;
  tenantId: string;
  medicalRecordNumber: string;
  preferredName: string;
  status: PatientStatus;
  dateOfBirth: string;
}

export interface CarePlan {
  id: string;
  tenantId: string;
  patientId: string;
  title: string;
  goals: string[];
  updatedAt: string;
}

export function isTenantSlug(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{2,62}$/.test(value);
}

export function assertTenantSlug(value: string): string {
  if (!isTenantSlug(value)) {
    throw new Error('Tenant slug must be 3-63 lowercase letters, numbers, or hyphens.');
  }
  return value;
}

export function createFixtureTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: 'tenant_01HUBSTERIA',
    name: 'Hubsteria Care Demo',
    slug: 'hubsteria-demo',
    status: 'trial',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}
