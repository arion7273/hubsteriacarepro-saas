import { createServer } from 'node:http';
import {
  createAuditEvent,
  createFixtureCarePlan,
  createFixtureHandoff,
  createFixtureIncident,
  createFixtureResident,
  createFixtureSyncOperation,
  createFixtureTask,
  createFixtureTenant,
  normalizeTenantId
} from '@hubsteriacarepro/domain';

const TENANT_HEADER = 'x-tenant-id';
const ACTOR_HEADER = 'x-actor-id';

const tenant = createFixtureTenant();
const residents = [
  createFixtureResident(),
  createFixtureResident({ id: 'resident_002', medicalRecordNumber: 'MRN-0002', preferredName: 'Sam Rivera', room: 'B-210', acuity: 'high' })
];
const carePlans = [
  createFixtureCarePlan(),
  createFixtureCarePlan({ id: 'care_plan_002', residentId: 'resident_002', title: 'Fall risk prevention', goals: ['Hourly rounding', 'Keep call bell within reach'] })
];
const tasks = [
  createFixtureTask(),
  createFixtureTask({ id: 'task_002', residentId: 'resident_002', carePlanId: 'care_plan_002', title: 'Fall risk room check', priority: 'urgent', dueAt: '2026-06-20T15:00:00.000Z' })
];
const handoffs = [createFixtureHandoff()];
const incidents = [createFixtureIncident()];
const syncOperations = [createFixtureSyncOperation()];
const syncResponsesByKey = new Map();
const auditEvents = [];

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY'
};

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, { ...jsonHeaders, ...headers });
  response.end(JSON.stringify(body));
}

function createRequestContext(request) {
  const requestId = request.headers['x-request-id']?.toString() ?? `req_${crypto.randomUUID()}`;
  const actorId = request.headers[ACTOR_HEADER]?.toString() ?? 'system';
  return { requestId, actorId };
}

function requireTenant(request, response, context) {
  const rawTenantId = request.headers[TENANT_HEADER]?.toString();
  if (!rawTenantId) {
    sendJson(response, 400, {
      error: 'tenant_header_required',
      message: `Missing ${TENANT_HEADER} header for tenant-scoped routes.`,
      requestId: context.requestId
    }, { 'x-request-id': context.requestId });
    return null;
  }

  try {
    const tenantId = normalizeTenantId(rawTenantId);
    if (tenantId !== tenant.id) {
      sendJson(response, 404, { error: 'tenant_not_found', requestId: context.requestId }, { 'x-request-id': context.requestId });
      return null;
    }
    return tenantId;
  } catch (error) {
    sendJson(response, 400, { error: 'invalid_tenant_id', message: error.message, requestId: context.requestId }, { 'x-request-id': context.requestId });
    return null;
  }
}

function recordAudit(context, tenantId, eventType, resourceType, resourceId, metadata = {}) {
  const event = createAuditEvent({
    tenantId,
    actorId: context.actorId,
    eventType,
    resourceType,
    resourceId,
    requestId: context.requestId,
    metadata
  });
  auditEvents.push(event);
  return event;
}

function tenantScoped(request, response, handler) {
  const context = createRequestContext(request);
  const tenantId = requireTenant(request, response, context);
  if (!tenantId) return undefined;
  return handler({ context, tenantId });
}

