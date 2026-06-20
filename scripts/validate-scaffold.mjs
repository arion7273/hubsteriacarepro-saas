import { existsSync, readFileSync } from 'node:fs';

const required = [
  'package.json',
  '.env.example',
  '.github/workflows/ci.yml',
  'apps/api/package.json',
  'apps/api/src/server.mjs',
  'apps/api/Dockerfile',
  'apps/web/package.json',
  'apps/web/index.html',
  'apps/web/src/main.mjs',
  'apps/web/Dockerfile',
  'packages/domain/package.json',
  'packages/domain/src/index.mjs',
  'tests/fixtures/sample-care-team.json',
  'tests/fixtures/phase2-regression.json',
  'infra/db/migrations/0001_initial.sql',
  'infra/db/migrations/0002_phase2_workflows.sql',
  'infra/db/migrations/0003_phase2_handoff_incident_sync.sql',
  'infra/render/render.yaml',
  'docs/api/tenant-boundaries.md',
  'docs/api/audit-logging.md',
  'docs/api/idempotent-sync.md',
  'docs/roadmap/phase2-implementation-roadmap.md',
  'docs/security/security-baseline.md',
  'docs/runbooks/incident-response.md',
  'docs/runbooks/backup-restore.md'
];

const missing = required.filter((file) => !existsSync(file));
if (missing.length) {
  console.error(`Missing required scaffold files:\n${missing.map((file) => `- ${file}`).join('\n')}`);
  process.exit(1);
}

const readme = readFileSync('README.md', 'utf8');
for (const phrase of ['apps/api', 'apps/web', 'packages/domain', 'infra/render', 'phase2-regression', 'sync']) {
  if (!readme.includes(phrase)) {
    console.error(`README.md must document ${phrase}`);
    process.exit(1);
  }
}

const initialMigration = readFileSync('infra/db/migrations/0001_initial.sql', 'utf8');
for (const table of ['tenants', 'users', 'patients', 'care_plans', 'audit_events']) {
  if (!initialMigration.includes(`CREATE TABLE ${table}`)) {
    console.error(`Initial migration must create ${table}`);
    process.exit(1);
  }
}

const phaseTwoMigration = readFileSync('infra/db/migrations/0002_phase2_workflows.sql', 'utf8');
for (const phrase of ['ALTER TABLE patients RENAME TO residents', 'CREATE TABLE tasks', 'ALTER TABLE audit_events ADD COLUMN request_id']) {
  if (!phaseTwoMigration.includes(phrase)) {
    console.error(`Phase 2 migration must include: ${phrase}`);
    process.exit(1);
  }
}

const syncMigration = readFileSync('infra/db/migrations/0003_phase2_handoff_incident_sync.sql', 'utf8');
for (const table of ['handoffs', 'incidents', 'sync_operations']) {
  if (!syncMigration.includes(`CREATE TABLE ${table}`)) {
    console.error(`Sync migration must create ${table}`);
    process.exit(1);
  }
}

const apiSource = readFileSync('apps/api/src/server.mjs', 'utf8');
for (const route of ['/v1/residents', '/v1/tasks', '/v1/handoffs', '/v1/incidents', '/v1/sync/push', '/v1/mobile/handoff', '/v1/audit-events']) {
  if (!apiSource.includes(route)) {
    console.error(`API must expose ${route}`);
    process.exit(1);
  }
}

const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
if (rootPackage.dependencies || rootPackage.devDependencies) {
  console.error('Root scaffold must remain dependency-free for Phase 2 validation.');
  process.exit(1);
}

console.log('Scaffold validation passed.');
