const phaseTwoSnapshot = {
  tenant: { name: 'Hubsteria Care Demo', status: 'trial' },
  residents: [
    { id: 'resident_001', preferredName: 'Jordan Patient', room: 'A-104', acuity: 'moderate' },
    { id: 'resident_002', preferredName: 'Sam Rivera', room: 'B-210', acuity: 'high' }
  ],
  tasks: [
    { id: 'task_001', residentId: 'resident_001', title: 'Morning mobility walk', priority: 'high' },
    { id: 'task_002', residentId: 'resident_002', title: 'Fall risk room check', priority: 'urgent' }
  ],
  handoffs: [
    { id: 'handoff_001', summary: 'Two residents need mobility and fall-risk follow-up.', status: 'ready' }
  ],
  incidents: [
    { id: 'incident_001', residentId: 'resident_002', severity: 'moderate', summary: 'Dizziness during transfer; no injury observed.' }
  ],
  sync: { cursor: 'cursor_2', idempotencyKey: 'idem_shift_001' }
};

document.getElementById('tenant-name').textContent = phaseTwoSnapshot.tenant.name;
document.getElementById('resident-count').textContent = String(phaseTwoSnapshot.residents.length);
document.getElementById('task-count').textContent = String(phaseTwoSnapshot.tasks.length);
document.getElementById('incident-count').textContent = String(phaseTwoSnapshot.incidents.length);
document.getElementById('sync-status').textContent = `${phaseTwoSnapshot.sync.cursor} · ${phaseTwoSnapshot.sync.idempotencyKey}`;

const workflowList = document.getElementById('workflow-list');
for (const task of phaseTwoSnapshot.tasks) {
  const resident = phaseTwoSnapshot.residents.find((item) => item.id === task.residentId);
  const incident = phaseTwoSnapshot.incidents.find((item) => item.residentId === task.residentId);
  const item = document.createElement('li');
  item.innerHTML = `<strong>${task.title}</strong><span>${resident.preferredName} · Room ${resident.room} · ${task.priority}</span>${incident ? `<em>${incident.severity} incident: ${incident.summary}</em>` : ''}`;
  workflowList.append(item);
}
