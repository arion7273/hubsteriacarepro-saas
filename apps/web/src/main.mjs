const tenant = {
  name: 'Hubsteria Care Demo',
  status: 'trial'
};
const apiBaseUrl = globalThis.HUBSTERIA_API_BASE_URL ?? 'http://localhost:3000';

document.getElementById('tenant-name').textContent = tenant.name;
document.getElementById('tenant-status').textContent = tenant.status;
document.getElementById('api-base').textContent = apiBaseUrl;
