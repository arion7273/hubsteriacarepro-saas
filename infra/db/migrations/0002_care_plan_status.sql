ALTER TABLE care_plans
  ADD COLUMN status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX care_plans_tenant_status_idx ON care_plans(tenant_id, status);
