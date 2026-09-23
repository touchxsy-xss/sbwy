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
const buildingSchema = z.object({ communityId: z.string().uuid(), code: z.string().trim().min(1).max(40), name: z.string().trim().min(1).max(120), displayName: z.string().trim().max(120).optional().nullable(), legacyCode: z.string().trim().max(120).optional().nullable() });
const buildingPatchSchema = buildingSchema.partial().omit({ communityId: true }).refine(input => Object.keys(input).length > 0, '至少提供一个修改字段');
const unitSchema = z.object({ code: z.string().trim().min(1).max(40), name: z.string().trim().min(1).max(120), displayName: z.string().trim().max(120).optional().nullable() });
const unitPatchSchema = unitSchema.partial().refine(input => Object.keys(input).length > 0, '至少提供一个修改字段');
const positiveArea = z.string().regex(/^\d+(\.\d{1,2})?$/).refine(value => Number(value) > 0, '面积必须大于 0');
const houseSchema = z.object({ buildingId: z.string().uuid(), buildingUnitId: z.string().uuid().optional().nullable(), code: z.string().trim().min(1).max(40), floor: z.number().int().optional().nullable(), buildingArea: positiveArea.optional().nullable(), usableArea: positiveArea.optional().nullable(), displayName: z.string().trim().max(120).optional().nullable(), legacyCode: z.string().trim().max(120).optional().nullable() });
const housePatchSchema = houseSchema.partial().omit({ buildingId: true }).extend({ status: z.enum(['ACTIVE', 'RENOVATING', 'INACTIVE']).optional() }).refine(input => Object.keys(input).length > 0, '至少提供一个修改字段');
const personSchema = z.object({ propertyCompanyId: z.string().uuid(), userId: z.string().uuid().optional().nullable(), name: z.string().trim().min(1).max(80), phone: z.string().optional().nullable(), gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional().nullable() });
const personPatchSchema = personSchema.omit({ propertyCompanyId: true }).partial().refine(input => Object.keys(input).length > 0, '至少提供一个修改字段');
const relationSchema = z.object({ personId: z.string().uuid(), relationshipType: z.enum(['OWNER', 'TENANT', 'FAMILY_MEMBER', 'OCCUPANT']), ownershipShare: z.string().optional().nullable(), isPrimaryContact: z.boolean().optional(), startDate: z.string().date(), endDate: z.string().date().optional().nullable() });
const residentSchema = z.object({ existingPersonId: z.string().uuid().optional(), newPerson: z.object({ name: z.string().trim().min(1).max(80), phone: z.string().optional().nullable(), gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional().nullable() }).optional(), relationship: relationSchema.omit({ personId: true }) }).refine(input => Boolean(input.existingPersonId) !== Boolean(input.newPerson), '必须提供 existingPersonId 或 newPerson');
const relationPatchSchema = relationSchema.omit({ personId: true }).partial().refine(input => Object.keys(input).length > 0, '至少提供一个修改字段');
const verifyRelationSchema = z.object({ status: z.enum(['VERIFIED', 'REJECTED']), note: z.string().trim().max(500).optional().nullable() });
const assignmentSchema = z.object({ userId: z.string().uuid(), roleId: z.string().uuid(), propertyCompanyId: z.string().uuid().optional().nullable(), communityId: z.string().uuid().optional().nullable() });
const employeeOpenApiBody = {
  type: 'object',
  required: ['companyId', 'name', 'phone', 'password', 'employeeNo'],
  properties: {
    companyId: { type: 'string', format: 'uuid' }, name: { type: 'string' }, phone: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8 }, employeeNo: { type: 'string' }, department: { type: 'string' }, position: { type: 'string' }, employeeType: { type: 'string' }
  }
};
const employeePatchOpenApiBody = {
  type: 'object',
  minProperties: 1,
  properties: { name: { type: 'string' }, phone: { type: 'string' }, status: { type: 'string', enum: ['ACTIVE', 'DISABLED', 'INVITED'] }, department: { type: 'string' }, position: { type: 'string' }, employeeType: { type: 'string' } }
};

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

const propertyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  communityId: z.string().uuid().optional(),
  buildingId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  houseId: z.string().uuid().optional(),
  keyword: z.string().trim().min(1).max(120).optional(),
  relationshipType: z.enum(['OWNER', 'TENANT', 'FAMILY_MEMBER', 'OCCUPANT']).optional(),
  status: z.enum(['ACTIVE', 'RENOVATING', 'INACTIVE']).optional()
});

function propertyFilters(request: FastifyRequest) {
  return parse(propertyQuerySchema, request.query);
}

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: false, bodyLimit: 1024 * 1024, requestIdHeader: 'x-request-id' });
  const { env, repository } = options;
  const allowedOrigins = env.APP_ORIGIN.split(',').map(origin => origin.trim());
  const personAuditScope = async (person: { id: string; propertyCompanyId: string }, scope: Scope) => {
    const relationships = await repository.listPersonRelationships(person.id, scope, false);
    return { propertyCompanyId: person.propertyCompanyId, communityId: relationships[0]?.house.communityId || null };
  };
  await app.register(cookie);
  await app.register(cors, { origin: (origin, callback) => callback(null, origin ? allowedOrigins.includes(origin) : false), credentials: true, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-Id'] });
  await app.register(helmet, { global: true });
  await app.register(rateLimit, { global: false });
  await app.register(swagger, { openapi: { info: { title: '声边物业 API', version: '1.0.0' }, servers: [{ url: '/api/v1' }] } });
  await app.register(swaggerUi, { routePrefix: '/api/docs', uiConfig: { requestInterceptor: function (request) { const csrf = document.cookie.split('; ').find(item => item.startsWith('sb_csrf='))?.slice(8); if (csrf) request.headers['X-CSRF-Token'] = decodeURIComponent(csrf); return request; } } });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
    if (!request.cookies[CSRF_COOKIE]) setAuthCookie(reply, CSRF_COOKIE, createToken(), env, { httpOnly: false, maxAge: 3600 });
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.includes(origin) && origin !== 'null') throw new AppError(403, 'ORIGIN_FORBIDDEN', '请求来源不被允许');
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
    const auth = requireAuth(request); const input = parse(communitySchema, request.body); requireCompany(auth.scope, input.propertyCompanyId); requirePermission(auth.scope, 'community:create');
    const community = await repository.createCommunity(input); await repository.audit({ action: 'COMMUNITY_CREATED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'community', resourceId: community.id, requestId: request.id }); return ok(reply, community);
  });
  app.patch('/api/v1/communities/:id', async (request, reply) => {
    const auth = requireAuth(request); const id = pathId(request); const current = await repository.getCommunity(id, auth.scope); if (!current) throw notFound(); requirePermission(auth.scope, 'community:update'); const updated = await repository.updateCommunity(id, parse(communityPatchSchema, request.body), auth.scope); await repository.audit({ action: 'COMMUNITY_UPDATED', actorUserId: auth.user.id, propertyCompanyId: current.propertyCompanyId, communityId: id, resourceType: 'community', resourceId: id, requestId: request.id, beforeData: current, afterData: updated }); return ok(reply, updated);
  });
  app.post('/api/v1/communities/:id/disable', async (request, reply) => {
    const auth = requireAuth(request); const id = pathId(request); const current = await repository.getCommunity(id, auth.scope); if (!current) throw notFound(); requirePermission(auth.scope, 'community:disable'); const updated = await repository.disableCommunity(id, auth.scope); await repository.audit({ action: 'COMMUNITY_DISABLED', actorUserId: auth.user.id, propertyCompanyId: current.propertyCompanyId, communityId: id, resourceType: 'community', resourceId: id, requestId: request.id }); return ok(reply, updated);
  });

  app.get('/api/v1/employees', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:read'); return ok(reply, (await repository.listEmployees(auth.scope)).map(row => ({ ...row, user: hideSecrets(row.user), membership: row.membership }))); });
  app.get('/api/v1/employees/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:read'); const employee = await repository.getEmployee(pathId(request), auth.scope); if (!employee) throw notFound(); return ok(reply, { ...employee, user: hideSecrets(employee.user) }); });
  app.post('/api/v1/employees', { schema: { body: employeeOpenApiBody } }, async (request, reply) => {
    const auth = requireAuth(request); const input = parse(employeeSchema, request.body); requireCompany(auth.scope, input.companyId); requirePermission(auth.scope, 'employee:write'); const result = await repository.createEmployee({ companyId: input.companyId, user: { name: input.name, phone: input.phone, email: input.email || null, passwordHash: await hashPassword(input.password), status: 'ACTIVE' }, employee: { employeeNo: input.employeeNo, department: input.department || null, position: input.position || null, employeeType: input.employeeType || null } }); await repository.audit({ action: 'EMPLOYEE_CREATED', actorUserId: auth.user.id, propertyCompanyId: input.companyId, resourceType: 'employee', resourceId: result.employee.id, requestId: request.id }); return ok(reply, { ...result, user: hideSecrets(result.user) });
  });
  app.patch('/api/v1/employees/:id', { schema: { params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } }, body: employeePatchOpenApiBody } }, async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:write'); const id = pathId(request); const before = await repository.getEmployee(id, auth.scope); if (!before) throw notFound(); const result = await repository.updateEmployee(id, parse(employeePatchSchema, request.body), auth.scope); if (!result) throw notFound(); await repository.audit({ action: 'EMPLOYEE_UPDATED', actorUserId: auth.user.id, propertyCompanyId: before.membership.propertyCompanyId, resourceType: 'employee', resourceId: id, requestId: request.id, beforeData: { ...before, user: hideSecrets(before.user) }, afterData: { ...result, user: hideSecrets(result.user) } }); return ok(reply, { ...result, user: hideSecrets(result.user) }); });
  app.post('/api/v1/employees/:id/disable', { schema: { params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } } } }, async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'employee:write'); const id = pathId(request); const result = await repository.disableEmployee(id, auth.scope); if (!result) throw notFound(); await repository.audit({ action: 'EMPLOYEE_DISABLED', actorUserId: auth.user.id, resourceType: 'employee', resourceId: id, requestId: request.id }); return ok(reply, { ...result, user: hideSecrets(result.user) }); });

  app.get('/api/v1/buildings', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:read'); return ok(reply, await repository.listBuildings(auth.scope, propertyFilters(request))); });
  app.get('/api/v1/buildings/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:read'); const row = await repository.getBuilding(pathId(request), auth.scope); if (!row) throw notFound(); return ok(reply, row); });
  app.post('/api/v1/buildings', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:write'); const input = parse(buildingSchema, request.body); const row = await repository.transaction(async tx => { const community = await tx.getCommunity(input.communityId, auth.scope); if (!community) throw notFound('小区不存在或无权访问'); const created = await tx.createBuilding(input); await tx.audit({ action: 'BUILDING_CREATED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'building', resourceId: created.id, requestId: request.id, afterData: { code: created.code, name: created.name } }); return created; }); return ok(reply, row); });
  app.patch('/api/v1/buildings/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:write'); const id = pathId(request); const input = parse(buildingPatchSchema, request.body); const row = await repository.transaction(async tx => { const before = await tx.getBuilding(id, auth.scope); if (!before) throw notFound(); const community = await tx.getCommunity(before.communityId, auth.scope); if (!community) throw notFound(); const updated = await tx.updateBuilding(id, input, auth.scope); await tx.audit({ action: 'BUILDING_UPDATED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'building', resourceId: id, requestId: request.id, beforeData: { code: before.code, name: before.name }, afterData: updated }); return updated; }); return ok(reply, row); });
  app.post('/api/v1/buildings/:id/disable', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:write'); const id = pathId(request); const row = await repository.transaction(async tx => { const before = await tx.getBuilding(id, auth.scope); if (!before) throw notFound(); const community = await tx.getCommunity(before.communityId, auth.scope); if (!community) throw notFound(); const updated = await tx.disableBuilding(id, auth.scope); await tx.audit({ action: 'BUILDING_DISABLED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'building', resourceId: id, requestId: request.id }); return updated; }); return ok(reply, row); });
  app.get('/api/v1/buildings/:id/units', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:read'); return ok(reply, await repository.listBuildingUnits(pathId(request), auth.scope)); });
  app.post('/api/v1/buildings/:id/units', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:write'); const buildingId = pathId(request); const input = parse(unitSchema, request.body); const row = await repository.transaction(async tx => { const building = await tx.getBuilding(buildingId, auth.scope); if (!building) throw notFound(); const community = await tx.getCommunity(building.communityId, auth.scope); if (!community) throw notFound(); const created = await tx.createBuildingUnit({ ...input, buildingId: building.id }); await tx.audit({ action: 'BUILDING_UNIT_CREATED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'building_unit', resourceId: created.id, requestId: request.id }); return created; }); return ok(reply, row); });
  app.get('/api/v1/units/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:read'); const row = await repository.getBuildingUnit(pathId(request), auth.scope); if (!row) throw notFound(); return ok(reply, row); });
  app.patch('/api/v1/units/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:write'); const id = pathId(request); const input = parse(unitPatchSchema, request.body); const row = await repository.transaction(async tx => { const before = await tx.getBuildingUnit(id, auth.scope); if (!before) throw notFound(); const building = await tx.getBuilding(before.buildingId, auth.scope); if (!building) throw notFound(); const community = await tx.getCommunity(building.communityId, auth.scope); if (!community) throw notFound(); const updated = await tx.updateBuildingUnit(id, input, auth.scope); await tx.audit({ action: 'BUILDING_UNIT_UPDATED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'building_unit', resourceId: id, requestId: request.id, beforeData: { code: before.code, name: before.name }, afterData: updated }); return updated; }); return ok(reply, row); });
  app.post('/api/v1/units/:id/disable', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'building:write'); const id = pathId(request); const row = await repository.transaction(async tx => { const before = await tx.getBuildingUnit(id, auth.scope); if (!before) throw notFound(); const building = await tx.getBuilding(before.buildingId, auth.scope); if (!building) throw notFound(); const community = await tx.getCommunity(building.communityId, auth.scope); if (!community) throw notFound(); const updated = await tx.disableBuildingUnit(id, auth.scope); await tx.audit({ action: 'BUILDING_UNIT_DISABLED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'building_unit', resourceId: id, requestId: request.id }); return updated; }); return ok(reply, row); });

  app.get('/api/v1/houses', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house:read'); return ok(reply, await repository.listHouses(auth.scope, propertyFilters(request))); });
  app.get('/api/v1/houses/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house:read'); const row = await repository.getHouse(pathId(request), auth.scope); if (!row) throw notFound(); return ok(reply, row); });
  app.post('/api/v1/houses', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house:write'); const input = parse(houseSchema, request.body); const row = await repository.transaction(async tx => { const building = await tx.getBuilding(input.buildingId, auth.scope); if (!building) throw notFound('楼栋不存在或无权访问'); const community = await tx.getCommunity(building.communityId, auth.scope); if (!community) throw notFound(); if (input.buildingUnitId) { const unit = await tx.getBuildingUnit(input.buildingUnitId, auth.scope); if (!unit || unit.buildingId !== building.id) throw badRequest('单元不属于该楼栋'); } const created = await tx.createHouse(input); await tx.audit({ action: 'HOUSE_CREATED', actorUserId: auth.user.id, propertyCompanyId: community.propertyCompanyId, communityId: community.id, resourceType: 'house', resourceId: created.id, requestId: request.id, afterData: { code: created.code, buildingId: created.buildingId, buildingUnitId: created.buildingUnitId } }); return tx.getHouse(created.id, auth.scope); }); return ok(reply, row); });
  app.patch('/api/v1/houses/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house:write'); const id = pathId(request); const input = parse(housePatchSchema, request.body); const row = await repository.transaction(async tx => { const before = await tx.getHouse(id, auth.scope); if (!before) throw notFound(); if (input.buildingUnitId && input.buildingUnitId !== before.buildingUnitId) { const unit = await tx.getBuildingUnit(input.buildingUnitId, auth.scope); if (!unit || unit.buildingId !== before.buildingId) throw badRequest('单元不属于该楼栋'); } const updated = await tx.updateHouse(id, input, auth.scope); await tx.audit({ action: 'HOUSE_UPDATED', actorUserId: auth.user.id, propertyCompanyId: before.propertyCompanyId, communityId: before.communityId, resourceType: 'house', resourceId: id, requestId: request.id, beforeData: { code: before.code }, afterData: updated }); return updated; }); return ok(reply, row); });
  app.post('/api/v1/houses/:id/disable', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house:write'); const id = pathId(request); const row = await repository.transaction(async tx => { const before = await tx.getHouse(id, auth.scope); if (!before) throw notFound(); const updated = await tx.disableHouse(id, auth.scope); await tx.audit({ action: 'HOUSE_DISABLED', actorUserId: auth.user.id, propertyCompanyId: before.propertyCompanyId, communityId: before.communityId, resourceType: 'house', resourceId: id, requestId: request.id }); return updated; }); return ok(reply, row); });

  app.get('/api/v1/people', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'person:read'); return ok(reply, await repository.listPeople(auth.scope, propertyFilters(request))); });
  app.get('/api/v1/people/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'person:read'); const row = await repository.getPerson(pathId(request), auth.scope); if (!row) throw notFound(); return ok(reply, row); });
  app.post('/api/v1/people', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'person:write'); if (!auth.scope.platform && !auth.scope.companyWide) throw forbidden('小区范围用户必须通过房屋住户入口创建客户'); const input = parse(personSchema, request.body); requireCompany(auth.scope, input.propertyCompanyId); const row = await repository.transaction(async tx => { const created = await tx.createPerson(input); await tx.audit({ action: 'PERSON_CREATED', actorUserId: auth.user.id, propertyCompanyId: created.propertyCompanyId, resourceType: 'person', resourceId: created.id, requestId: request.id, afterData: { name: created.name, phone: created.phone ? 'REDACTED' : null } }); return created; }); return ok(reply, { ...row, phone: undefined, maskedPhone: row.phone ? `${row.phone.slice(0, 3)}****${row.phone.slice(-4)}` : null }); });
  app.patch('/api/v1/people/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'person:write'); const id = pathId(request); const input = parse(personPatchSchema, request.body); const row = await repository.transaction(async tx => { const before = await tx.getPerson(id, auth.scope); if (!before) throw notFound(); const relationships = await tx.listPersonRelationships(before.id, auth.scope, false); const auditScope = { propertyCompanyId: before.propertyCompanyId, communityId: relationships[0]?.house.communityId || null }; const updated = await tx.updatePerson(id, input, auth.scope); await tx.audit({ action: 'PERSON_UPDATED', actorUserId: auth.user.id, ...auditScope, resourceType: 'person', resourceId: id, requestId: request.id, beforeData: { name: before.name }, afterData: updated ? { name: updated.name, phone: updated.phone ? 'REDACTED' : null } : undefined }); return updated; }); return ok(reply, row ? { ...row, phone: undefined, maskedPhone: row.phone ? `${row.phone.slice(0, 3)}****${row.phone.slice(-4)}` : null } : row); });
  app.post('/api/v1/people/:id/disable', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'person:write'); const id = pathId(request); const row = await repository.transaction(async tx => { const before = await tx.getPerson(id, auth.scope); if (!before) throw notFound(); const relationships = await tx.listPersonRelationships(before.id, auth.scope, false); const auditScope = { propertyCompanyId: before.propertyCompanyId, communityId: relationships[0]?.house.communityId || null }; const updated = await tx.disablePerson(id, auth.scope); await tx.audit({ action: 'PERSON_DISABLED', actorUserId: auth.user.id, ...auditScope, resourceType: 'person', resourceId: id, requestId: request.id }); return updated; }); return ok(reply, row); });
  app.get('/api/v1/people/:id/contact', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'person:phone:read'); const id = pathId(request); const person = await repository.getPerson(id, auth.scope); if (!person) throw notFound(); const row = await repository.getPersonContact(id, auth.scope); if (!row) throw notFound(); const auditScope = await personAuditScope(person, auth.scope); await repository.audit({ action: 'PERSON_PHONE_VIEWED', actorUserId: auth.user.id, ...auditScope, resourceType: 'person', resourceId: id, requestId: request.id }); return ok(reply, row); });
  app.get('/api/v1/people/:id/relationships', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house_relation:read'); const rows = await repository.listPersonRelationships(pathId(request), auth.scope, true); if (!rows.length) { const person = await repository.getPerson(pathId(request), auth.scope, { includeHistory: true }); if (!person) throw notFound(); } return ok(reply, rows); });

  app.get('/api/v1/houses/:id/relationships', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house_relation:read'); if (!(await repository.getHouse(pathId(request), auth.scope))) throw notFound(); return ok(reply, await repository.listHouseRelationships(pathId(request), auth.scope, true)); });
  app.post('/api/v1/houses/:id/relationships', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house_relation:write'); const houseId = pathId(request); const input = parse(relationSchema, request.body); const row = await repository.transaction(async tx => { const house = await tx.getHouse(houseId, auth.scope); if (!house) throw notFound(); const person = await tx.getPerson(input.personId, auth.scope); if (!person || person.propertyCompanyId !== house.propertyCompanyId) throw forbidden('客户不属于当前物业公司或小区'); const created = await tx.createHouseRelationship({ houseId: house.id, ...input }); await tx.audit({ action: 'HOUSE_RELATION_CREATED', actorUserId: auth.user.id, propertyCompanyId: house.propertyCompanyId, communityId: house.communityId, resourceType: 'house_relationship', resourceId: created.id, requestId: request.id }); return created; }); return ok(reply, row); });
  app.post('/api/v1/houses/:id/residents', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house_relation:write'); const input = parse(residentSchema, request.body); const result = await repository.createResidentAtomic({ houseId: pathId(request), existingPersonId: input.existingPersonId, newPerson: input.newPerson, relationship: input.relationship, actorUserId: auth.user.id, requestId: request.id }, auth.scope); return ok(reply, { person: { ...result.person, phone: undefined, maskedPhone: result.person.phone ? `${result.person.phone.slice(0, 3)}****${result.person.phone.slice(-4)}` : null }, relationship: result.relationship }); });
  app.patch('/api/v1/house-relationships/:id', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house_relation:write'); const id = pathId(request); const input = parse(relationPatchSchema, request.body); const row = await repository.transaction(async tx => { const updated = await tx.updateHouseRelationship(id, input, auth.scope); if (!updated) throw notFound(); const house = await tx.getHouse(updated.houseId, auth.scope); if (!house) throw notFound(); await tx.audit({ action: 'HOUSE_RELATION_UPDATED', actorUserId: auth.user.id, propertyCompanyId: house.propertyCompanyId, communityId: house.communityId, resourceType: 'house_relationship', resourceId: updated.id, requestId: request.id }); return updated; }); return ok(reply, row); });
  app.post('/api/v1/house-relationships/:id/end', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house_relation:write'); const body = z.object({ endDate: z.string().date() }).parse(request.body); const id = pathId(request); const row = await repository.transaction(async tx => { const updated = await tx.endHouseRelationship(id, body.endDate, auth.scope); if (!updated) throw notFound(); const house = await tx.getHouse(updated.houseId, auth.scope); if (!house) throw notFound(); await tx.audit({ action: 'HOUSE_RELATION_ENDED', actorUserId: auth.user.id, propertyCompanyId: house.propertyCompanyId, communityId: house.communityId, resourceType: 'house_relationship', resourceId: updated.id, requestId: request.id }); return updated; }); return ok(reply, row); });
  app.post('/api/v1/house-relationships/:id/verify', async (request, reply) => { const auth = requireAuth(request); requirePermission(auth.scope, 'house_relation:write'); const body = parse(verifyRelationSchema, request.body); const id = pathId(request); const row = await repository.transaction(async tx => { const updated = await tx.verifyHouseRelationship(id, body.status, body.note || null, auth.user.id, auth.scope); if (!updated) throw notFound(); const house = await tx.getHouse(updated.houseId, auth.scope); if (!house) throw notFound(); await tx.audit({ action: body.status === 'VERIFIED' ? 'HOUSE_RELATION_VERIFIED' : 'HOUSE_RELATION_REJECTED', actorUserId: auth.user.id, propertyCompanyId: house.propertyCompanyId, communityId: house.communityId, resourceType: 'house_relationship', resourceId: updated.id, requestId: request.id }); return updated; }); return ok(reply, row); });

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
