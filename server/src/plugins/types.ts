import type { Repository, Scope, SessionRecord, UserRecord } from '../shared/types.js';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: { user: UserRecord; session: SessionRecord; scope: Scope };
  }
}

export type AppOptions = {
  repository: Repository;
  env: import('../config/env.js').Env;
};
