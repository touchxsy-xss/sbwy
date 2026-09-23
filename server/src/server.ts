import { createDefaultApp } from './app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();
const app = await createDefaultApp();
await app.listen({ port: env.PORT, host: env.HOST });
console.log(`Shengbian API: http://${env.HOST}:${env.PORT}/api/v1/health`);
