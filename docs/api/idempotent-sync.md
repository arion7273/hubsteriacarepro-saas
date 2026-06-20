# Idempotent sync conventions

Mobile clients may submit queued workflow changes to `POST /v1/sync/push` when connectivity returns.

## Required headers

- `x-tenant-id`: tenant boundary for the queued operation.
- `x-actor-id`: actor applying the queued operation.
- `x-request-id`: correlation id for logs and audit events.
- `idempotency-key`: stable client-generated key for exactly-once replay behavior.
- `x-client-timestamp`: client clock timestamp for ordering diagnostics.

## Response behavior

- Missing `idempotency-key` returns `400 idempotency_key_required`.
- First application returns `202` with `{ data, syncCursor, requestId }`.
- Replays with the same key return `200` with `idempotentReplay: true` and the original operation payload.
- The API records a `sync.applied` audit event for first application only.

## Storage model

Persist sync operations with a unique `(tenant_id, idempotency_key)` constraint and store the accepted payload, resource target, client timestamp, and server applied timestamp.
