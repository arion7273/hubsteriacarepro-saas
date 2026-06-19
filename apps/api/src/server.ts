import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import { createFixtureTenant } from '@hubsteriacarepro/domain';

export function buildServer() {
  const app = Fastify({ logger: true });

  app.register(helmet);
  app.register(cors, { origin: process.env.WEB_ORIGIN?.split(',') ?? true });

  app.get('/healthz', async () => ({ ok: true, service: 'hubsteriacarepro-api' }));
  app.get('/v1/tenant', async () => createFixtureTenant());
  app.get('/v1/patients', async () => ({ data: [] }));
  app.get('/v1/care-plans', async () => ({ data: [] }));
  app.post('/v1/audit-events', async (_request, reply) => reply.code(202).send({ accepted: true }));

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.API_PORT ?? 3000);
  const host = process.env.API_HOST ?? '0.0.0.0';
  await buildServer().listen({ port, host });
}
