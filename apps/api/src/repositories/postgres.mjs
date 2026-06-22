import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function quote(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function json(value) {
  return quote(JSON.stringify(value ?? {}));
}

function mapTenant(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: row.created_at
  };
}

function mapPatient(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    medicalRecordNumber: row.medical_record_number,
    preferredName: row.preferred_name,
    status: row.status,
    dateOfBirth: row.date_of_birth,
    createdAt: row.created_at
  };
}

function mapCarePlan(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    patientId: row.patient_id,
    title: row.title,
    status: row.status,
    goals: row.goals,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAuditEvent(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    actorUserId: row.actor_user_id,
    eventType: row.event_type,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    metadata: row.metadata,
    createdAt: row.created_at
  };
}

async function query(databaseUrl, sql) {
  const { stdout } = await execFileAsync('psql', [databaseUrl, '--quiet', '--no-align', '--tuples-only', '--command', sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024
  });
  const trimmed = stdout.trim();
  return trimmed ? JSON.parse(trimmed) : [];
}

export function createPostgresRepository(options = {}) {
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required when API_REPOSITORY_DRIVER=postgres.');
  }

  return {
    async getTenantBySlug(slug) {
      const rows = await query(databaseUrl, `
        SELECT COALESCE(json_agg(row_to_json(tenant_row)), '[]'::json)
        FROM (
          SELECT id::text, name, slug, status, created_at::text
          FROM tenants
          WHERE slug = ${quote(slug)}
          LIMIT 1
        ) tenant_row;
      `);
      return rows[0] ? mapTenant(rows[0]) : null;
    },
    async listPatients(context) {
      const rows = await query(databaseUrl, `
        SELECT COALESCE(json_agg(row_to_json(patient_row)), '[]'::json)
        FROM (
          SELECT id::text, tenant_id::text, medical_record_number, preferred_name, status, date_of_birth::text, created_at::text
          FROM patients
          WHERE tenant_id = ${quote(context.tenant.id)}::uuid
          ORDER BY created_at DESC
        ) patient_row;
      `);
      return rows.map(mapPatient);
    },
    async addPatient(context, patient) {
      const rows = await query(databaseUrl, `
        WITH inserted AS (
          INSERT INTO patients (tenant_id, medical_record_number, preferred_name, date_of_birth, status)
          VALUES (${quote(context.tenant.id)}::uuid, ${quote(patient.medicalRecordNumber)}, ${quote(patient.preferredName)}, ${quote(patient.dateOfBirth)}::date, ${quote(patient.status)})
          RETURNING id::text, tenant_id::text, medical_record_number, preferred_name, status, date_of_birth::text, created_at::text
        )
        SELECT COALESCE(json_agg(row_to_json(inserted)), '[]'::json) FROM inserted;
      `);
      return mapPatient(rows[0]);
    },
    async hasPatient(context, patientId) {
      const rows = await query(databaseUrl, `
        SELECT COALESCE(json_agg(row_to_json(patient_row)), '[]'::json)
        FROM (
          SELECT id::text
          FROM patients
          WHERE tenant_id = ${quote(context.tenant.id)}::uuid AND id = ${quote(patientId)}::uuid
          LIMIT 1
        ) patient_row;
      `);
      return rows.length === 1;
    },
    async listCarePlans(context) {
      const rows = await query(databaseUrl, `
        SELECT COALESCE(json_agg(row_to_json(care_plan_row)), '[]'::json)
        FROM (
          SELECT id::text, tenant_id::text, patient_id::text, title, status, goals, created_at::text, updated_at::text
          FROM care_plans
          WHERE tenant_id = ${quote(context.tenant.id)}::uuid
          ORDER BY updated_at DESC
        ) care_plan_row;
      `);
      return rows.map(mapCarePlan);
    },
    async addCarePlan(context, carePlan) {
      const rows = await query(databaseUrl, `
        WITH inserted AS (
          INSERT INTO care_plans (tenant_id, patient_id, title, status, goals)
          VALUES (${quote(context.tenant.id)}::uuid, ${quote(carePlan.patientId)}::uuid, ${quote(carePlan.title)}, ${quote(carePlan.status)}, ${json(carePlan.goals)}::jsonb)
          RETURNING id::text, tenant_id::text, patient_id::text, title, status, goals, created_at::text, updated_at::text
        )
        SELECT COALESCE(json_agg(row_to_json(inserted)), '[]'::json) FROM inserted;
      `);
      return mapCarePlan(rows[0]);
    },
    async listAuditEvents(context) {
      const rows = await query(databaseUrl, `
        SELECT COALESCE(json_agg(row_to_json(audit_event_row)), '[]'::json)
        FROM (
          SELECT id::text, tenant_id::text, actor_user_id::text, event_type, resource_type, resource_id, metadata, created_at::text
          FROM audit_events
          WHERE tenant_id = ${quote(context.tenant.id)}::uuid
          ORDER BY created_at DESC
        ) audit_event_row;
      `);
      return rows.map(mapAuditEvent);
    },
    async addAuditEvent(context, auditEvent) {
      const rows = await query(databaseUrl, `
        WITH inserted AS (
          INSERT INTO audit_events (tenant_id, actor_user_id, event_type, resource_type, resource_id, metadata)
          VALUES (${quote(context.tenant.id)}::uuid, ${quote(context.actorUserId)}::uuid, ${quote(auditEvent.eventType)}, ${quote(auditEvent.resourceType)}, ${quote(auditEvent.resourceId)}, ${json(auditEvent.metadata)}::jsonb)
          RETURNING id::text, tenant_id::text, actor_user_id::text, event_type, resource_type, resource_id, metadata, created_at::text
        )
        SELECT COALESCE(json_agg(row_to_json(inserted)), '[]'::json) FROM inserted;
      `);
      return mapAuditEvent(rows[0]);
    }
  };
}
