CREATE TABLE handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_shift text NOT NULL,
  to_shift text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'ready', 'accepted', 'archived')),
  summary text NOT NULL,
  resident_ids uuid[] NOT NULL DEFAULT '{}',
  task_ids uuid[] NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  accepted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE TABLE incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  severity text NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  status text NOT NULL CHECK (status IN ('reported', 'triaged', 'resolved', 'closed')),
  category text NOT NULL,
  summary text NOT NULL,
  reported_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE sync_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  operation_type text NOT NULL CHECK (operation_type IN ('create', 'update', 'delete', 'ack')),
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  client_timestamp timestamptz NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX handoffs_tenant_status_idx ON handoffs(tenant_id, status, created_at DESC);
CREATE INDEX incidents_tenant_status_idx ON incidents(tenant_id, status, reported_at DESC);
CREATE INDEX incidents_resident_idx ON incidents(resident_id, reported_at DESC);
CREATE INDEX sync_operations_tenant_applied_idx ON sync_operations(tenant_id, applied_at DESC);
