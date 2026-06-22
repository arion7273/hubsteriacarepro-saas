import { badRequest } from './errors.mjs';

export async function resolveRequestContext(request, repository) {
  const tenantSlug = request.headers['x-tenant-slug'] ?? 'hubsteria-demo';
  const actorUserId = request.headers['x-actor-user-id'] ?? null;

  if (Array.isArray(tenantSlug) || typeof tenantSlug !== 'string' || tenantSlug.trim() === '') {
    throw badRequest('x-tenant-slug must be a non-empty string when provided.');
  }

  const tenant = await repository.getTenantBySlug(tenantSlug.trim());
  if (!tenant) {
    throw badRequest('x-tenant-slug must reference a known tenant.');
  }

  return {
    tenant,
    actorUserId: typeof actorUserId === 'string' && actorUserId.trim() !== '' ? actorUserId.trim() : null
  };
}
