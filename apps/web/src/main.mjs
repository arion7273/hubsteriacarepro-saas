const tenant = {
  name: 'Hubsteria Care Demo',
  status: 'trial'
};
const dashboardSummary = {
  activePatients: 1,
  activeCarePlans: 1,
  openTasks: 1
};
const worklist = [
  {
    title: 'Confirm discharge medication list',
    priority: 'high',
    dueDate: '2026-06-24'
  }
];
const apiBaseUrl = globalThis.HUBSTERIA_API_BASE_URL ?? 'http://localhost:3000';

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

setText('tenant-name', tenant.name);
setText('tenant-status', tenant.status);
setText('api-base', apiBaseUrl);
setText('active-patients', dashboardSummary.activePatients);
setText('active-care-plans', dashboardSummary.activeCarePlans);
setText('open-tasks', dashboardSummary.openTasks);

document.getElementById('worklist').replaceChildren(
  ...worklist.map((task) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${task.title}</strong><span>${task.priority} priority · Due ${task.dueDate}</span>`;
    return item;
  })
);
