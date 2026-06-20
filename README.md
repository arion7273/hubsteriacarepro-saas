# HubsteriaCarePro SaaS

Phase 1 and Phase 2 monorepo scaffold for HubsteriaCarePro, a care operations SaaS for multi-tenant care teams.

## What is included

- `apps/api`: Dependency-free Node.js API service with tenant-aware boundaries, resident, care plan, task, mobile workflow, and audit routes.
- `apps/web`: Dependency-free mobile-first web shell for resident workflows and shift tasks.
- `packages/domain`: Shared tenant, resident, care plan, task, handoff, incident, sync, and audit constants, validation helpers, and fixture factories.
- `infra/db/migrations`: Initial PostgreSQL schema with tenant isolation primitives.
- `infra/render`: Render blueprint for web, API, and managed PostgreSQL deployment.
- `.github/workflows`: CI checks for scaffold validation, typecheck, tests, and builds.
- `docs`: API conventions, idempotent sync conventions, audit logging conventions, security baseline, implementation roadmap, and operational runbooks.
- `scripts/validate-scaffold.mjs`: No-dependency structural validation script.
- `tests/fixtures/phase2-regression.json`: Regression expectations for tenant workflows and audit events.

## Prerequisites

- Node.js 20+
- npm 10+
- No runtime npm registry access is required for the Phase 1 scaffold
- PostgreSQL 16+ for local database-backed API development

## Quick start

```bash
npm install
npm run validate:scaffold
npm run lint
npm run typecheck
npm test
npm run build
```

## Local development

```bash
cp .env.example .env
npm install
npm run dev
```

The web app defaults to <http://localhost:5173> and the API defaults to <http://localhost:3000>. Tenant-scoped API calls require `x-tenant-id: tenant_01HUBSTERIA`.

## Deployment

Use `infra/render/render.yaml` as the initial Render blueprint. Configure secrets listed in `.env.example` before the first production deploy.

## Compliance note

This scaffold is designed to support HIPAA-oriented engineering practices, but it is not compliance by itself. Complete the controls in `docs/security/security-baseline.md` and sign a BAA with all applicable vendors before storing PHI.
