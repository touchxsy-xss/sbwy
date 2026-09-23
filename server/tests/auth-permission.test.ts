import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApp } from '../src/app.js';
import { createMemoryRepository } from '../src/db/memory.js';
import { hashPassword } from '../src/modules/auth/service.js';
import type { AppOptions } from '../src/plugins/types.js';
import type { CommunityRecord, CompanyRecord, MembershipRecord, PermissionRecord, RoleRecord, UserRecord } from '../src/shared/types.js';

const env: AppOptions['env'] = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 3001,
  DATABASE_URL: 'postgres://test.invalid/shengbian',
  SESSION_SECRET: 'test-session-secret-with-at-least-32-characters',
  APP_ORIGIN: 'http://localhost:5173',
  COOKIE_SECURE: false,
  SEED_ADMIN_PASSWORD: undefined,
  SEED_MANAGER_PASSWORD: undefined,
  SEED_ENGINEER_PASSWORD: undefined,
  SEED_B_ADMIN_PASSWORD: undefined
};

const date = new Date('2026-01-01T00:00:00.000Z');
const company = (id: string, code: string): CompanyRecord => ({ id, code, name: code, status: 'ACTIVE', disabledAt: null, createdAt: date, updatedAt: date });
const community = (id: string, propertyCompanyId: string, code: string): CommunityRecord => ({ id, propertyCompanyId, code, name: code, address: null, status: 'ACTIVE', disabledAt: null, createdAt: date, updatedAt: date });
const user = (id: string, phone: string, passwordHash: string): UserRecord => ({ id, name: id, phone, email: null, passwordHash, status: 'ACTIVE', lastLoginAt: null, disabledAt: null, createdAt: date, updatedAt: date });
const role = (id: string, code: string, scopeType: RoleRecord['scopeType']): RoleRecord => ({ id, code, name: code, scopeType, createdAt: date, updatedAt: date });
const permission = (id: string, code: string): PermissionRecord => ({ id, code, name: code, resource: code.split(':')[0], action: code.split(':')[1], createdAt: date, updatedAt: date });
const membership = (id: string, userId: string, propertyCompanyId: string): MembershipRecord => ({ id, userId, propertyCompanyId, membershipType: 'PROPERTY_ADMIN', status: 'ACTIVE', joinedAt: date, leftAt: null, createdAt: date, updatedAt: date });

async function fixture() {
  const passwordHash = await hashPassword('correct-password');
  const companies = [company('00000000-0000-0000-0000-000000000001', 'company-a'), company('00000000-0000-0000-0000-000000000002', 'company-b')];
  const communities = [community('00000000-0000-0000-0000-000000000011', companies[0].id, 'community-a'), community('00000000-0000-0000-0000-000000000012', companies[1].id, 'community-b')];
  const users = [user('00000000-0000-0000-0000-000000000101', '13800000001', passwordHash), user('00000000-0000-0000-0000-000000000102', '13800000002', passwordHash)];
  const roles = [role('00000000-0000-0000-0000-000000000201', 'PROPERTY_ADMIN', 'COMPANY'), role('00000000-0000-0000-0000-000000000202', 'COMMUNITY_MANAGER', 'COMMUNITY')];
  const permissions = [permission('00000000-0000-0000-0000-000000000301', 'community:read'), permission('00000000-0000-0000-0000-000000000302', 'community:write'), permission('00000000-0000-0000-0000-000000000303', 'access:write')];
  const repository = createMemoryRepository({
    companies,
    communities,
    users,
    memberships: [membership('00000000-0000-0000-0000-000000000401', users[0].id, companies[0].id)],
    roles,
    permissions,
    rolePermissions: permissions.map(item => ({ roleId: roles[0].id, permissionId: item.id })),
    assignments: [
      { id: '00000000-0000-0000-0000-000000000501', userId: users[0].id, roleId: roles[0].id, propertyCompanyId: companies[0].id, communityId: null, createdAt: date, revokedAt: null },
      { id: '00000000-0000-0000-0000-000000000502', userId: users[1].id, roleId: roles[1].id, propertyCompanyId: null, communityId: communities[0].id, createdAt: date, revokedAt: null }
    ]
  });
  return { repository, app: await buildApp({ env, repository }), companies, communities, users };
}