export function routeRequest(request, response) {
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/healthz') {
    return sendJson(response, 200, { ok: true, service: 'hubsteriacarepro-api' });
  }

  if (url.pathname === '/v1/audit-events' && request.method === 'GET') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const events = auditEvents.filter((event) => event.tenantId === tenantId);
      return sendJson(response, 200, { data: events, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (url.pathname === '/v1/tenant' || url.pathname === '/v1/tenants/current') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      recordAudit(context, tenantId, 'tenant.accessed', 'tenant', tenantId);
      return sendJson(response, 200, { data: tenant, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (request.method === 'GET' && url.pathname === '/v1/residents') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      recordAudit(context, tenantId, 'resident.viewed', 'resident_collection', tenantId, { count: residents.length });
      return sendJson(response, 200, { data: residents.filter((resident) => resident.tenantId === tenantId), requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  const residentMatch = url.pathname.match(/^\/v1\/residents\/([^/]+)$/);
  if (request.method === 'GET' && residentMatch) {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const resident = residents.find((item) => item.id === residentMatch[1] && item.tenantId === tenantId);
      if (!resident) return sendJson(response, 404, { error: 'resident_not_found', requestId: context.requestId }, { 'x-request-id': context.requestId });
      recordAudit(context, tenantId, 'resident.viewed', 'resident', resident.id);
      return sendJson(response, 200, { data: resident, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  const residentCarePlansMatch = url.pathname.match(/^\/v1\/residents\/([^/]+)\/care-plans$/);
  if (request.method === 'GET' && residentCarePlansMatch) {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const data = carePlans.filter((plan) => plan.tenantId === tenantId && plan.residentId === residentCarePlansMatch[1]);
      recordAudit(context, tenantId, 'care_plan.viewed', 'resident', residentCarePlansMatch[1], { count: data.length });
      return sendJson(response, 200, { data, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (request.method === 'GET' && url.pathname === '/v1/care-plans') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const data = carePlans.filter((plan) => plan.tenantId === tenantId);
      recordAudit(context, tenantId, 'care_plan.viewed', 'care_plan_collection', tenantId, { count: data.length });
      return sendJson(response, 200, { data, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (request.method === 'GET' && url.pathname === '/v1/tasks') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const status = url.searchParams.get('status');
      const data = tasks.filter((task) => task.tenantId === tenantId && (!status || task.status === status));
      recordAudit(context, tenantId, 'task.updated', 'task_collection', tenantId, { action: 'listed', count: data.length, status });
      return sendJson(response, 200, { data, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }



  if (request.method === 'GET' && url.pathname === '/v1/handoffs') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const data = handoffs.filter((handoff) => handoff.tenantId === tenantId);
      recordAudit(context, tenantId, 'handoff.created', 'handoff_collection', tenantId, { action: 'listed', count: data.length });
      return sendJson(response, 200, { data, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (request.method === 'GET' && url.pathname === '/v1/incidents') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const data = incidents.filter((incident) => incident.tenantId === tenantId);
      recordAudit(context, tenantId, 'incident.reported', 'incident_collection', tenantId, { action: 'listed', count: data.length });
      return sendJson(response, 200, { data, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (request.method === 'POST' && url.pathname === '/v1/sync/push') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const idempotencyKey = request.headers['idempotency-key']?.toString();
      if (!idempotencyKey) {
        return sendJson(response, 400, { error: 'idempotency_key_required', requestId: context.requestId }, { 'x-request-id': context.requestId });
      }
      if (syncResponsesByKey.has(idempotencyKey)) {
        return sendJson(response, 200, { ...syncResponsesByKey.get(idempotencyKey), idempotentReplay: true, requestId: context.requestId }, { 'x-request-id': context.requestId });
      }
      const operation = createFixtureSyncOperation({
        id: `sync_${syncOperations.length + 1}`,
        tenantId,
        idempotencyKey,
        clientTimestamp: request.headers['x-client-timestamp']?.toString() ?? new Date().toISOString()
      });
      syncOperations.push(operation);
      recordAudit(context, tenantId, 'sync.applied', operation.resourceType, operation.resourceId, { idempotencyKey });
      const result = { data: { accepted: true, operation }, syncCursor: `cursor_${syncOperations.length}` };
      syncResponsesByKey.set(idempotencyKey, result);
      return sendJson(response, 202, { ...result, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (request.method === 'GET' && url.pathname === '/v1/sync/status') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const data = syncOperations.filter((operation) => operation.tenantId === tenantId);
      return sendJson(response, 200, { data, syncCursor: `cursor_${data.length}`, requestId: context.requestId }, { 'x-request-id': context.requestId });
    });
  }

  if (request.method === 'GET' && url.pathname === '/v1/mobile/today') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const openTasks = tasks.filter((task) => task.tenantId === tenantId && ['open', 'in_progress', 'blocked'].includes(task.status));
      return sendJson(response, 200, {
        data: {
          tenant,
          residents: residents.filter((resident) => resident.tenantId === tenantId),
          tasks: openTasks,
          handoffs: handoffs.filter((handoff) => handoff.tenantId === tenantId),
          incidents: incidents.filter((incident) => incident.tenantId === tenantId),
          sync: { push: '/v1/sync/push', status: '/v1/sync/status' },
          navigation: ['/v1/mobile/today', '/v1/mobile/handoff', '/v1/residents', '/v1/tasks?status=open']
        },
        requestId: context.requestId
      }, { 'x-request-id': context.requestId });
    });
  }



  if (request.method === 'GET' && url.pathname === '/v1/mobile/handoff') {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      return sendJson(response, 200, {
        data: {
          handoffs: handoffs.filter((handoff) => handoff.tenantId === tenantId),
          incidents: incidents.filter((incident) => incident.tenantId === tenantId && incident.status !== 'closed'),
          openTasks: tasks.filter((task) => task.tenantId === tenantId && task.status !== 'done')
        },
        requestId: context.requestId
      }, { 'x-request-id': context.requestId });
    });
  }

  const mobileWorkflowMatch = url.pathname.match(/^\/v1\/mobile\/residents\/([^/]+)\/workflow$/);
  if (request.method === 'GET' && mobileWorkflowMatch) {
    return tenantScoped(request, response, ({ context, tenantId }) => {
      const residentId = mobileWorkflowMatch[1];
      return sendJson(response, 200, {
        data: {
          resident: residents.find((item) => item.id === residentId && item.tenantId === tenantId),
          carePlans: carePlans.filter((plan) => plan.residentId === residentId && plan.tenantId === tenantId),
          tasks: tasks.filter((task) => task.residentId === residentId && task.tenantId === tenantId),
          incidents: incidents.filter((incident) => incident.residentId === residentId && incident.tenantId === tenantId)
        },
        requestId: context.requestId
      }, { 'x-request-id': context.requestId });
    });
  }

  return sendJson(response, 404, { error: 'not_found' });
}

export function buildServer() {
  return createServer(routeRequest);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST ?? '0.0.0.0';
  buildServer().listen(port, host, () => {
    console.log(`HubsteriaCarePro API listening on http://${host}:${port}`);
  });
}
