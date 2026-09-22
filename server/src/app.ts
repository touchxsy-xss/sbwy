import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { z } from 'zod';
import { loadEnv } from './config/env.js';
import type { AppOptions } from './plugins/types.js';
import { authenticate, can, CSRF_COOKIE, hashPassword, hashToken, requireCompany, requirePermission, SESSION_COOKIE, createToken, verifyPassword } from './modules/auth/service.js';
import { AppError, badRequest, conflict, forbidden, notFound, unauthorized, validationError } from './shared/errors.js';
import { hideSecrets, ok } from './shared/http.js';
import type { Scope } from './shared/types.js';

const loginSchema = z.object({ phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'), password: z.string().min(8) });
const companySchema = z.object({ code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/), name: z.string().trim().min(2).max(120) });
const communitySchema = z.object({ propertyCompanyId: z.string().uuid(), code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/), name: z.string().trim().min(2).max(120), address: z.string().trim().max(240).optional().nullable() });
const communityPatchSchema = z.object({ name: z.string().trim().min(2).max(120).optional(), address: z.string().trim().max(240).optional().nullable() }).refine(input => Object.keys(input).length > 0, '至少提供一个修改字段');
const employeeSchema = z.object({ companyId: z.string().uuid(), name: z.string().trim().min(2).max(80), phone: z.string().regex(/^1[3-9]\d{9}$/), email: z.string().email().optional().nullable(), password: z.string().min(8), employeeNo: z.string().trim().min(1).max(40), department: z.string().trim().max(80).optional().nullable(), position: z.string().trim().max(80).optional().nullable(), employeeType: z.string().trim().max(80).optional().nullable() });
const employeePatchSchema = z.object({ name: z.string().trim().min(2).max(80).optional(), phone: z.string().regex(/^1[3-9]\d{9}$/).optional().nullable(), status: z.enum(['ACTIVE', 'DISABLED', 'INVITED']).optional(), department: z.string().trim().max(80).optional().nullable(), position: z.string().trim().max(80).optional().nullable(), employeeType: z.string().trim().max(80).optional().nullable() }).refine(input => Object.keys(input).length > 0, '至少提供一个修改字段');
const assignmentSchema = z.object({ userId: z.string().uuid(), roleId: z.string().uuid(), propertyCompanyId: z.string().uuid().optional().nullable(), communityId: z.string().uuid().optional().nullable() });

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw validationError(result.error.flatten());
  return result.data;
}

function pathId(request: FastifyRequest, key = 'id') {
  const value = (request.params as Record<string, string>)[key];
  if (!value) throw badRequest(`缺少路径参数 ${key}`);
  return value;
}

