import { createServer } from 'node:http';
import { assertCarePlanStatus, assertPatientStatus } from '@hubsteriacarepro/domain';
import { badRequest, notFound, toErrorResponse } from './errors.mjs';
import { resolveRequestContext } from './request-context.mjs';
import { createRepository } from './repositories/index.mjs';
import { createMemoryRepository } from './repositories/memory.mjs';

const securityHeaders = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY'
};

function jsonHeaders() {
  return {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': process.env.CORS_ORIGIN ?? '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-tenant-slug,x-actor-user-id',
    ...securityHeaders
  };
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, jsonHeaders());
  response.end(JSON.stringify(body));
}

function sendNoContent(response) {
  response.writeHead(204, jsonHeaders());
  response.end();
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw badRequest('Request body must be valid JSON.');
  }
}

function requireString(payload, field) {
  if (typeof payload[field] !== 'string' || payload[field].trim() === '') {
    throw badRequest(`${field} is required.`);
  }
  return payload[field].trim();
}

function requirePatientStatus(value) {
  try {
    return assertPatientStatus(value);
  } catch (error) {
    throw badRequest(error.message);
  }
}

function requireCarePlanStatus(value) {
  try {
    return assertCarePlanStatus(value);
  } catch (error) {
    throw badRequest(error.message);
  }
}

function createPatient(payload, context) {
  return {
    tenantId: context.tenant.id,
    medicalRecordNumber: requireString(payload, 'medicalRecordNumber'),
    preferredName: requireString(payload, 'preferredName'),
    status: requirePatientStatus(payload.status ?? 'intake'),
    dateOfBirth: requireString(payload, 'dateOfBirth'),
    createdAt: new Date().toISOString()
  };
}

async function createCarePlan(payload, context, repository) {
  const patientId = requireString(payload, 'patientId');
  if (!(await repository.hasPatient(context, patientId))) {
    throw notFound('patientId must reference an existing patient for this tenant.');
  }

  return {
    tenantId: context.tenant.id,
    patientId,
    title: requireString(payload, 'title'),
    status: requireCarePlanStatus(payload.status ?? 'draft'),
    goals: Array.isArray(payload.goals) ? payload.goals : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function createAuditEvent(payload, context) {
  return {
    tenantId: context.tenant.id,
    actorUserId: context.actorUserId,
    eventType: requireString(payload, 'eventType'),
    resourceType: requireString(payload, 'resourceType'),
    resourceId: requireString(payload, 'resourceId'),
    metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {},
    createdAt: new Date().toISOString()
  };
}

async function recordAuditEvent(repository, context, event) {
  return repository.addAuditEvent(context, {
    tenantId: context.tenant.id,
    actorUserId: context.actorUserId,
    eventType: event.eventType,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    metadata: event.metadata ?? {},
    createdAt: new Date().toISOString()
  });
}

export function createRequestRouter(repository = createRepository()) {
  return async function routeRequest(request, response) {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'OPTIONS') {
      return sendNoContent(response);
    }

    try {
      if (request.method === 'GET' && url.pathname === '/healthz') {
        return sendJson(response, 200, { ok: true, service: 'hubsteriacarepro-api' });
      }

      const context = await resolveRequestContext(request, repository);

      if (request.method === 'GET' && url.pathname === '/v1/tenant') {
        return sendJson(response, 200, context.tenant);
      }

      if (request.method === 'GET' && url.pathname === '/v1/patients') {
        const patients = await repository.listPatients(context);
        await recordAuditEvent(repository, context, {
          eventType: 'patient.listed',
          resourceType: 'patient',
          resourceId: context.tenant.id,
          metadata: { count: patients.length }
        });
        return sendJson(response, 200, { data: patients });
      }

      if (request.method === 'POST' && url.pathname === '/v1/patients') {
        const patient = await repository.addPatient(context, createPatient(await readJsonBody(request), context));
        await recordAuditEvent(repository, context, {
          eventType: 'patient.created',
          resourceType: 'patient',
          resourceId: patient.id
        });
        return sendJson(response, 201, patient);
      }

      if (request.method === 'GET' && url.pathname === '/v1/care-plans') {
        const carePlans = await repository.listCarePlans(context);
        await recordAuditEvent(repository, context, {
          eventType: 'care_plan.listed',
          resourceType: 'care_plan',
          resourceId: context.tenant.id,
          metadata: { count: carePlans.length }
        });
        return sendJson(response, 200, { data: carePlans });
      }

      if (request.method === 'POST' && url.pathname === '/v1/care-plans') {
        const carePlan = await repository.addCarePlan(context, await createCarePlan(await readJsonBody(request), context, repository));
        await recordAuditEvent(repository, context, {
          eventType: 'care_plan.created',
          resourceType: 'care_plan',
          resourceId: carePlan.id
        });
        return sendJson(response, 201, carePlan);
      }

      if (request.method === 'GET' && url.pathname === '/v1/audit-events') {
        return sendJson(response, 200, { data: await repository.listAuditEvents(context) });
      }

      if (request.method === 'POST' && url.pathname === '/v1/audit-events') {
        const auditEvent = await repository.addAuditEvent(context, createAuditEvent(await readJsonBody(request), context));
        return sendJson(response, 202, { accepted: true, data: auditEvent });
      }

      return sendJson(response, 404, { error: 'not_found' });
    } catch (error) {
      const { statusCode, body } = toErrorResponse(error);
      return sendJson(response, statusCode, body);
    }
  };
}

const defaultRouter = createRequestRouter();

export function routeRequest(request, response) {
  return defaultRouter(request, response);
}

export function buildServer(options = {}) {
  return createServer(createRequestRouter(createRepository(options)));
}

export { createMemoryRepository };

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST ?? '0.0.0.0';
  buildServer().listen(port, host, () => {
    console.log(`HubsteriaCarePro API listening on http://${host}:${port}`);
  });
}
