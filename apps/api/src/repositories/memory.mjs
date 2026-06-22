import { createFixtureCarePlan, createFixturePatient, createFixtureTenant } from '@hubsteriacarepro/domain';

function clone(value) {
  return structuredClone(value);
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createMemoryRepository(seed = {}) {
  const tenants = clone(seed.tenants ?? [createFixtureTenant()]);
  const defaultTenant = tenants[0];
  const patients = clone(seed.patients ?? [createFixturePatient({ tenantId: defaultTenant.id })]);
  const carePlans = clone(seed.carePlans ?? [createFixtureCarePlan({ tenantId: defaultTenant.id, patientId: patients[0].id })]);
  const auditEvents = clone(seed.auditEvents ?? []);

  return {
    getTenantBySlug(slug) {
      const tenant = tenants.find((entry) => entry.slug === slug);
      return tenant ? clone(tenant) : null;
    },
    listPatients(context) {
      return clone(patients.filter((patient) => patient.tenantId === context.tenant.id));
    },
    addPatient(context, patient) {
      const tenantPatient = { ...patient, id: patient.id ?? createId('patient'), tenantId: context.tenant.id };
      patients.push(clone(tenantPatient));
      return clone(tenantPatient);
    },
    hasPatient(context, patientId) {
      return patients.some((patient) => patient.tenantId === context.tenant.id && patient.id === patientId);
    },
    listCarePlans(context) {
      return clone(carePlans.filter((carePlan) => carePlan.tenantId === context.tenant.id));
    },
    addCarePlan(context, carePlan) {
      const tenantCarePlan = { ...carePlan, id: carePlan.id ?? createId('care_plan'), tenantId: context.tenant.id };
      carePlans.push(clone(tenantCarePlan));
      return clone(tenantCarePlan);
    },
    listAuditEvents(context) {
      return clone(auditEvents.filter((auditEvent) => auditEvent.tenantId === context.tenant.id));
    },
    addAuditEvent(context, auditEvent) {
      const tenantAuditEvent = {
        ...auditEvent,
        id: auditEvent.id ?? createId('audit'),
        tenantId: context.tenant.id,
        actorUserId: context.actorUserId
      };
      auditEvents.push(clone(tenantAuditEvent));
      return clone(tenantAuditEvent);
    }
  };
}
