import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { and, eq, sql } from 'drizzle-orm';
import { buildApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { createDb } from '../src/db/client.js';
import { createDrizzleRepository } from '../src/db/repository.js';
import { auditLogs, housePersonRelationships, workOrderEvents, workOrders } from '../src/db/schema/index.js';
import { cleanupPhase2Fixture, createPhase2Fixture } from './fixtures/phase2.js';

const enabled = process.env.RUN_POSTGRES_INTEGRATION === '1';

describe('Phase 2B work order PostgreSQL integration', { skip: !enabled }, () => {
  const env = loadEnv({ ...process.env, NODE_ENV: 'test', HOST: '127.0.0.1', PORT: '3003', SESSION_SECRET: process.env.SESSION_SECRET || 'phase2b-integration-session-secret-2026', APP_ORIGIN: process.env.APP_ORIGIN || 'http://localhost:5173' });
  const { db, client } = createDb(env.DATABASE_URL);
  let app: Awaited<ReturnType<typeof buildApp>>;
  let baseUrl = '';
  let fx: Awaited<ReturnType<typeof createPhase2Fixture>>;
  type Jar = Map<string, string>;
  const sessions = new Map<string, Jar>();
  const cookieHeader = (jar: Jar) => [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
  const updateCookies = (jar: Jar, response: Response) => response.headers.getSetCookie().forEach(value => { const [pair] = value.split(';', 1); const i = pair.indexOf('='); if (i > 0) jar.set(pair.slice(0, i), pair.slice(i + 1)); });
  async function request(path: string, init: RequestInit = {}, jar = new Map<string, string>()) {
    const headers = new Headers(init.headers); headers.set('origin', env.APP_ORIGIN.split(',')[0].trim()); if (jar.size) headers.set('cookie', cookieHeader(jar));
    if (jar.has('sb_csrf') && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(init.method || 'GET')) headers.set('x-csrf-token', jar.get('sb_csrf')!);
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers }); updateCookies(jar, response); return { response, body: await response.json() as any, jar };
  }
  async function login(phone: string, password: string) {
    const cached = sessions.get(phone); if (cached) return cached;
    const jar = new Map<string, string>(); const result = await request('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone, password }) }, jar); assert.equal(result.response.status, 200); sessions.set(phone, jar); return jar;
  }
  const body = (value: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });

  before(async () => {
    app = await buildApp({ env, repository: createDrizzleRepository(db) }); await app.listen({ host: '127.0.0.1', port: 0 });
    const address = app.server.address(); assert.ok(address && typeof address === 'object'); baseUrl = `http://127.0.0.1:${address.port}`;
    fx = await createPhase2Fixture(db);
    await db.update(housePersonRelationships).set({ verificationStatus: 'VERIFIED', reviewedAt: new Date(), reviewedByUserId: fx.sameUser.id }).where(and(eq(housePersonRelationships.houseId, fx.aNoUnitHouse.id), eq(housePersonRelationships.personId, fx.a1CurrentPerson.id)));
  });
  after(async () => { await db.delete(workOrderEvents); await db.delete(workOrders); await cleanupPhase2Fixture(db, fx); await app.close(); await client.end(); });

  it('creates a private work order with formal references and masked response', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const result = await request('/api/v1/work-orders', body({ scope: 'PRIVATE', houseId: fx.aNoUnitHouse.id, requesterPersonId: fx.a1CurrentPerson.id, requesterRelationshipId: (await db.select().from(housePersonRelationships).where(and(eq(housePersonRelationships.houseId, fx.aNoUnitHouse.id), eq(housePersonRelationships.personId, fx.a1CurrentPerson.id))))[0].id, category: '水暖', title: '厨房漏水', description: '水槽下方持续漏水' }), admin);
    assert.equal(result.response.status, 200); assert.equal(result.body.data.status, 'PENDING_DISPATCH'); assert.equal(result.body.data.contactSnapshot.maskedPhone, '133****5678'); assert.equal(result.body.data.contactSnapshot.phone, '13312345678'); assert.ok(result.body.data.locationSnapshot.address);
  });

  it('enforces assignment, state machine, events, and community scope', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const rel = (await db.select().from(housePersonRelationships).where(and(eq(housePersonRelationships.houseId, fx.aNoUnitHouse.id), eq(housePersonRelationships.personId, fx.a1CurrentPerson.id))))[0];
    const created = await request('/api/v1/work-orders', body({ scope: 'PRIVATE', houseId: fx.aNoUnitHouse.id, requesterPersonId: fx.a1CurrentPerson.id, requesterRelationshipId: rel.id, category: '电气', title: '开关故障', description: '客厅开关无法使用' }), admin);
    const orderId = created.body.data.id;
    const bAdmin = await login('13800000004', env.SEED_B_ADMIN_PASSWORD!); assert.equal((await request(`/api/v1/work-orders/${orderId}`, {}, bAdmin)).response.status, 404);
    const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const engineer = await login('13800000003', env.SEED_ENGINEER_PASSWORD!); const engineerMe = await request('/api/v1/auth/me', {}, engineer); const assigned = await request(`/api/v1/work-orders/${orderId}/assign`, body({ assignedUserId: engineerMe.body.data.user.id }), manager); assert.equal(assigned.response.status, 200); assert.equal(assigned.body.data.status, 'ASSIGNED');
    assert.equal((await request('/api/v1/work-orders', {}, engineer)).body.data.items.some((item: any) => item.id === orderId), true);
    for (const toStatus of ['ACCEPTED', 'ARRIVED', 'COMPLETED'] as const) { const result = await request(`/api/v1/work-orders/${orderId}/transition`, body({ toStatus }), engineer); assert.equal(result.response.status, 200); }
    assert.equal((await request(`/api/v1/work-orders/${orderId}/transition`, body({ toStatus: 'ARRIVED' }), engineer)).response.status, 409);
    assert.equal((await request(`/api/v1/work-orders/${orderId}/transition`, body({ toStatus: 'ARCHIVED' }), manager)).response.status, 200);
    const events = await request(`/api/v1/work-orders/${orderId}/events`, {}, manager); assert.equal(events.body.data.length, 6); assert.equal(events.body.data.at(-1).toStatus, 'ARCHIVED');
  });

  it('requires an active verified relationship for private reports', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const result = await request('/api/v1/work-orders', body({ scope: 'PRIVATE', houseId: fx.aHouse.id, requesterPersonId: fx.historyPerson.id, requesterRelationshipId: '00000000-0000-0000-0000-000000000000', category: '其他', title: '历史住户报修', description: '不应创建' }), admin);
    assert.equal(result.response.status, 403);
  });

  it('rejects pending directly to completed', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const rel = (await db.select().from(housePersonRelationships).where(and(eq(housePersonRelationships.houseId, fx.aNoUnitHouse.id), eq(housePersonRelationships.personId, fx.a1CurrentPerson.id))))[0];
    const created = await request('/api/v1/work-orders', body({ scope: 'PRIVATE', houseId: fx.aNoUnitHouse.id, requesterPersonId: fx.a1CurrentPerson.id, requesterRelationshipId: rel.id, category: '状态', title: '待派工越级流转', description: '不应直接完工' }), admin);
    assert.equal(created.response.status, 200);
    const result = await request(`/api/v1/work-orders/${created.body.data.id}/transition`, body({ toStatus: 'COMPLETED' }), admin);
    assert.equal(result.response.status, 409);
  });

  it('rejects assigned directly to completed', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!);
    const engineer = await login('13800000003', env.SEED_ENGINEER_PASSWORD!);
    const engineerMe = await request('/api/v1/auth/me', {}, engineer);
    const rel = (await db.select().from(housePersonRelationships).where(and(eq(housePersonRelationships.houseId, fx.aNoUnitHouse.id), eq(housePersonRelationships.personId, fx.a1CurrentPerson.id))))[0];
    const created = await request('/api/v1/work-orders', body({ scope: 'PRIVATE', houseId: fx.aNoUnitHouse.id, requesterPersonId: fx.a1CurrentPerson.id, requesterRelationshipId: rel.id, category: '状态', title: '已派工越级流转', description: '不应直接完工' }), admin);
    assert.equal(created.response.status, 200);
    const assigned = await request(`/api/v1/work-orders/${created.body.data.id}/assign`, body({ assignedUserId: engineerMe.body.data.user.id }), manager);
    assert.equal(assigned.response.status, 200);
    const result = await request(`/api/v1/work-orders/${created.body.data.id}/transition`, body({ toStatus: 'COMPLETED' }), manager);
    assert.equal(result.response.status, 409);
  });

  it('keeps contact and location snapshots immutable after source changes', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const rel = (await db.select().from(housePersonRelationships).where(and(eq(housePersonRelationships.houseId, fx.aNoUnitHouse.id), eq(housePersonRelationships.personId, fx.a1CurrentPerson.id))))[0];
    const created = await request('/api/v1/work-orders', body({ scope: 'PRIVATE', houseId: fx.aNoUnitHouse.id, requesterPersonId: fx.a1CurrentPerson.id, requesterRelationshipId: rel.id, category: '快照', title: '快照不可变', description: '源数据变更后仍保留创建时信息' }), admin);
    assert.equal(created.response.status, 200);
    const orderId = created.body.data.id;
    const updated = await request(`/api/v1/people/${fx.a1CurrentPerson.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: '变更后住户', phone: '+86 139 5555 6666' }) }, admin);
    assert.equal(updated.response.status, 200);
    const detail = await request(`/api/v1/work-orders/${orderId}`, {}, admin);
    assert.equal(detail.response.status, 200);
    assert.equal(detail.body.data.contactSnapshot.name, 'A1 当前住户');
    assert.equal(detail.body.data.contactSnapshot.phone, '13312345678');
    assert.match(detail.body.data.locationSnapshot.address, /1201/);
  });

  it('rolls back work order and event when mandatory audit fails', async () => {
    await db.execute(sql`CREATE OR REPLACE FUNCTION phase2b_reject_work_order_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'WORK_ORDER_CREATED' THEN RAISE EXCEPTION 'forced work order audit failure'; END IF; RETURN NEW; END; $$`);
    await db.execute(sql`CREATE TRIGGER phase2b_reject_work_order_audit_trigger BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION phase2b_reject_work_order_audit()`);
    try {
      const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const rel = (await db.select().from(housePersonRelationships).where(and(eq(housePersonRelationships.houseId, fx.aNoUnitHouse.id), eq(housePersonRelationships.personId, fx.a1CurrentPerson.id))))[0];
      const result = await request('/api/v1/work-orders', body({ scope: 'PRIVATE', houseId: fx.aNoUnitHouse.id, requesterPersonId: fx.a1CurrentPerson.id, requesterRelationshipId: rel.id, category: '测试', title: '审计失败工单', description: '应回滚' }), admin); assert.equal(result.response.status, 500);
      assert.equal((await db.select().from(workOrders).where(sql`${workOrders.title} = '审计失败工单'`)).length, 0);
    } finally { await db.execute(sql`DROP TRIGGER IF EXISTS phase2b_reject_work_order_audit_trigger ON audit_logs`); await db.execute(sql`DROP FUNCTION IF EXISTS phase2b_reject_work_order_audit()`); }
  });
});
