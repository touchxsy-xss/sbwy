import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { buildApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { createDb } from '../src/db/client.js';
import { createDrizzleRepository } from '../src/db/repository.js';
import { auditLogs, buildingUnits, buildings, housePersonRelationships, houses, people, userRoleAssignments } from '../src/db/schema/index.js';
import { cleanupPhase2Fixture, createPhase2Fixture } from './fixtures/phase2.js';

const enabled = process.env.RUN_POSTGRES_INTEGRATION === '1';

describe('Phase 2A PostgreSQL integration', { skip: !enabled }, () => {
  const env = loadEnv({ ...process.env, NODE_ENV: 'test', HOST: '127.0.0.1', PORT: '3002', SESSION_SECRET: process.env.SESSION_SECRET || 'phase2-integration-session-secret-2026', APP_ORIGIN: process.env.APP_ORIGIN || 'http://localhost:5173' });
  const { db, client } = createDb(env.DATABASE_URL);
  let app: Awaited<ReturnType<typeof buildApp>>;
  let baseUrl = '';
  let fx: Awaited<ReturnType<typeof createPhase2Fixture>>;
  const sessions = new Map<string, Map<string, string>>();
  type Jar = Map<string, string>;
  const cookieHeader = (jar: Jar) => [...jar].map(([name, value]) => `${name}=${value}`).join('; ');
  const updateCookies = (jar: Jar, response: Response) => response.headers.getSetCookie().forEach(value => { const [pair] = value.split(';', 1); const i = pair.indexOf('='); if (i > 0) jar.set(pair.slice(0, i), pair.slice(i + 1)); });
  async function request(path: string, init: RequestInit = {}, jar = new Map<string, string>()) {
    const headers = new Headers(init.headers); headers.set('origin', env.APP_ORIGIN.split(',')[0].trim());
    if (jar.size) headers.set('cookie', cookieHeader(jar));
    if (jar.has('sb_csrf') && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(init.method || 'GET')) headers.set('x-csrf-token', jar.get('sb_csrf')!);
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers }); updateCookies(jar, response);
    return { response, body: await response.json() as any, jar };
  }
  async function login(phone: string, password: string) {
    const cached = sessions.get(phone); if (cached) return cached;
    const jar = new Map<string, string>(); const result = await request('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone, password }) }, jar);
    assert.equal(result.response.status, 200); sessions.set(phone, jar); return jar;
  }
  const body = (value: unknown) => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(value) });

  before(async () => {
    app = await buildApp({ env, repository: createDrizzleRepository(db) }); await app.listen({ host: '127.0.0.1', port: 0 });
    const address = app.server.address(); assert.ok(address && typeof address === 'object'); baseUrl = `http://127.0.0.1:${address.port}`;
    fx = await createPhase2Fixture(db);
  });
  after(async () => { await cleanupPhase2Fixture(db, fx); await app.close(); await client.end(); });

  it('01 building cross-tenant access is rejected', async () => { const bAdmin = await login('13800000004', env.SEED_B_ADMIN_PASSWORD!); assert.equal((await request(`/api/v1/buildings/${fx.aBuilding.id}`, {}, bAdmin)).response.status, 404); });
  it('02 house cross-tenant access is rejected', async () => { const bAdmin = await login('13800000004', env.SEED_B_ADMIN_PASSWORD!); assert.equal((await request(`/api/v1/houses/${fx.aHouse.id}`, {}, bAdmin)).response.status, 404); });
  it('03 A1 manager cannot see A2 houses', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const result = await request('/api/v1/houses', {}, manager); assert.equal(result.response.status, 200); assert.equal(result.body.data.items.some((house: any) => house.id === fx.a2House.id), false); });
  it('04 house without a unit is valid', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request('/api/v1/houses', body({ buildingId: fx.aNoUnitBuilding.id, code: `N${Date.now()}` }), admin); assert.equal(result.response.status, 200); assert.equal(result.body.data.buildingUnitId, null); });
  it('05 a unit from another building is rejected', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request('/api/v1/houses', body({ buildingId: fx.aNoUnitBuilding.id, buildingUnitId: fx.unit.id, code: `X${Date.now()}` }), admin); assert.equal(result.response.status, 400); });
  it('06 zero and negative areas are rejected', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); for (const buildingArea of ['0', '-1']) assert.equal((await request('/api/v1/houses', body({ buildingId: fx.aNoUnitBuilding.id, code: `A${Date.now()}${buildingArea.replace('-', '')}`, buildingArea }), admin)).response.status, 422); });
  it('07 the same user maps to people in different companies', async () => { assert.equal(fx.personA.userId, fx.sameUser.id); assert.equal(fx.personB.userId, fx.sameUser.id); assert.equal(fx.personA.userId, fx.personB.userId); });
  it('08 one user cannot map to two people in one company', async () => { await assert.rejects(db.insert(people).values({ propertyCompanyId: fx.companyA.id, userId: fx.personA.userId, name: '重复绑定' }), /unique|duplicate/i); });
  it('09 person cannot relate to a house in another tenant', async () => { const repository = createDrizzleRepository(db); await assert.rejects(repository.createHouseRelationship({ houseId: fx.bHouse.id, personId: fx.personA.id, relationshipType: 'TENANT', startDate: '2026-01-01' }), /同一物业公司/); });
  it('10 one house accepts multiple owners', async () => { const [owner] = await db.insert(people).values({ propertyCompanyId: fx.companyA.id, name: '共同业主' }).returning(); const [row] = await db.insert(housePersonRelationships).values({ houseId: fx.aHouse.id, personId: owner.id, relationshipType: 'OWNER', startDate: '2020-01-01' }).returning(); assert.equal(row.relationshipType, 'OWNER'); });
  it('11 overlapping same relationship is rejected', async () => { await assert.rejects(db.insert(housePersonRelationships).values({ houseId: fx.aHouse.id, personId: fx.personA.id, relationshipType: 'OWNER', startDate: '2021-01-01' }), /exclude|conflict/i); });
  it('12 non-overlapping historical relation is accepted', async () => { const [row] = await db.insert(housePersonRelationships).values({ houseId: fx.aHouse.id, personId: fx.personA.id, relationshipType: 'TENANT', startDate: '2018-01-01', endDate: '2019-01-01' }).returning(); assert.equal(row.endDate, '2019-01-01'); });
  it('13 ownership share is owner-only', async () => { await assert.rejects(db.insert(housePersonRelationships).values({ houseId: fx.aNoUnitHouse.id, personId: fx.personA.id, relationshipType: 'TENANT', ownershipShare: '10', startDate: '2024-01-01' }), /check/i); });
  it('14 overlapping primary contacts are rejected', async () => { const [person] = await db.insert(people).values({ propertyCompanyId: fx.companyA.id, name: '另一联系人' }).returning(); await assert.rejects(db.insert(housePersonRelationships).values({ houseId: fx.aHouse.id, personId: person.id, relationshipType: 'FAMILY_MEMBER', isPrimaryContact: true, startDate: '2024-01-01' }), /exclude|conflict/i); });
  it('15 a future primary contact after current contact ends is accepted', async () => { const [person] = await db.insert(people).values({ propertyCompanyId: fx.companyA.id, name: '未来联系人' }).returning(); const [row] = await db.insert(housePersonRelationships).values({ houseId: fx.aNoUnitHouse.id, personId: person.id, relationshipType: 'TENANT', isPrimaryContact: true, startDate: '2030-01-01' }).returning(); assert.equal(row.isPrimaryContact, true); });
  it('16 manager sees future residents', async () => { const [future] = await db.insert(people).values({ propertyCompanyId: fx.companyA.id, name: '未来租户' }).returning(); await db.insert(housePersonRelationships).values({ houseId: fx.aNoUnitHouse.id, personId: future.id, relationshipType: 'TENANT', startDate: '2030-01-01' }); const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); assert.equal((await request('/api/v1/people?keyword=未来租户', {}, manager)).body.data.items.length, 1); });
  it('17 manager cannot see A2 people', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); assert.equal((await request(`/api/v1/people/${fx.a2Person.id}`, {}, manager)).response.status, 404); });
  it('18 manager default directory excludes historical-only people', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); assert.equal((await request(`/api/v1/people/${fx.historyPerson.id}`, {}, manager)).response.status, 404); });
  it('19 authorized house history returns masked historical person', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const result = await request(`/api/v1/houses/${fx.aHouse.id}/relationships`, {}, manager); const history = result.body.data.find((row: any) => row.person.id === fx.historyPerson.id); assert.equal(history.person.maskedPhone, '135****5678'); assert.equal('phone' in history.person, false); });
  it('20 unbound people are admin-only', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); assert.equal((await request(`/api/v1/people/${fx.unbound.id}`, {}, admin)).response.status, 200); assert.equal((await request(`/api/v1/people/${fx.unbound.id}`, {}, manager)).response.status, 404); });
  it('21 engineer is forbidden from people directory', async () => { const engineer = await login('13800000003', env.SEED_ENGINEER_PASSWORD!); assert.equal((await request('/api/v1/people', {}, engineer)).response.status, 403); });
  it('22 people list returns only masked phone', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request('/api/v1/people', {}, admin); const row = result.body.data.items.find((person: any) => person.id === fx.personA.id); assert.equal(row.maskedPhone, '138****5678'); assert.equal('phone' in row, false); });
  it('23 admin person detail returns only masked phone', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request(`/api/v1/people/${fx.personA.id}`, {}, admin); assert.equal(result.body.data.maskedPhone, '138****5678'); assert.equal('phone' in result.body.data, false); });
  it('24 contact endpoint returns full phone only with permission', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request(`/api/v1/people/${fx.personA.id}/contact`, {}, admin); assert.equal(result.response.status, 200); assert.equal(result.body.data.phone, '13812345678'); });
  it('25 contact view writes a redacted audit record', async () => { const rows = await db.select().from(auditLogs).where(and(eq(auditLogs.action, 'PERSON_PHONE_VIEWED'), eq(auditLogs.resourceId, fx.personA.id))); assert.ok(rows.length > 0); assert.equal(rows.some(row => JSON.stringify(row).includes('13812345678')), false); });
  it('26 all Phase 2 audits exclude full phone values', async () => { const rows = await db.select().from(auditLogs).where(inArray(auditLogs.action, ['PERSON_CREATED', 'PERSON_UPDATED', 'PERSON_PHONE_VIEWED'])); assert.equal(rows.some(row => JSON.stringify(row).match(/1[3-9]\d{9}/)), false); });
  it('27 manager cannot create an unbound person', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); assert.equal((await request('/api/v1/people', body({ propertyCompanyId: fx.companyA.id, name: '不应创建' }), manager)).response.status, 403); });
  it('28 manager atomically creates resident and relationship', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const result = await request(`/api/v1/houses/${fx.aNoUnitHouse.id}/residents`, body({ newPerson: { name: '原子住户', phone: '+86 139 2222 3333' }, relationship: { relationshipType: 'TENANT', startDate: '2027-01-01' } }), manager); assert.equal(result.response.status, 200); assert.equal(result.body.data.person.maskedPhone, '139****3333'); });
  it('29 failed atomic resident creation rolls back person', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request(`/api/v1/houses/${fx.aNoUnitHouse.id}/residents`, body({ newPerson: { name: '应回滚客户', phone: '13988889999' }, relationship: { relationshipType: 'TENANT', startDate: 'bad-date' } }), admin); assert.equal(result.response.status, 422); const rows = await db.select().from(people).where(eq(people.name, '应回滚客户')); assert.equal(rows.length, 0); });
  it('30 tampered UUID cannot cross community scope', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); assert.equal((await request(`/api/v1/houses/${fx.a2House.id}/relationships`, {}, manager)).response.status, 404); });
  it('31 A1 historical Person X remains readable only through A1 house history', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); assert.equal((await request(`/api/v1/people/${fx.crossScopePerson.id}`, {}, manager)).response.status, 404); const history = await request(`/api/v1/houses/${fx.aHouse.id}/relationships`, {}, manager); const row = history.body.data.find((relationship: any) => relationship.person.id === fx.crossScopePerson.id); assert.equal(row.person.name, '跨小区历史与当前住户'); assert.equal(row.person.maskedPhone, '135****1111'); assert.equal('phone' in row.person, false); });
  it('32 A1 historical Person X cannot be patched', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const result = await request(`/api/v1/people/${fx.crossScopePerson.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: '不应修改' }) }, manager); assert.ok([403, 404].includes(result.response.status)); });
  it('33 A1 historical Person X cannot be disabled', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const result = await request(`/api/v1/people/${fx.crossScopePerson.id}/disable`, body({}), manager); assert.ok([403, 404].includes(result.response.status)); });
  it('34 A2 current manager can manage Person X', async () => { const manager = await login('13800000005', 'Phase2A2Manager-2026!'); const result = await request(`/api/v1/people/${fx.crossScopePerson.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'A2 当前住户已更新' }) }, manager); assert.equal(result.response.status, 200); assert.equal(result.body.data.name, 'A2 当前住户已更新'); });
  it('35 property admin can manage Person X', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request(`/api/v1/people/${fx.crossScopePerson.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: '公司管理员已更新' }) }, admin); assert.equal(result.response.status, 200); assert.equal(result.body.data.name, '公司管理员已更新'); });
  it('36 houses pagination returns page one', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request('/api/v1/houses?page=1&pageSize=1', {}, admin); assert.equal(result.response.status, 200); assert.equal(result.body.data.page, 1); assert.equal(result.body.data.pageSize, 1); assert.equal(result.body.data.items.length, 1); assert.ok(result.body.data.total > 1); });
  it('37 houses pagination returns a distinct page two', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const first = await request('/api/v1/houses?page=1&pageSize=1', {}, admin); const second = await request('/api/v1/houses?page=2&pageSize=1', {}, admin); assert.equal(second.response.status, 200); assert.equal(second.body.data.page, 2); assert.notEqual(first.body.data.items[0].id, second.body.data.items[0].id); assert.equal(first.body.data.total, second.body.data.total); });
  it('38 house totals obey community and tenant scope', async () => { const a1Manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const bAdmin = await login('13800000004', env.SEED_B_ADMIN_PASSWORD!); const a1 = await request('/api/v1/houses?pageSize=100', {}, a1Manager); const b = await request('/api/v1/houses?pageSize=100', {}, bAdmin); assert.equal(a1.body.data.total, a1.body.data.items.length); assert.equal(b.body.data.total, b.body.data.items.length); assert.equal(a1.body.data.items.some((house: any) => house.communityId !== fx.a1.id), false); assert.equal(b.body.data.items.some((house: any) => house.propertyCompanyId !== fx.companyB.id), false); });
  it('39 people pagination returns items and matching total', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const first = await request('/api/v1/people?page=1&pageSize=1', {}, admin); const second = await request('/api/v1/people?page=2&pageSize=1', {}, admin); assert.equal(first.body.data.items.length, 1); assert.equal(first.body.data.page, 1); assert.equal(first.body.data.pageSize, 1); assert.ok(first.body.data.total > 1); assert.notEqual(first.body.data.items[0].id, second.body.data.items[0].id); assert.equal(first.body.data.total, second.body.data.total); });
  it('40 people total obeys current community scope', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const result = await request('/api/v1/people?page=1&pageSize=100', {}, manager); const ids = new Set(result.body.data.items.map((person: any) => person.id)); assert.equal(result.body.data.total, result.body.data.items.length); assert.equal(ids.has(fx.a2Person.id), false); assert.equal(ids.has(fx.historyPerson.id), false); assert.equal(ids.has(fx.unbound.id), false); assert.equal(ids.has(fx.personA.id), true); });
  it('41 invalid pagination is rejected before querying', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); for (const query of ['page=0', 'page=-1', 'page=abc', 'pageSize=0', 'pageSize=-1', 'pageSize=abc', 'pageSize=101']) { const result = await request(`/api/v1/houses?${query}`, {}, admin); assert.ok([400, 422].includes(result.response.status), query); } });
  it('42 atomic new resident writes Person and relationship audits with scope', async () => { const manager = await login('13800000002', env.SEED_MANAGER_PASSWORD!); const result = await request(`/api/v1/houses/${fx.aNoUnitHouse.id}/residents`, body({ newPerson: { name: '原子审计住户', phone: '13922223333' }, relationship: { relationshipType: 'TENANT', startDate: '2028-01-01' } }), manager); assert.equal(result.response.status, 200); const personAudits = await db.select().from(auditLogs).where(and(eq(auditLogs.action, 'PERSON_CREATED'), eq(auditLogs.resourceId, result.body.data.person.id))); const relationshipAudits = await db.select().from(auditLogs).where(and(eq(auditLogs.action, 'HOUSE_RELATION_CREATED'), eq(auditLogs.resourceId, result.body.data.relationship.id))); assert.equal(personAudits.length, 1); assert.equal(relationshipAudits.length, 1); for (const audit of [...personAudits, ...relationshipAudits]) { assert.equal(audit.propertyCompanyId, fx.companyA.id); assert.equal(audit.communityId, fx.a1.id); assert.equal(JSON.stringify(audit).includes('13922223333'), false); } });
  it('43 failed atomic resident creation rolls back data and audits', async () => { const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!); const result = await request(`/api/v1/houses/${fx.aNoUnitHouse.id}/residents`, body({ newPerson: { name: '应回滚审计客户', phone: '13977778888' }, relationship: { relationshipType: 'TENANT', startDate: 'invalid-date' } }), admin); assert.equal(result.response.status, 422); assert.equal((await db.select().from(people).where(eq(people.name, '应回滚审计客户'))).length, 0); assert.equal((await db.select().from(auditLogs).where(sql`${auditLogs.afterData}::text ILIKE '%应回滚审计客户%'`)).length, 0); });
  it('44 contact audit records tenant scope without leaking phone', async () => { const rows = await db.select().from(auditLogs).where(and(eq(auditLogs.action, 'PERSON_PHONE_VIEWED'), eq(auditLogs.resourceId, fx.personA.id))); assert.ok(rows.length > 0); for (const row of rows) { assert.equal(row.actorUserId !== null, true); assert.equal(row.propertyCompanyId, fx.companyA.id); assert.equal(row.resourceType, 'person'); assert.equal(JSON.stringify(row).includes('13812345678'), false); } });
  it('45 mandatory audit failure rolls back the Phase 2A business write', async () => {
    await db.execute(sql`CREATE OR REPLACE FUNCTION phase2a_reject_person_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'forced audit failure'; END; $$`);
    await db.execute(sql`CREATE TRIGGER phase2a_reject_person_audit_trigger BEFORE INSERT ON audit_logs FOR EACH ROW WHEN (NEW.action = 'PERSON_CREATED' AND NEW.after_data->>'name' = '审计失败回滚客户') EXECUTE FUNCTION phase2a_reject_person_audit()`);
    try {
      const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
      const result = await request('/api/v1/people', body({ propertyCompanyId: fx.companyA.id, name: '审计失败回滚客户', phone: '13933334444' }), admin);
      assert.equal(result.response.status, 500);
      assert.equal((await db.select().from(people).where(eq(people.name, '审计失败回滚客户'))).length, 0);
      assert.equal((await db.select().from(auditLogs).where(sql`${auditLogs.afterData}::text ILIKE '%审计失败回滚客户%'`)).length, 0);
    } finally {
      await db.execute(sql`DROP TRIGGER IF EXISTS phase2a_reject_person_audit_trigger ON audit_logs`);
      await db.execute(sql`DROP FUNCTION IF EXISTS phase2a_reject_person_audit()`);
    }
  });
  it('46 people pagination has a deterministic UUID tie-breaker', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    await db.insert(people).values([{ propertyCompanyId: fx.companyA.id, name: '同名分页客户' }, { propertyCompanyId: fx.companyA.id, name: '同名分页客户' }]);
    const first = await request('/api/v1/people?keyword=同名分页客户&page=1&pageSize=1', {}, admin);
    const second = await request('/api/v1/people?keyword=同名分页客户&page=2&pageSize=1', {}, admin);
    assert.equal(first.response.status, 200);
    assert.equal(second.response.status, 200);
    assert.equal(first.body.data.total, 2);
    assert.equal(second.body.data.total, 2);
    assert.notEqual(first.body.data.items[0].id, second.body.data.items[0].id);
    assert.ok(first.body.data.items[0].id < second.body.data.items[0].id);
  });
  it('47 houses pagination has a stable cross-community order', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const [a1Building] = await db.insert(buildings).values({ communityId: fx.a1.id, code: 'TIE', name: 'A1 分页楼' }).returning();
    const [a2Building] = await db.insert(buildings).values({ communityId: fx.a2.id, code: 'TIE', name: 'A2 分页楼' }).returning();
    await db.insert(houses).values([{ buildingId: a1Building.id, code: '同码分页房' }, { buildingId: a2Building.id, code: '同码分页房' }]);
    const first = await request('/api/v1/houses?keyword=同码分页房&page=1&pageSize=1', {}, admin);
    const second = await request('/api/v1/houses?keyword=同码分页房&page=2&pageSize=1', {}, admin);
    assert.equal(first.response.status, 200);
    assert.equal(second.response.status, 200);
    assert.equal(first.body.data.total, 2);
    assert.equal(second.body.data.total, 2);
    assert.equal(first.body.data.items[0].communityId, fx.a1.id);
    assert.equal(second.body.data.items[0].communityId, fx.a2.id);
  });
  it('48 audit logs have no public enumeration or ID lookup surface', async () => {
    const admin = await login('13800000001', env.SEED_ADMIN_PASSWORD!);
    const [bAudit] = await db.insert(auditLogs).values({ action: 'RELEASE_GATE_AUDIT', propertyCompanyId: fx.companyB.id, communityId: fx.b1.id, resourceType: 'release_gate' }).returning();
    assert.equal((await request('/api/v1/audit-logs?page=1&pageSize=100', {}, admin)).response.status, 404);
    assert.equal((await request(`/api/v1/audit-logs/${bAudit.id}`, {}, admin)).response.status, 404);
  });
});
