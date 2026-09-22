import { createDefaultApp } from './app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();
const app = await createDefaultApp();
await app.listen({ port: env.PORT, host: '0.0.0.0' });
console.log(`Shengbian API: http://localhost:${env.PORT}/api/v1/health`);
