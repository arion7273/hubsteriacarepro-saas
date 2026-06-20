# Phase 2 implementation roadmap

## 1. Tenant and identity hardening

- Replace fixture tenant lookup with persisted tenant resolution.
- Validate actor membership and role permissions for every tenant-scoped route.
- Add negative authorization tests for cross-tenant access attempts.

## 2. Resident workflows

- Promote resident list/detail fixtures to repository-backed reads.
- Add resident intake, status transitions, and discharge workflows.
- Add mobile-friendly resident summary cards optimized for shift handoff.

## 3. Care plans and tasks

- Add care plan CRUD with goal/intervention version history.
- Add task creation, assignment, completion, and escalation flows.
- Add task due-date queues for shift, resident, and role views.

## 4. Handoffs, incidents, and offline sync

- Persist handoff summaries for shift-to-shift continuity.
- Add incident reporting, triage, resolution, and closed-loop audit review.
- Implement idempotent mobile sync queues using `(tenant_id, idempotency_key)` uniqueness.

## 5. Audit and compliance

- Persist audit events asynchronously after route authorization succeeds.
- Add immutable retention controls and export tooling for compliance reviews.
- Redact PHI from audit metadata and structured logs.

## 6. Production readiness

- Introduce a thin database adapter and migration runner.
- Add contract tests from `tests/fixtures/phase2-regression.json`.
- Add smoke tests for Render-deployed web/API environments.
