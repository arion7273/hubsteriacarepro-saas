import { existsSync, readFileSync } from 'node:fs';

const required = [
  'package.json',
  'tsconfig.base.json',
  '.env.example',
  '.github/workflows/ci.yml',
  'apps/api/package.json',
  'apps/api/src/server.ts',
  'apps/api/Dockerfile',
  'apps/web/package.json',
  'apps/web/src/App.tsx',
  'apps/web/Dockerfile',
  'packages/domain/package.json',
  'packages/domain/src/index.ts',
  'tests/fixtures/sample-care-team.json',
  'infra/db/migrations/0001_initial.sql',
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

console.log('Scaffold validation passed.');
