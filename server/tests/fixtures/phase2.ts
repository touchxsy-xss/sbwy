import { eq, inArray } from 'drizzle-orm';
import type { AppDb } from '../../src/db/client.js';
import { buildingUnits, buildings, communities, housePersonRelationships, houses, people, propertyCompanies, users } from '../../src/db/schema/index.js';

/** Creates only Phase 2 property data; the regular Phase 1 seed remains untouched. */
export async function createPhase2Fixture(db: AppDb) {
  const [companyA] = await db.select().from(propertyCompanies).where(eq(propertyCompanies.code, 'property-a')).limit(1);
  const [companyB] = await db.select().from(propertyCompanies).where(eq(propertyCompanies.code, 'property-b')).limit(1);
  const [a1] = await db.select().from(communities).where(eq(communities.code, 'community-a1')).limit(1);
  const [a2] = await db.select().from(communities).where(eq(communities.code, 'community-a2')).limit(1);
  const [b1] = await db.select().from(communities).where(eq(communities.code, 'community-b1')).limit(1);
  if (!companyA || !companyB || !a1 || !a2 || !b1) throw new Error('Phase 1 seed must run before Phase 2 fixture');
  return db.transaction(async tx => {
    // This helper is only used with the dedicated shengbian_test database.
    await tx.delete(housePersonRelationships);
    await tx.delete(people);
    await tx.delete(houses);
    await tx.delete(buildingUnits);
    await tx.delete(buildings);
    const [aBuilding] = await tx.insert(buildings).values({ communityId: a1.id, code: 'A1-01', name: 'A1 一号楼' }).returning();
    const [aNoUnitBuilding] = await tx.insert(buildings).values({ communityId: a1.id, code: 'A1-03', name: 'A1 三号楼' }).returning();
    const [a2Building] = await tx.insert(buildings).values({ communityId: a2.id, code: 'A2-01', name: 'A2 一号楼' }).returning();
    const [bBuilding] = await tx.insert(buildings).values({ communityId: b1.id, code: 'B1-01', name: 'B1 一号楼' }).returning();
    const [unit] = await tx.insert(buildingUnits).values({ buildingId: aBuilding.id, code: '02', name: '二单元' }).returning();
    const [aHouse] = await tx.insert(houses).values({ buildingId: aBuilding.id, buildingUnitId: unit.id, code: '502', floor: 5, buildingArea: '89.50', legacyCode: 'A1-01-02-502' }).returning();
    const [aNoUnitHouse] = await tx.insert(houses).values({ buildingId: aNoUnitBuilding.id, code: '1201', floor: 12 }).returning();
    const [a2House] = await tx.insert(houses).values({ buildingId: a2Building.id, code: '101' }).returning();
    const [bHouse] = await tx.insert(houses).values({ buildingId: bBuilding.id, code: '101' }).returning();
    const [aUser] = await tx.select().from(users).where(eq(users.phone, '13800000002')).limit(1);
    const [bUser] = await tx.select().from(users).where(eq(users.phone, '13800000004')).limit(1);
    const [personA] = await tx.insert(people).values({ propertyCompanyId: companyA.id, userId: aUser?.id, name: 'A1 业主', phone: '13812345678' }).returning();
    const [personB] = await tx.insert(people).values({ propertyCompanyId: companyB.id, userId: bUser?.id, name: 'B1 业主', phone: '13912345678' }).returning();
    const [unbound] = await tx.insert(people).values({ propertyCompanyId: companyA.id, name: '待分配客户', phone: '13712345678' }).returning();
    const [a2Person] = await tx.insert(people).values({ propertyCompanyId: companyA.id, name: 'A2 住户', phone: '13612345678' }).returning();
    const [historyPerson] = await tx.insert(people).values({ propertyCompanyId: companyA.id, name: '历史租户', phone: '13512345678' }).returning();
    await tx.insert(housePersonRelationships).values([
      { houseId: aHouse.id, personId: personA.id, relationshipType: 'OWNER', ownershipShare: '60', isPrimaryContact: true, startDate: '2020-01-01', verificationStatus: 'UNVERIFIED' },
      { houseId: aHouse.id, personId: historyPerson.id, relationshipType: 'TENANT', startDate: '2020-01-01', endDate: '2022-01-01', verificationStatus: 'UNVERIFIED' },
      { houseId: a2House.id, personId: a2Person.id, relationshipType: 'TENANT', startDate: '2024-01-01', verificationStatus: 'UNVERIFIED' },
      { houseId: bHouse.id, personId: personB.id, relationshipType: 'OWNER', startDate: '2020-01-01', verificationStatus: 'UNVERIFIED' }
    ]);
    return { companyA, companyB, a1, a2, b1, aBuilding, aNoUnitBuilding, a2Building, bBuilding, unit, aHouse, aNoUnitHouse, a2House, bHouse, personA, personB, unbound, a2Person, historyPerson };
  });
}

export async function cleanupPhase2Fixture(db: AppDb, fixture: Awaited<ReturnType<typeof createPhase2Fixture>>) {
  const houseIds = [fixture.aHouse.id, fixture.aNoUnitHouse.id, fixture.a2House.id, fixture.bHouse.id];
  const personIds = [fixture.personA.id, fixture.personB.id, fixture.unbound.id, fixture.a2Person.id, fixture.historyPerson.id];
  await db.transaction(async tx => {
    // The integration database is dedicated to this suite; remove only Phase 2 tables.
    await tx.delete(housePersonRelationships);
    await tx.delete(people);
    await tx.delete(houses);
    await tx.delete(buildingUnits);
    await tx.delete(buildings);
  });
}
