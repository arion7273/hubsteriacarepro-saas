import { createMemoryRepository } from './memory.mjs';
import { createPostgresRepository } from './postgres.mjs';

export function createRepository(options = {}) {
  if (options.repository) return options.repository;

  const driver = options.driver ?? process.env.API_REPOSITORY_DRIVER ?? 'memory';
  if (driver === 'memory') return createMemoryRepository(options.seed);
  if (driver === 'postgres') return createPostgresRepository(options);

  throw new Error(`Unsupported API_REPOSITORY_DRIVER: ${driver}`);
}
