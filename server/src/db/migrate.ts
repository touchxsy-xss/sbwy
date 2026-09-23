import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createConfiguredDb } from './client.js';

const { db, client } = createConfiguredDb();
try {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Database migrations applied.');
} finally {
  await client.end();
}
