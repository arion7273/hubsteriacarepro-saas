const apiBaseUrl = globalThis.HUBSTERIA_CONFIG?.apiBaseUrl ?? 'http://localhost:3000';

document.getElementById('api-base').textContent = apiBaseUrl;

async function fetchJson(path) {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function renderCollection(id, items, emptyText) {
  const list = document.getElementById(id);
  list.replaceChildren();

  if (!items.length) {
    const item = document.createElement('li');
    item.textContent = emptyText;
    list.append(item);
    return;
  }

  for (const entry of items) {
    const item = document.createElement('li');
    item.textContent = entry.title ?? `${entry.preferredName} (${entry.status})`;
    list.append(item);
  }
}

try {
  const [tenant, patients, carePlans] = await Promise.all([
    fetchJson('/v1/tenant'),
    fetchJson('/v1/patients'),
    fetchJson('/v1/care-plans')
  ]);

  document.getElementById('tenant-name').textContent = tenant.name;
  document.getElementById('tenant-status').textContent = tenant.status;
  renderCollection('patient-list', patients.data, 'No patients yet.');
  renderCollection('care-plan-list', carePlans.data, 'No care plans yet.');
} catch (error) {
  document.getElementById('tenant-name').textContent = 'Unavailable';
  document.getElementById('tenant-status').textContent = error.message;
  renderCollection('patient-list', [], 'Start the API to load patients.');
  renderCollection('care-plan-list', [], 'Start the API to load care plans.');
}
