import { createServer } from 'node:http';
import {
  createDashboardSummary,
  createFixtureCarePlan,
  createFixturePatient,
  createFixtureTask,
  createFixtureTenant
} from '@hubsteriacarepro/domain';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY'
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, jsonHeaders);
  response.end(JSON.stringify(body));
}

export function routeRequest(request, response) {
  const url = new URL(request.url ?? '/', 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/healthz') {
    return sendJson(response, 200, { ok: true, service: 'hubsteriacarepro-api' });
  }

  if (request.method === 'GET' && url.pathname === '/v1/tenant') {
    return sendJson(response, 200, createFixtureTenant());
  }

  if (request.method === 'GET' && url.pathname === '/v1/dashboard-summary') {
    return sendJson(response, 200, createDashboardSummary());
  }

  if (request.method === 'GET' && url.pathname === '/v1/patients') {
    return sendJson(response, 200, { data: [createFixturePatient()] });
  }

  if (request.method === 'GET' && url.pathname === '/v1/care-plans') {
    return sendJson(response, 200, { data: [createFixtureCarePlan()] });
  }

  if (request.method === 'GET' && url.pathname === '/v1/tasks') {
    return sendJson(response, 200, { data: [createFixtureTask()] });
  }

  if (request.method === 'POST' && url.pathname === '/v1/audit-events') {
    return sendJson(response, 202, { accepted: true });
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