function setAuthCookie(reply: FastifyReply, name: string, value: string, env: AppOptions['env'], options: { httpOnly?: boolean; maxAge?: number } = {}) {
  reply.setCookie(name, value, { httpOnly: options.httpOnly ?? true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/', maxAge: options.maxAge });
}

function clearAuthCookie(reply: FastifyReply, name: string, env: AppOptions['env']) {
  reply.clearCookie(name, { httpOnly: name === SESSION_COOKIE, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/' });
}

function allowedCompany(scope: Scope, companyId: string) {
  return scope.platform || scope.companyIds.includes(companyId);
}

function requireAuth(request: FastifyRequest) {
  if (!request.auth) throw unauthorized();
  return request.auth;
}

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false, bodyLimit: 1024 * 1024, requestIdHeader: 'x-request-id' });
  const { env, repository } = options;
  await app.register(cookie);
  await app.register(cors, { origin: env.APP_ORIGIN, credentials: true, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-Id'] });
  await app.register(helmet, { global: true });
  await app.register(rateLimit, { global: false });
  await app.register(swagger, { openapi: { info: { title: '声边物业 API', version: '1.0.0' }, servers: [{ url: '/api/v1' }] } });
  await app.register(swaggerUi, { routePrefix: '/api/docs' });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
    if (!request.cookies[CSRF_COOKIE]) setAuthCookie(reply, CSRF_COOKIE, createToken(), env, { httpOnly: false, maxAge: 3600 });
    const origin = request.headers.origin;
    if (origin && origin !== env.APP_ORIGIN && origin !== 'null') throw new AppError(403, 'ORIGIN_FORBIDDEN', '请求来源不被允许');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) && request.cookies[SESSION_COOKIE] && request.url !== '/api/v1/auth/login') {
      const csrf = request.headers['x-csrf-token'];
      if (!csrf || csrf !== request.cookies[CSRF_COOKIE]) throw new AppError(403, 'CSRF_FAILED', 'CSRF 校验失败');
    }
    const token = request.cookies[SESSION_COOKIE];
    if (token) {
      try { request.auth = await authenticate(repository, token, env.SESSION_SECRET); }
      catch (error) { if (error instanceof AppError && error.statusCode === 401) clearAuthCookie(reply, SESSION_COOKIE, env); }
    }
  });

  app.setErrorHandler((error, request, reply) => {
    const errorRecord = error as Error & { statusCode?: number; name?: string };
    const appError = error instanceof AppError ? error : errorRecord.name === 'ZodError' ? validationError(error) : null;
    const statusCode = appError?.statusCode || ((errorRecord.statusCode && errorRecord.statusCode >= 400 && errorRecord.statusCode < 500) ? errorRecord.statusCode : 500);
    const code = appError?.code || (statusCode === 409 ? 'CONFLICT' : statusCode === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR');
    const message = appError?.message || (statusCode >= 500 ? '服务暂时不可用' : errorRecord.message);
    if (statusCode >= 500) request.log.error(error);
    reply.status(statusCode).send({ error: { code, message, details: appError?.details || {} }, meta: { requestId: request.id } });
  });

  app.get('/api/v1/health', async (_request, reply) => ok(reply, { status: 'ok', service: 'shengbian-property-server' }));

  app.post('/api/v1/auth/login', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const input = parse(loginSchema, request.body);
    const user = await repository.findUserByPhone(input.phone);
    const valid = user && user.status === 'ACTIVE' ? await verifyPassword(user, input.password) : false;
    if (!valid || !user) {
      await repository.audit({ action: 'AUTH_LOGIN_FAILED', resourceType: 'user', requestId: request.id, userAgent: request.headers['user-agent'] || null });
      throw unauthorized('账号或密码不正确');
    }
    const memberships = await repository.listAssignments(user.id);
    const activeCompany = memberships.find(item => item.role.scopeType === 'COMPANY')?.propertyCompanyId || memberships.find(item => item.propertyCompanyId)?.propertyCompanyId || null;
    const token = createToken();
    const session = await repository.createSession({ id: crypto.randomUUID(), userId: user.id, tokenHash: hashToken(token, env.SESSION_SECRET), activePropertyCompanyId: activeCompany, expiresAt: new Date(Date.now() + 7 * 86400000), userAgent: request.headers['user-agent'] || null, ipHash: null });
    await repository.updateUserLastLogin(user.id);
    await repository.audit({ action: 'AUTH_LOGIN_SUCCEEDED', actorUserId: user.id, propertyCompanyId: activeCompany, requestId: request.id, userAgent: request.headers['user-agent'] || null });
    setAuthCookie(reply, SESSION_COOKIE, token, env, { maxAge: 7 * 86400 });
    return ok(reply, { user: hideSecrets(user), session: { id: session.id, expiresAt: session.expiresAt }, activePropertyCompanyId: activeCompany });
  });

  app.post('/api/v1/auth/logout', async (request, reply) => {
    const auth = requireAuth(request);
    await repository.revokeSession(auth.session.id);
    await repository.audit({ action: 'AUTH_LOGOUT', actorUserId: auth.user.id, propertyCompanyId: auth.scope.activePropertyCompanyId, requestId: request.id });
    clearAuthCookie(reply, SESSION_COOKIE, env);
    return ok(reply, { loggedOut: true });
  });

  app.get('/api/v1/auth/me', async (request, reply) => {
    const auth = requireAuth(request);
    return ok(reply, { user: hideSecrets(auth.user), scope: auth.scope, memberships: await repository.listAssignments(auth.user.id) });
  });

  app.get('/api/v1/auth/sessions', async (request, reply) => {
    const auth = requireAuth(request);
    const rows = await repository.listSessions(auth.user.id);
    return ok(reply, rows.map(row => ({ id: row.id, active: row.id === auth.session.id, expiresAt: row.expiresAt, lastSeenAt: row.lastSeenAt, createdAt: row.createdAt, userAgent: row.userAgent })));
  });

  app.delete('/api/v1/auth/sessions/:id', async (request, reply) => {
    const auth = requireAuth(request); const id = pathId(request);
    const owns = (await repository.listSessions(auth.user.id)).some(session => session.id === id);
    if (!owns) throw notFound('Session 不存在');
    await repository.revokeSession(id);
    return ok(reply, { revoked: true });
  });

  app.get('/api/v1/property-companies/current', async (request, reply) => {
    const auth = requireAuth(request);
    if (!auth.scope.activePropertyCompanyId) throw notFound('当前用户没有激活的物业公司');
    const company = await repository.getCompany(auth.scope.activePropertyCompanyId, auth.scope);
    if (!company) throw notFound('物业公司不存在');
    return ok(reply, company);
  });

  app.get('/api/v1/property-companies', async (request, reply) => {
    const auth = requireAuth(request); return ok(reply, await repository.listCompanies(auth.scope));
  });

  app.post('/api/v1/property-companies', async (request, reply) => {
    const auth = requireAuth(request); if (!auth.scope.platform) throw forbidden();
    const input = parse(companySchema, request.body); const company = await repository.createCompany(input);
    await repository.audit({ action: 'PROPERTY_COMPANY_CREATED', actorUserId: auth.user.id, propertyCompanyId: company.id, resourceType: 'property_company', resourceId: company.id, requestId: request.id, afterData: { code: company.code, name: company.name } });
    return ok(reply, company);
  });

  app.get('/api/v1/communities', async (request, reply) => { const auth = requireAuth(request); return ok(reply, await repository.listCommunities(auth.scope)); });
  app.get('/api/v1/communities/:id', async (request, reply) => { const auth = requireAuth(request); const community = await repository.getCommunity(pathId(request), auth.scope); if (!community) throw notFound(); return ok(reply, community); });
  app.post('/api/v1/communities', async (request, reply) => {
    const auth = requireAuth(request); const input = parse(communitySchema, request.body); requireCompany(auth.scope, input.propertyCompanyId); requirePermission(auth.scope, 'community:write');
    const community = await repository.createCommunity(input); await repository.audit({ action: 'COMMUNITY_CREATED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'community', resourceId: community.id, requestId: request.id }); return ok(reply, community);
  });
  app.patch('/api/v1/communities/:id', async (request, reply) => {
    const auth = requireAuth(request); const id = pathId(request); const current = await repository.getCommunity(id, auth.scope); if (!current) throw notFound(); requirePermission(auth.scope, 'community:write'); const updated = await repository.updateCommunity(id, parse(communityPatchSchema, request.body), auth.scope); await repository.audit({ action: 'COMMUNITY_UPDATED', actorUserId: auth.user.id, propertyCompanyId: current.propertyCompanyId, communityId: id, resourceType: 'community', resourceId: id, requestId: request.id, beforeData: current, afterData: updated }); return ok(reply, updated);
  });
  app.post('/api/v1/communities/:id/disable', async (request, reply) => {
    const auth = requireAuth(request); const id = pathId(request); const current = await repository.getCommunity(id, auth.scope); if (!current) throw notFound(); requirePermission(auth.scope, 'community:write'); const updated = await repository.disableCommunity(id, auth.scope); await repository.audit({ action: 'COMMUNITY_DISABLED', actorUserId: auth.user.id, propertyCompanyId: current.propertyCompanyId, communityId: id, resourceType: 'community', resourceId: id, requestId: request.id }); return ok(reply, updated);
  });

  app.get('/api/v1/employees', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:read'); return ok(reply, (await repository.listEmployees(auth.scope)).map(row => ({ ...row, user: hideSecrets(row.user), membership: row.membership }))); });
  app.get('/api/v1/employees/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:read'); const employee = await repository.getEmployee(pathId(request), auth.scope); if (!employee) throw notFound(); return ok(reply, { ...employee, user: hideSecrets(employee.user) }); });
  app.post('/api/v1/employees', async (request, reply) => {
    const auth = requireAuth(request); const input = parse(employeeSchema, request.body); requireCompany(auth.scope, input.companyId); requirePermission(auth.scope, 'employee:write'); const result = await repository.createEmployee({ companyId: input.companyId, user: { name: input.name, phone: input.phone, email: input.email || null, passwordHash: await hashPassword(input.password), status: 'ACTIVE' }, employee: { employeeNo: input.employeeNo, department: input.department || null, position: input.position || null, employeeType: input.employeeType || null } }); await repository.audit({ action: 'EMPLOYEE_CREATED', actorUserId: auth.user.id, propertyCompanyId: input.companyId, resourceType: 'employee', resourceId: result.employee.id, requestId: request.id }); return ok(reply, { ...result, user: hideSecrets(result.user) });
  });
  app.patch('/api/v1/employees/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:write'); const id = pathId(request); const before = await repository.getEmployee(id, auth.scope); if (!before) throw notFound(); const result = await repository.updateEmployee(id, parse(employeePatchSchema, request.body), auth.scope); if (!result) throw notFound(); await repository.audit({ action: 'EMPLOYEE_UPDATED', actorUserId: auth.user.id, propertyCompanyId: before.membership.propertyCompanyId, resourceType: 'employee', resourceId: id, requestId: request.id, beforeData: { ...before, user: hideSecrets(before.user) }, afterData: { ...result, user: hideSecrets(result.user) } }); return ok(reply, { ...result, user: hideSecrets(result.user) }); });
  app.post('/api/v1/employees/:id/disable', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:write'); const id = pathId(request); const result = await repository.disableEmployee(id, auth.scope); if (!result) throw notFound(); await repository.audit({ action: 'EMPLOYEE_DISABLED', actorUserId: auth.user.id, resourceType: 'employee', resourceId: id, requestId: request.id }); return ok(reply, { ...result, user: hideSecrets(result.user) }); });

  app.get('/api/v1/roles', async (request, reply) => { const auth = requireAuth(request); if (!can(auth.scope, 'role:read')) throw forbidden(); return ok(reply, await repository.listRoles()); });
  app.get('/api/v1/permissions', async (request, reply) => { const auth = requireAuth(request); if (!can(auth.scope, 'role:read')) throw forbidden(); return ok(reply, await repository.listPermissions()); });
  app.get('/api/v1/users/:id/roles', async (request, reply) => {
    const auth = requireAuth(request);
    if (!can(auth.scope, 'access:read')) throw forbidden();
    const id = pathId(request);
    const target = await repository.findUserById(id);
    if (!target) throw notFound('用户不存在');
    if (!auth.scope.platform && !(await Promise.all(auth.scope.companyIds.map(companyId => repository.hasCompanyMembership(id, companyId))).then(values => values.some(Boolean)))) throw forbidden();
    return ok(reply, await repository.listAssignments(id));
  });
  app.post('/api/v1/users/:id/roles', async (request, reply) => {
    const auth = requireAuth(request);
    requirePermission(auth.scope, 'access:write');
    const input = parse(assignmentSchema, { ...(request.body as object), userId: pathId(request) });
    const targetUser = await repository.findUserById(input.userId);
    if (!targetUser) throw notFound('用户不存在');
    const role = (await repository.listRoles()).find(item => item.id === input.roleId);
    if (!role) throw notFound('角色不存在');
    let propertyCompanyId = input.propertyCompanyId || null;
    if (role.scopeType === 'PLATFORM') {
      if (!auth.scope.platform || propertyCompanyId || input.communityId) throw forbidden('平台角色只能由平台管理员授予');
    } else if (role.scopeType === 'COMPANY') {
      if (!propertyCompanyId || input.communityId) throw badRequest('公司角色必须绑定物业公司');
      requireCompany(auth.scope, propertyCompanyId);
      if (!auth.scope.platform && !(await repository.hasCompanyMembership(targetUser.id, propertyCompanyId))) throw forbidden('目标用户不属于该物业公司');
    } else {
      if (!input.communityId) throw badRequest('小区角色必须绑定小区');
      const communityCompanyId = await repository.getCommunityCompanyId(input.communityId);
      if (!communityCompanyId) throw notFound('小区不存在');
      if (propertyCompanyId && propertyCompanyId !== communityCompanyId) throw badRequest('小区与物业公司不匹配');
      propertyCompanyId = communityCompanyId;
      if (!auth.scope.platform && !auth.scope.communityIds.includes(input.communityId) && !auth.scope.companyWide) throw forbidden();
      requireCompany(auth.scope, propertyCompanyId);
      if (!auth.scope.platform && !(await repository.hasCompanyMembership(targetUser.id, propertyCompanyId))) throw forbidden('目标用户不属于该物业公司');
    }
    const assignment = await repository.assignRole({ ...input, propertyCompanyId });
    await repository.audit({ action: 'ROLE_ASSIGNED', actorUserId: auth.user.id, propertyCompanyId, communityId: input.communityId, resourceType: 'user_role_assignment', resourceId: assignment.id, requestId: request.id });
    return ok(reply, assignment);
  });
  app.delete('/api/v1/users/:id/roles/:roleId', async (request, reply) => {
    const auth = requireAuth(request);
    requirePermission(auth.scope, 'access:write');
    const targetId = pathId(request);
    const assignmentId = pathId(request, 'roleId');
    const assignment = await repository.getAssignment(assignmentId);
    if (!assignment || assignment.userId !== targetId) throw notFound('授权不存在');
    if (!auth.scope.platform && assignment.propertyCompanyId && !auth.scope.companyIds.includes(assignment.propertyCompanyId)) throw forbidden();
    if (!auth.scope.platform && assignment.communityId && !auth.scope.communityIds.includes(assignment.communityId) && !auth.scope.companyWide) throw forbidden();
    await repository.revokeRole(assignmentId);
    await repository.audit({ action: 'ROLE_REVOKED', actorUserId: auth.user.id, propertyCompanyId: assignment.propertyCompanyId, communityId: assignment.communityId, resourceType: 'user_role_assignment', resourceId: assignmentId, requestId: request.id });
    return ok(reply, { revoked: true });
  });

  return app;
}

export async function createDefaultApp() {
  const env = loadEnv();
  const { createConfiguredDb } = await import('./db/client.js');
  const { createDrizzleRepository } = await import('./db/repository.js');
  const { db, client } = createConfiguredDb();
  const app = await buildApp({ env, repository: createDrizzleRepository(db) });
  app.addHook('onClose', async () => { await client.end(); });
  return app;
}
