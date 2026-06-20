# Tenant-aware API boundaries

Phase 2 tenant-scoped routes require `x-tenant-id` and should include `x-actor-id` and `x-request-id`.

## Conventions

- `GET /healthz` is public infrastructure health and does not require tenant context.
- All `/v1/*` product routes require `x-tenant-id` unless explicitly documented otherwise.
- Responses use `{ data, requestId }` envelopes for successful tenant-scoped reads.
- Errors include stable machine-readable `error` codes and the request id when available.
- Tenant ids use the public `tenant_*` format; database UUIDs remain internal implementation details.
- Mobile write replay uses `idempotency-key` and is documented in `docs/api/idempotent-sync.md`.

## Phase 2 routes

- `GET /v1/tenants/current`: current tenant summary.
- `GET /v1/residents`: tenant-scoped resident list.
- `GET /v1/residents/:residentId`: resident detail.
- `GET /v1/residents/:residentId/care-plans`: care plans attached to one resident.
- `GET /v1/care-plans`: tenant-scoped care plan list.
- `GET /v1/tasks?status=open`: shift task list.
- `GET /v1/handoffs`: shift handoff summaries.
- `GET /v1/incidents`: incident reporting queue.
- `POST /v1/sync/push`: idempotent mobile sync ingestion.
- `GET /v1/sync/status`: accepted sync operations and cursor.
- `GET /v1/mobile/today`: mobile-first shift snapshot.
- `GET /v1/mobile/handoff`: handoff-focused mobile workflow bundle.
- `GET /v1/mobile/residents/:residentId/workflow`: resident workflow bundle.
- `GET /v1/audit-events`: tenant-scoped audit events for operational review.
