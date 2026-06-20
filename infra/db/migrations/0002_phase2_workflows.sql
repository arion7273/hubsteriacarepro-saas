ALTER TABLE patients RENAME TO residents;
ALTER INDEX patients_tenant_status_idx RENAME TO residents_tenant_status_idx;

ALTER TABLE care_plans RENAME COLUMN patient_id TO resident_id;
ALTER INDEX care_plans_patient_idx RENAME TO care_plans_resident_idx;

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  care_plan_id uuid REFERENCES care_plans(id) ON DELETE SET NULL,
  title text NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority text NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  due_at timestamptz,
  assigned_role text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_tenant_status_due_idx ON tasks(tenant_id, status, due_at);
CREATE INDEX tasks_resident_idx ON tasks(resident_id);

ALTER TABLE audit_events ADD COLUMN request_id text;
ALTER TABLE audit_events ADD COLUMN actor_role text;
CREATE INDEX audit_events_request_idx ON audit_events(request_id);
