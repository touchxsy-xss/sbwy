import { createHash, randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import type { Repository, Scope, UserRecord } from '../../shared/types.js';
import { AppError, unauthorized } from '../../shared/errors.js';

export const SESSION_COOKIE = 'sb_session';
export const CSRF_COOKIE = 'sb_csrf';

export function hashToken(token: string, secret: string) {
  return createHash('sha256').update(`${secret}:${token}`).digest('hex');
}

export function createToken() { return randomBytes(32).toString('base64url'); }

export async function authenticate(repository: Repository, token: string | undefined, secret: string) {
  if (!token) throw unauthorized();
  const session = await repository.findActiveSession(hashToken(token, secret));
  if (!session) throw unauthorized('登录已失效，请重新登录');
  const user = await repository.findUserById(session.userId);
  if (!user || user.status !== 'ACTIVE') throw unauthorized('用户已被禁用');
  await repository.touchSession(session.id);
  const scope = await repository.scopeForUser(user.id, session.activePropertyCompanyId);
  return { user, session, scope };
}

export async function verifyPassword(user: UserRecord, password: string) {
  try { return await argon2.verify(user.passwordHash, password); } catch { return false; }
}

export async function hashPassword(password: string) {
  return argon2.hash(password, { type: argon2.argon2id });
}

export function can(scope: Scope, permission: string) {
  return scope.platform || scope.permissions.includes(permission);
}

export function requirePermission(scope: Scope, permission: string) {
  if (!can(scope, permission)) throw new AppError(403, 'FORBIDDEN', '无权执行该操作', { permission });
}

export function requireCompany(scope: Scope, companyId: string) {
  if (!scope.platform && !scope.companyIds.includes(companyId)) throw new AppError(403, 'FORBIDDEN', '无权访问该物业公司');
}
