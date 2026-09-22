import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  APP_ORIGIN: z.string().url().default('http://localhost:5173'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
  SEED_MANAGER_PASSWORD: z.string().min(8).optional(),
  SEED_ENGINEER_PASSWORD: z.string().min(8).optional(),
  SEED_B_ADMIN_PASSWORD: z.string().min(8).optional()
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`环境变量校验失败：${details}`);
  }
  return parsed.data;
}
