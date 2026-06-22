import { existsSync, readFileSync } from 'node:fs';

const required = [
  'package.json',
  '.env.example',
  '.github/workflows/ci.yml',
  'apps/api/package.json',
  'apps/api/src/server.mjs',
  'apps/api/src/repositories/postgres.mjs',
  'apps/api/Dockerfile',
  'apps/web/package.json',
  'apps/web/index.html',
  'apps/web/src/main.mjs',
  'apps/web/Dockerfile',
  'packages/domain/package.json',
  'packages/domain/src/index.mjs',
  'tests/fixtures/sample-care-team.json',
  'infra/db/migrations/0001_initial.sql',
  'infra/db/migrations/0002_care_plan_status.sql',
  'infra/render/render.yaml',
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
for (const phrase of ['apps/api', 'apps/web', 'packages/domain', 'infra/render']) {
  if (!readme.includes(phrase)) {
    console.error(`README.md must document ${phrase}`);
    process.exit(1);
  }
}

const migration = readFileSync('infra/db/migrations/0001_initial.sql', 'utf8');
for (const table of ['tenants', 'users', 'patients', 'care_plans', 'audit_events']) {
  if (!migration.includes(`CREATE TABLE ${table}`)) {
    console.error(`Initial migration must create ${table}`);
    process.exit(1);
  }
}

const carePlanMigration = readFileSync('infra/db/migrations/0002_care_plan_status.sql', 'utf8');
for (const phrase of ['ADD COLUMN status', 'care_plans_tenant_status_idx']) {
  if (!carePlanMigration.includes(phrase)) {
    console.error(`Care plan status migration must include ${phrase}`);
    process.exit(1);
  }
}

const rootPackage = JSON.parse(readFileSync('package.json', 'utf8'));
if (rootPackage.dependencies || rootPackage.devDependencies) {
  console.error('Root scaffold must remain dependency-free for Phase 1 validation.');
  process.exit(1);
}

console.log('Scaffold validation passed.');
