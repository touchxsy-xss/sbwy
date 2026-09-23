import type { FastifyReply } from 'fastify';

export function ok<T>(reply: FastifyReply, data: T, meta: Record<string, unknown> = {}) {
  return reply.send({ data, meta: { requestId: reply.request.id, ...meta } });
}

export function hideSecrets<T extends Record<string, any>>(user: T) {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
