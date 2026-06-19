import { createFixtureTenant } from '@hubsteriacarepro/domain';

const tenant = createFixtureTenant();

export function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">HubsteriaCarePro Phase 1</p>
        <h1>Care operations command center</h1>
        <p>
          A secure multi-tenant workspace for patient intake, care plan tracking,
          team coordination, and audit-ready operations.
        </p>
        <dl>
          <div><dt>Tenant</dt><dd>{tenant.name}</dd></div>
          <div><dt>Status</dt><dd>{tenant.status}</dd></div>
          <div><dt>API</dt><dd>{import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'}</dd></div>
        </dl>
      </section>
    </main>
  );
}
