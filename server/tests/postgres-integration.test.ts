import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createDb } from '../src/db/client.js';
import { users, sessions, auditLogs } from '../src/db/schema/index.js';
import { createDrizzleRepository } from '../src/db/repository.js';
import { buildApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { eq } from 'drizzle-orm';

const enabled = process.env.RUN_POSTGRES_INTEGRATION === '1';

describe('PostgreSQL integration', { skip: !enabled }, () => {
  const env = loadEnv({
    ...process.env,
    NODE_ENV: 'test',
    HOST: '127.0.0.1',
    PORT: '3001',
    SESSION_SECRET: process.env.SESSION_SECRET || 'integration-test-session-secret-2026',
    APP_ORIGIN: process.env.APP_ORIGIN || 'http://localhost:5173',
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'DevAAdmin-2026!',
    SEED_MANAGER_PASSWORD: process.env.SEED_MANAGER_PASSWORD || 'DevAManager-2026!',
    SEED_ENGINEER_PASSWORD: process.env.SEED_ENGINEER_PASSWORD || 'DevAEngineer-2026!',
    SEED_B_ADMIN_PASSWORD: process.env.SEED_B_ADMIN_PASSWORD || 'DevBAdmin-2026!'
  });
  const { db, client } = createDb(env.DATABASE_URL);
  let app: Awaited<ReturnType<typeof buildApp>>;
  let baseUrl = '';

  type CookieJar = Map<string, string>;
  const cookieJar = (): CookieJar => new Map();
  const updateCookies = (jar: CookieJar, response: Response) => {
    for (const value of response.headers.getSetCookie()) {
      const [pair] = value.split(';', 1);
      const separator = pair.indexOf('=');
      if (separator > 0) jar.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  };
  const cookieHeader = (jar: CookieJar) => [...jar].map(([key, value]) => `${key}=${value}`).join('; ');

  async function request(path: string, init: RequestInit = {}, jar?: CookieJar) {
    const headers = new Headers(init.headers);
    headers.set('origin', env.APP_ORIGIN.split(',')[0].trim());
    if (jar?.size) headers.set('cookie', cookieHeader(jar));
    if (jar?.has('sb_csrf') && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method || 'GET')) headers.set('x-csrf-token', jar.get('sb_csrf')!);
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    if (jar) updateCookies(jar, response);
    const body = await response.json() as any;
    return { response, body };
  }

  async function login(phone: string, password: string) {
    const jar = cookieJar();
    const result = await request('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone, password }) }, jar);
    assert.equal(result.response.status, 200);
    return { jar, result };
  }

  before(async () => {
    app = await buildApp({ env, repository: createDrizzleRepository(db) });
    await app.listen({ host: '127.0.0.1', port: 0 });
    const address = app.server.address();
    assert.ok(address && typeof address === 'object');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await app.close();
    await client.end();
  });

  it('runs authentication, session, tenant, scope, RBAC and audit checks against PostgreSQL', async () => {
    const wrong = await request('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone: '13800000001', password: 'wrong-password' }) }, cookieJar());
    assert.equal(wrong.response.status, 401);

    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const me = await request('/api/v1/auth/me', {}, admin.jar);
    assert.equal(me.response.status, 200);
    const adminId = me.body.data.user.id as string;
    const companies = await request('/api/v1/property-companies', {}, admin.jar);
    assert.equal(companies.response.status, 200);
    assert.equal(companies.body.data.length, 1);
    const companyA = companies.body.data[0].id as string;
    const communities = await request('/api/v1/communities', {}, admin.jar);
    assert.equal(communities.response.status, 200);
    assert.deepEqual(communities.body.data.map((row: any) => row.code).sort(), ['community-a1', 'community-a2']);
    const a2 = communities.body.data.find((row: any) => row.code === 'community-a2').id as string;

    const roles = await request('/api/v1/roles', {}, admin.jar);
    assert.equal(roles.response.status, 200);
    const propertyAdminRole = roles.body.data.find((role: any) => role.code === 'PROPERTY_ADMIN').id as string;
    const bLogin = await login('13800000004', env.SEED_B_ADMIN_PASSWORD!);
    const bMe = await request('/api/v1/auth/me', {}, bLogin.jar);
    const bUserId = bMe.body.data.user.id as string;
    const crossTenant = await request(`/api/v1/users/${bUserId}/roles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ roleId: propertyAdminRole, propertyCompanyId: bMe.body.data.scope.companyIds[0] }) }, admin.jar);
    assert.equal(crossTenant.response.status, 403);

    const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!);
    const managerCommunities = await request('/api/v1/communities', {}, manager.jar);
    assert.equal(managerCommunities.response.status, 200);
    assert.deepEqual(managerCommunities.body.data.map((row: any) => row.code), ['community-a1']);
    assert.equal((await request(`/api/v1/communities/${a2}`, {}, manager.jar)).response.status, 404);

    const engineer = await login('13800000003', env.SEED_ENGINEER_PASSWORD!);
    const engineerMe = await request('/api/v1/auth/me', {}, engineer.jar);
    assert.equal(engineerMe.response.status, 200);
    const selfEscalation = await request(`/api/v1/users/${engineerMe.body.data.user.id}/roles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ roleId: propertyAdminRole, propertyCompanyId: companyA }) }, engineer.jar);
    assert.equal(selfEscalation.response.status, 403);
    const forbiddenWrite = await request('/api/v1/communities', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ propertyCompanyId: companyA, code: `not-allowed-${Date.now()}`, name: '无权小区' }) }, engineer.jar);
    assert.equal(forbiddenWrite.response.status, 403);

    const phone = `139${String(Date.now()).slice(-8)}`;
    const created = await request('/api/v1/employees', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ companyId: companyA, name: '集成测试员工', phone, password: 'Integration-2026!', employeeNo: `IT-${Date.now()}`, department: '测试', position: '测试员工', employeeType: 'STAFF' }) }, admin.jar);
    assert.equal(created.response.status, 200);
    const employeeId = created.body.data.employee.id as string;
    const employeeUserId = created.body.data.user.id as string;
    const a1 = communities.body.data.find((row: any) => row.code === 'community-a1').id as string;
    const staffRole = roles.body.data.find((role: any) => role.code === 'PROPERTY_STAFF').id as string;
    const assignment = await request(`/api/v1/users/${employeeUserId}/roles`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ roleId: staffRole, propertyCompanyId: companyA, communityId: a1 }) }, admin.jar);
    assert.equal(assignment.response.status, 200);
    assert.equal((await request(`/api/v1/users/${employeeUserId}/roles/${assignment.body.data.id}`, { method: 'DELETE' }, admin.jar)).response.status, 200);
    const employeeLogin = await login(phone, 'Integration-2026!');
    assert.equal((await request('/api/v1/auth/me', {}, employeeLogin.jar)).response.status, 200);
    const updated = await request(`/api/v1/employees/${employeeId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ department: '集成测试已更新' }) }, admin.jar);
    assert.equal(updated.response.status, 200);
    const disabled = await request(`/api/v1/employees/${employeeId}/disable`, { method: 'POST' }, admin.jar);
    assert.equal(disabled.response.status, 200);
    assert.equal((await request('/api/v1/auth/me', {}, employeeLogin.jar)).response.status, 401);
    assert.equal((await request('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone, password: 'Integration-2026!' }) }, cookieJar())).response.status, 401);

    const sessionsResult = await request('/api/v1/auth/sessions', {}, admin.jar);
    assert.equal(sessionsResult.response.status, 200);
    const secondAdmin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const secondSessions = await request('/api/v1/auth/sessions', {}, secondAdmin.jar);
    const otherSession = secondSessions.body.data.find((session: any) => !session.active).id as string;
    assert.equal((await request(`/api/v1/auth/sessions/${otherSession}`, { method: 'DELETE' }, secondAdmin.jar)).response.status, 200);
    assert.equal((await request('/api/v1/auth/me', {}, admin.jar)).response.status, 401);
    assert.equal((await request('/api/v1/auth/logout', { method: 'POST' }, secondAdmin.jar)).response.status, 200);
    assert.equal((await request('/api/v1/auth/me', {}, secondAdmin.jar)).response.status, 401);

    const auditRows = await db.select({ action: auditLogs.action }).from(auditLogs).where(eq(auditLogs.actorUserId, adminId));
    const actions = new Set(auditRows.map(row => row.action));
    for (const action of ['AUTH_LOGIN_SUCCEEDED', 'AUTH_LOGOUT', 'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DISABLED', 'ROLE_ASSIGNED', 'ROLE_REVOKED']) assert.ok(actions.has(action), `missing audit action ${action}`);
    const secretRows = await db.select({ beforeData: auditLogs.beforeData, afterData: auditLogs.afterData }).from(auditLogs);
    assert.equal(secretRows.filter(row => JSON.stringify(row).match(/password|session|secret|database_url/i)).length, 0);

    const sessionRows = await db.select({ tokenHash: sessions.tokenHash }).from(sessions);
    assert.ok(sessionRows.length > 0);
    assert.ok(sessionRows.every(row => /^[a-f0-9]{64}$/.test(row.tokenHash)));
    const [disabledRow] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.phone, phone));
    assert.match(disabledRow.passwordHash, /^\$argon2id\$/);
  });
});
