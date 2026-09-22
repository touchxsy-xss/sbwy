import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { loadEnv } from '../config/env.js';
import * as schema from './schema/index.js';

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, { max: 10, idle_timeout: 20, connect_timeout: 10 });
  return { client, db: drizzle(client, { schema }) };
}

export type AppDb = ReturnType<typeof createDb>['db'];

export function createConfiguredDb() {
  const env = loadEnv();
  return createDb(env.DATABASE_URL);
}
