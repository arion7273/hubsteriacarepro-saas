import { createMemoryRepository } from './memory.mjs';
import { createPostgresRepository } from './postgres.mjs';

export function createRepository(options = {}) {
  if (options.repository) return options.repository;

  const explicitDriver = options.driver ?? process.env.API_REPOSITORY_DRIVER;
  const hasDatabaseUrl = Boolean(options.databaseUrl ?? process.env.DATABASE_URL);
  const driver = explicitDriver ?? (hasDatabaseUrl ? 'postgres' : 'memory');

  if (driver === 'memory') return createMemoryRepository(options.seed);
  if (driver === 'postgres') return createPostgresRepository(options);

  throw new Error(`Unsupported API_REPOSITORY_DRIVER: ${driver}`);
}