function cookieValue(response: { headers: { 'set-cookie'?: unknown } }, name: string) {
  const cookies = response.headers['set-cookie'];
  const values = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
  const value = values.find(item => item.startsWith(`${name}=`));
  assert.ok(value, `missing ${name} cookie`);
  return value!.split(';', 1)[0];
}

test('health endpoint is public and uses the success envelope', async () => {
  const { app } = await fixture();
  const response = await app.inject({ method: 'GET', url: '/api/v1/health' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.status, 'ok');
  await app.close();
});

test('login, me, logout and CSRF protection use opaque cookies', async () => {
  const { app, users } = await fixture();
  const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { phone: users[0].phone, password: 'correct-password' } });
  assert.equal(login.statusCode, 200);
  const sessionCookie = cookieValue(login, 'sb_session');
  const csrfCookie = cookieValue(login, 'sb_csrf');
  assert.match(sessionCookie, /^sb_session=[A-Za-z0-9_-]+$/);
  assert.equal(login.headers['set-cookie']?.toString().includes('HttpOnly'), true);

  const me = await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: `${sessionCookie}; ${csrfCookie}` } });
  assert.equal(me.statusCode, 200);
  assert.equal(me.json().data.user.id, users[0].id);

  const blocked = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: { cookie: `${sessionCookie}; ${csrfCookie}` } });
  assert.equal(blocked.statusCode, 403);
  assert.equal(blocked.json().error.code, 'CSRF_FAILED');
  const logout = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: { cookie: `${sessionCookie}; ${csrfCookie}`, 'x-csrf-token': csrfCookie.split('=', 2)[1] } });
  assert.equal(logout.statusCode, 200);
  const afterLogout = await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: `${sessionCookie}; ${csrfCookie}` } });
  assert.equal(afterLogout.statusCode, 401);
  await app.close();
});

test('company scope prevents cross-tenant reads', async () => {
  const { app, users, companies, communities } = await fixture();
  const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { phone: users[0].phone, password: 'correct-password' } });
  const sessionCookie = cookieValue(login, 'sb_session');
  const communitiesResponse = await app.inject({ method: 'GET', url: '/api/v1/communities', headers: { cookie: sessionCookie } });
  assert.deepEqual(communitiesResponse.json().data.map((item: CommunityRecord) => item.id), [communities[0].id]);
  const companiesResponse = await app.inject({ method: 'GET', url: '/api/v1/property-companies', headers: { cookie: sessionCookie } });
  assert.deepEqual(companiesResponse.json().data.map((item: CompanyRecord) => item.id), [companies[0].id]);
  await app.close();
});

test('community-scoped users only see their assigned community', async () => {
  const { app, users, communities } = await fixture();
  const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { phone: users[1].phone, password: 'correct-password' } });
  const sessionCookie = cookieValue(login, 'sb_session');
  const communitiesResponse = await app.inject({ method: 'GET', url: '/api/v1/communities', headers: { cookie: sessionCookie } });
  assert.deepEqual(communitiesResponse.json().data.map((item: CommunityRecord) => item.id), [communities[0].id]);
  const foreignCommunity = await app.inject({ method: 'GET', url: `/api/v1/communities/${communities[1].id}`, headers: { cookie: sessionCookie } });
  assert.equal(foreignCommunity.statusCode, 404);
  await app.close();
});

test('origin checks reject cross-site mutations', async () => {
  const { app, users } = await fixture();
  const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', headers: { origin: 'https://evil.example' }, payload: { phone: users[0].phone, password: 'correct-password' } });
  assert.equal(login.statusCode, 403);
  assert.equal(login.json().error.code, 'ORIGIN_FORBIDDEN');
  await app.close();
});

test('role assignment validates tenant membership and role scope', async () => {
  const { app, users, communities } = await fixture();
  const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { phone: users[0].phone, password: 'correct-password' } });
  const sessionCookie = cookieValue(login, 'sb_session');
  const csrfCookie = cookieValue(login, 'sb_csrf');
  const response = await app.inject({
    method: 'POST',
    url: `/api/v1/users/${users[1].id}/roles`,
    headers: { cookie: `${sessionCookie}; ${csrfCookie}`, 'x-csrf-token': csrfCookie.split('=', 2)[1] },
    payload: { roleId: '00000000-0000-0000-0000-000000000202', communityId: communities[0].id }
  });
  assert.equal(response.statusCode, 403);
  await app.close();
});
