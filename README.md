# HubsteriaCarePro SaaS

Phase 4 monorepo foundation for HubsteriaCarePro, a care operations SaaS for multi-tenant care teams.

## What is included

- `apps/api`: Dependency-free Node.js API service with health, tenant, patient, care plan, and audit routes, including repository-backed Phase 4 create/list workflows with memory and PostgreSQL repository drivers.
- `apps/web`: Dependency-free web application shell that loads tenant, patient, and care plan dashboard data from the API.
- `packages/domain`: Shared domain constants, validation helpers, and fixture factories.
- `infra/db/migrations`: Initial PostgreSQL schema with tenant isolation primitives.
- `infra/render`: Render blueprint for web, API, and managed PostgreSQL deployment.
- `.github/workflows`: CI checks for scaffold validation, typecheck, tests, and builds.
- `docs`: Security baseline, incident response, backup/restore, and operational runbooks.
- `scripts/validate-scaffold.mjs`: No-dependency structural validation script.

## Prerequisites

- Node.js 20+
- npm 10+
- No runtime npm registry access is required for the Phase 4 foundation
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

The web app defaults to <http://localhost:5173> and the API defaults to <http://localhost:3000>.


## Repository drivers

The API defaults to the dependency-free `memory` repository driver for local development and tests. Set `API_REPOSITORY_DRIVER=postgres` with `DATABASE_URL` to use the PostgreSQL repository bridge; the bridge shells out to `psql` so the PostgreSQL client must be available in the runtime image.

## Deployment

Use `infra/render/render.yaml` as the initial Render blueprint. Configure secrets listed in `.env.example` before the first production deploy.

## Compliance note

This scaffold is designed to support HIPAA-oriented engineering practices, but it is not compliance by itself. Complete the controls in `docs/security/security-baseline.md` and sign a BAA with all applicable vendors before storing PHI.
