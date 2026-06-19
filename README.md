# HubsteriaCarePro SaaS

Phase 1 monorepo scaffold for HubsteriaCarePro, a care operations SaaS for multi-tenant care teams.

## What is included

- `apps/api`: TypeScript Fastify API service with health, tenant, patient, care plan, and audit routes.
- `apps/web`: TypeScript Vite/React web application shell for tenant dashboards.
- `packages/domain`: Shared domain types, validation helpers, and fixture factories.
- `infra/db/migrations`: Initial PostgreSQL schema with tenant isolation primitives.
- `infra/render`: Render blueprint for web, API, and managed PostgreSQL deployment.
- `.github/workflows`: CI checks for scaffold validation, typecheck, tests, and builds.
- `docs`: Security baseline, incident response, backup/restore, and operational runbooks.
- `scripts/validate-scaffold.mjs`: No-dependency structural validation script.

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+ for local database-backed API development

## Quick start

```bash
npm install
npm run validate:scaffold
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

## Deployment

Use `infra/render/render.yaml` as the initial Render blueprint. Configure secrets listed in `.env.example` before the first production deploy.

## Compliance note

This scaffold is designed to support HIPAA-oriented engineering practices, but it is not compliance by itself. Complete the controls in `docs/security/security-baseline.md` and sign a BAA with all applicable vendors before storing PHI.
