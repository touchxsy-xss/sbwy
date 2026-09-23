import { randomUUID } from 'node:crypto';
import { and, desc, eq, exists, gte, inArray, isNull, lte, ne, or, sql } from 'drizzle-orm';
import type { AppDb } from './client.js';
import { AppError } from '../shared/errors.js';
import { auditLogs, buildingUnits, buildings, communities, companyMemberships, employeeProfiles, housePersonRelationships, houses, people, permissions, propertyCompanies, rolePermissions, roles, sessions, userRoleAssignments, users, workOrderEvents, workOrders } from './schema/index.js';
import type { AssignmentRecord, AuditInput, BuildingDto, BuildingRecord, BuildingUnitRecord, CommunityRecord, CompanyRecord, EmployeeRecord, HouseDto, HouseRecord, HouseRelationshipRecord, MembershipRecord, PermissionRecord, PersonDto, PersonRecord, Repository, RoleRecord, Scope, SessionRecord, Status, UserRecord, WorkOrderDto, WorkOrderEventRecord, WorkOrderFilters, WorkOrderRecord, WorkOrderSnapshot, WorkOrderStatus } from '../shared/types.js';

const userMap = (row: any): UserRecord => ({ id: row.id, name: row.name, phone: row.phone, email: row.email, passwordHash: row.passwordHash, status: row.status, lastLoginAt: row.lastLoginAt, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const companyMap = (row: any): CompanyRecord => ({ id: row.id, code: row.code, name: row.name, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const communityMap = (row: any): CommunityRecord => ({ id: row.id, propertyCompanyId: row.propertyCompanyId, code: row.code, name: row.name, address: row.address, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const membershipMap = (row: any): MembershipRecord => ({ id: row.id, userId: row.userId, propertyCompanyId: row.propertyCompanyId, membershipType: row.membershipType, status: row.status, joinedAt: row.joinedAt, leftAt: row.leftAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const roleMap = (row: any): RoleRecord => ({ id: row.id, code: row.code, name: row.name, scopeType: row.scopeType, createdAt: row.createdAt, updatedAt: row.updatedAt });
const permissionMap = (row: any): PermissionRecord => ({ id: row.id, code: row.code, name: row.name, resource: row.resource, action: row.action, createdAt: row.createdAt, updatedAt: row.updatedAt });
const sessionMap = (row: any): SessionRecord => ({ id: row.id, userId: row.userId, tokenHash: row.tokenHash, activePropertyCompanyId: row.activePropertyCompanyId, expiresAt: row.expiresAt, lastSeenAt: row.lastSeenAt, revokedAt: row.revokedAt, userAgent: row.userAgent, ipHash: row.ipHash, createdAt: row.createdAt });
const buildingMap = (row: any): BuildingRecord => ({ id: row.id, communityId: row.communityId, code: row.code, name: row.name, displayName: row.displayName, legacyCode: row.legacyCode, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const unitMap = (row: any): BuildingUnitRecord => ({ id: row.id, buildingId: row.buildingId, code: row.code, name: row.name, displayName: row.displayName, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const houseMap = (row: any): HouseRecord => ({ id: row.id, buildingId: row.buildingId, buildingUnitId: row.buildingUnitId, code: row.code, floor: row.floor, buildingArea: row.buildingArea, usableArea: row.usableArea, displayName: row.displayName, legacyCode: row.legacyCode, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt, communityId: row.communityId, propertyCompanyId: row.propertyCompanyId });
const personMap = (row: any): PersonRecord => ({ id: row.id, propertyCompanyId: row.propertyCompanyId, userId: row.userId, name: row.name, phone: row.phone, gender: row.gender, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const relationshipMap = (row: any): any => ({ id: row.id, houseId: row.houseId, personId: row.personId, relationshipType: row.relationshipType, ownershipShare: row.ownershipShare, isPrimaryContact: row.isPrimaryContact, startDate: row.startDate, endDate: row.endDate, verificationStatus: row.verificationStatus, reviewedAt: row.reviewedAt, reviewedByUserId: row.reviewedByUserId, verificationNote: row.verificationNote, createdAt: row.createdAt, updatedAt: row.updatedAt });
const workOrderMap = (row: any): WorkOrderRecord => ({ id: row.id, propertyCompanyId: row.propertyCompanyId, communityId: row.communityId, houseId: row.houseId, requesterPersonId: row.requesterPersonId, requesterUserId: row.requesterUserId, requesterRelationshipId: row.requesterRelationshipId, assignedUserId: row.assignedUserId, orderNo: row.orderNo, scope: row.scope, category: row.category, priority: row.priority, title: row.title, description: row.description, status: row.status, contactSnapshot: row.contactSnapshot as WorkOrderSnapshot, locationSnapshot: row.locationSnapshot as WorkOrderSnapshot, assignedAt: row.assignedAt, acceptedAt: row.acceptedAt, arrivedAt: row.arrivedAt, completedAt: row.completedAt, archivedAt: row.archivedAt, cancelledAt: row.cancelledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const workOrderEventMap = (row: any): WorkOrderEventRecord => ({ id: row.id, workOrderId: row.workOrderId, propertyCompanyId: row.propertyCompanyId, communityId: row.communityId, actorUserId: row.actorUserId, fromStatus: row.fromStatus, toStatus: row.toStatus, action: row.action, note: row.note, metadata: row.metadata, createdAt: row.createdAt });
const normalizePhone = (value: string | null | undefined) => {
  if (!value) return value ?? null;
  const digits = value.replace(/[\s-]/g, '');
  const normalized = digits.startsWith('+86') ? digits.slice(3) : digits.startsWith('0086') ? digits.slice(4) : digits;
  return /^1[3-9]\d{9}$/.test(normalized) ? normalized : null;
};
const maskPhone = (phone: string | null) => phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : null;
const personDto = (person: PersonRecord): PersonDto => { const { phone, ...rest } = person; return { ...rest, maskedPhone: maskPhone(phone) }; };
const workOrderDto = (order: WorkOrderRecord, revealPhone = false): WorkOrderDto => {
  const { phone, ...contact } = order.contactSnapshot || {};
  return { ...order, contactSnapshot: { ...contact, maskedPhone: maskPhone(phone || null), ...(revealPhone ? { phone: phone || null } : {}) }, locationSnapshot: order.locationSnapshot };
};
const currentOrFuture = (column: any) => or(isNull(column), sql`${column} >= CURRENT_DATE`);
const workOrderTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  PENDING_DISPATCH: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['ARRIVED'],
  ARRIVED: ['COMPLETED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: []
};

export function createDrizzleRepository(db: AppDb): Repository {
  const companyFilter = (scope: Scope) => scope.platform ? undefined : scope.companyIds.length ? inArray(propertyCompanies.id, scope.companyIds) : eq(propertyCompanies.id, '00000000-0000-0000-0000-000000000000');
  const communityFilter = (scope: Scope) => {
    if (scope.platform) return undefined;
    const companyCondition = scope.companyIds.length ? inArray(communities.propertyCompanyId, scope.companyIds) : eq(communities.id, '00000000-0000-0000-0000-000000000000');
    return scope.companyWide ? companyCondition : scope.communityIds.length ? and(companyCondition, inArray(communities.id, scope.communityIds)) : eq(communities.id, '00000000-0000-0000-0000-000000000000');
  };
  const scopedCommunities = (scope: Scope) => {
    if (scope.platform) return undefined;
    const company = scope.companyIds.length ? inArray(communities.propertyCompanyId, scope.companyIds) : eq(communities.id, '00000000-0000-0000-0000-000000000000');
    return scope.companyWide ? company : (scope.communityIds.length ? and(company, inArray(communities.id, scope.communityIds)) : eq(communities.id, '00000000-0000-0000-0000-000000000000'));
  };
  const buildingAddress = (row: any) => row.unit?.displayName || row.unit?.name ? `${row.building.displayName || row.building.name} ${row.unit.displayName || row.unit.name}` : (row.building.displayName || row.building.name);
  const houseDto = (row: any): HouseDto => {
    const house = houseMap({ ...row.house, communityId: row.community?.id, propertyCompanyId: row.community?.propertyCompanyId });
    const displayCode = row.unit ? `${row.building.code}-${row.unit.code}-${house.code}` : `${row.building.code}-${house.code}`;
    return { ...house, displayCode, displayAddress: `${buildingAddress({ building: row.building, unit: row.unit })} ${house.code}` };
  };
  const personScopeCondition = (scope: Scope, includeHistory = false) => {
    const company = scope.platform ? undefined : (scope.companyIds.length ? inArray(people.propertyCompanyId, scope.companyIds) : eq(people.propertyCompanyId, '00000000-0000-0000-0000-000000000000'));
    if (scope.platform || scope.companyWide) return company;
    const community = scope.communityIds.length ? inArray(communities.id, scope.communityIds) : eq(communities.id, '00000000-0000-0000-0000-000000000000');
    const relationshipConditions = [eq(housePersonRelationships.personId, people.id), community, ...(includeHistory ? [] : [currentOrFuture(housePersonRelationships.endDate)])];
    const related = exists(db.select({ id: housePersonRelationships.id }).from(housePersonRelationships).innerJoin(houses, eq(housePersonRelationships.houseId, houses.id)).innerJoin(buildings, eq(houses.buildingId, buildings.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(and(...relationshipConditions)));
    return company ? and(company, related) : related;
  };
  const workOrderScopeCondition = (scope: Scope) => {
    const company = scope.platform ? undefined : (scope.companyIds.length ? inArray(workOrders.propertyCompanyId, scope.companyIds) : eq(workOrders.propertyCompanyId, '00000000-0000-0000-0000-000000000000'));
    if (scope.platform || scope.companyWide) return company;
    const community = scope.communityIds.length ? inArray(workOrders.communityId, scope.communityIds) : eq(workOrders.communityId, '00000000-0000-0000-0000-000000000000');
    const scoped = company ? and(company, community) : community;
    return scope.roles.includes('ENGINEER') ? and(scoped, eq(workOrders.assignedUserId, scope.userId)) : scoped;
  };
  const workOrderEventScopeCondition = (scope: Scope) => {
    const company = scope.platform ? undefined : (scope.companyIds.length ? inArray(workOrderEvents.propertyCompanyId, scope.companyIds) : eq(workOrderEvents.propertyCompanyId, '00000000-0000-0000-0000-000000000000'));
    if (scope.platform || scope.companyWide) return company;
    const community = scope.communityIds.length ? inArray(workOrderEvents.communityId, scope.communityIds) : eq(workOrderEvents.communityId, '00000000-0000-0000-0000-000000000000');
    return company ? and(company, community) : community;
  };
  const repository: Repository = {
    async transaction<T>(callback: (transactionRepository: Repository) => Promise<T>) {
      return db.transaction(async tx => callback(createDrizzleRepository(tx as unknown as AppDb)));
    },
    async findUserByPhone(phone) { const [row] = await db.select().from(users).where(eq(users.phone, phone)).limit(1); return row ? userMap(row) : null; },
    async findUserById(id) { const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1); return row ? userMap(row) : null; },
    async hasCompanyMembership(userId, propertyCompanyId) { const [row] = await db.select({ id: companyMemberships.id }).from(companyMemberships).where(and(eq(companyMemberships.userId, userId), eq(companyMemberships.propertyCompanyId, propertyCompanyId), eq(companyMemberships.status, 'ACTIVE'))).limit(1); return Boolean(row); },
    async getCommunityCompanyId(communityId) { const [row] = await db.select({ propertyCompanyId: communities.propertyCompanyId }).from(communities).where(eq(communities.id, communityId)).limit(1); return row?.propertyCompanyId || null; },
    async updateUserLastLogin(id) { await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, id)); },
    async createSession(input) { const [row] = await db.insert(sessions).values(input).returning(); return sessionMap(row); },
    async findActiveSession(tokenHash) { const [row] = await db.select().from(sessions).where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt))).limit(1); if (!row || row.expiresAt <= new Date()) return null; return sessionMap(row); },
    async touchSession(id) { await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, id)); },
    async revokeSession(id) { await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, id)); },
    async listSessions(userId) { const rows = await db.select().from(sessions).where(eq(sessions.userId, userId)).orderBy(desc(sessions.createdAt)); return rows.map(sessionMap); },
    async scopeForUser(userId, activeCompanyId = null) {
      const rows = await db.select({ assignment: userRoleAssignments, role: roles, community: communities }).from(userRoleAssignments).innerJoin(roles, eq(userRoleAssignments.roleId, roles.id)).leftJoin(communities, eq(userRoleAssignments.communityId, communities.id)).where(and(eq(userRoleAssignments.userId, userId), isNull(userRoleAssignments.revokedAt)));
      const assignments = rows.filter(row => !activeCompanyId || row.assignment.propertyCompanyId === activeCompanyId || row.community?.propertyCompanyId === activeCompanyId || (!row.assignment.propertyCompanyId && !row.community));
      const platform = rows.some(row => row.role.code === 'PLATFORM_ADMIN');
      const companyWide = platform || assignments.some(row => row.role.scopeType === 'COMPANY');
      const companyIds = [...new Set(assignments.flatMap(row => [row.assignment.propertyCompanyId, row.community?.propertyCompanyId]).filter(Boolean) as string[])];
      const communityIds = [...new Set(assignments.map(row => row.assignment.communityId).filter(Boolean) as string[])];
      const roleCodes = [...new Set(assignments.map(row => row.role.code))];
      const roleIds = [...new Set(assignments.map(row => row.role.id))];
      const permissionRows = roleIds.length ? await db.select({ permission: permissions }).from(rolePermissions).innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id)).where(inArray(rolePermissions.roleId, roleIds)) : [];
      return { userId, platform, companyWide, companyIds, communityIds, roles: roleCodes, permissions: [...new Set(permissionRows.map(row => row.permission.code))], activePropertyCompanyId: activeCompanyId || companyIds[0] || null };
    },
    async listCompanies(scope) { const where = companyFilter(scope); const rows = where ? await db.select().from(propertyCompanies).where(where) : await db.select().from(propertyCompanies); return rows.map(companyMap); },
    async getCompany(id, scope) { const where = companyFilter(scope); const conditions = where ? and(eq(propertyCompanies.id, id), where) : eq(propertyCompanies.id, id); const [row] = await db.select().from(propertyCompanies).where(conditions).limit(1); return row ? companyMap(row) : null; },
    async createCompany(input) { const [row] = await db.insert(propertyCompanies).values(input).returning(); return companyMap(row); },
    async listCommunities(scope) { const conditions = communityFilter(scope); const rows = conditions ? await db.select().from(communities).where(conditions) : await db.select().from(communities); return rows.map(communityMap); },
    async getCommunity(id, scope) { const range = communityFilter(scope); const conditions = range ? and(eq(communities.id, id), range) : eq(communities.id, id); const [row] = await db.select().from(communities).where(conditions).limit(1); return row ? communityMap(row) : null; },
    async createCommunity(input) { const [row] = await db.insert(communities).values(input).returning(); return communityMap(row); },
    async updateCommunity(id, input, scope) { const current = await repository.getCommunity(id, scope); if (!current) return null; const [row] = await db.update(communities).set({ ...input, updatedAt: new Date() }).where(eq(communities.id, id)).returning(); return row ? communityMap(row) : null; },
    async disableCommunity(id, scope) { const current = await repository.getCommunity(id, scope); if (!current) return null; const [row] = await db.update(communities).set({ status: 'DISABLED', disabledAt: new Date(), updatedAt: new Date() }).where(eq(communities.id, id)).returning(); return row ? communityMap(row) : null; },
    async listEmployees(scope) {
      const companyCondition = scope.companyIds.length
        ? inArray(companyMemberships.propertyCompanyId, scope.companyIds)
        : eq(companyMemberships.propertyCompanyId, '00000000-0000-0000-0000-000000000000');
      const communityCondition = scope.communityIds.length
        ? exists(db.select({ id: userRoleAssignments.id }).from(userRoleAssignments).where(and(eq(userRoleAssignments.userId, users.id), isNull(userRoleAssignments.revokedAt), inArray(userRoleAssignments.communityId, scope.communityIds))))
        : eq(users.id, '00000000-0000-0000-0000-000000000000');
      const range = scope.platform ? undefined : scope.companyWide ? companyCondition : and(companyCondition, communityCondition);
      const rows = range
        ? await db.select({ employee: employeeProfiles, membership: companyMemberships, user: users }).from(employeeProfiles).innerJoin(companyMemberships, eq(employeeProfiles.companyMembershipId, companyMemberships.id)).innerJoin(users, eq(companyMemberships.userId, users.id)).where(range)
        : await db.select({ employee: employeeProfiles, membership: companyMemberships, user: users }).from(employeeProfiles).innerJoin(companyMemberships, eq(employeeProfiles.companyMembershipId, companyMemberships.id)).innerJoin(users, eq(companyMemberships.userId, users.id));
      return rows.map(row => ({ ...row.employee, user: userMap(row.user), membership: membershipMap(row.membership) }));
    },
    async getEmployee(id, scope) { const rows = await repository.listEmployees(scope); return rows.find(row => row.id === id) || null; },
    async createEmployee(input) { return db.transaction(async tx => { const [userRow] = await tx.insert(users).values(input.user).returning(); const [membershipRow] = await tx.insert(companyMemberships).values({ userId: userRow.id, propertyCompanyId: input.companyId, membershipType: 'PROPERTY_EMPLOYEE', status: 'ACTIVE' }).returning(); const [employeeRow] = await tx.insert(employeeProfiles).values({ ...input.employee, companyMembershipId: membershipRow.id }).returning(); return { user: userMap(userRow), membership: membershipMap(membershipRow), employee: employeeRow as EmployeeRecord }; }); },
    async updateEmployee(id, input, scope) { const current = await repository.getEmployee(id, scope); if (!current) return null; const disabledAt = input.status === 'DISABLED' ? new Date() : input.status === 'ACTIVE' ? null : undefined; await db.update(users).set({ ...(input.name !== undefined ? { name: input.name } : {}), ...(input.phone !== undefined ? { phone: input.phone } : {}), ...(input.status !== undefined ? { status: input.status } : {}), ...(disabledAt !== undefined ? { disabledAt } : {}), updatedAt: new Date() }).where(eq(users.id, current.user.id)); await db.update(employeeProfiles).set({ ...(input.department !== undefined ? { department: input.department } : {}), ...(input.position !== undefined ? { position: input.position } : {}), ...(input.employeeType !== undefined ? { employeeType: input.employeeType } : {}), updatedAt: new Date() }).where(eq(employeeProfiles.id, id)); return repository.getEmployee(id, scope); },
    async disableEmployee(id, scope) { return repository.updateEmployee(id, { status: 'DISABLED' }, scope); },
    async listRoles() { const rows = await db.select().from(roles); return rows.map(roleMap); },
    async listPermissions() { const rows = await db.select().from(permissions); return rows.map(permissionMap); },
    async assignRole(input) { const [row] = await db.insert(userRoleAssignments).values(input).returning(); return row as AssignmentRecord; },
    async getAssignment(id) { const [row] = await db.select({ assignment: userRoleAssignments, role: roles }).from(userRoleAssignments).innerJoin(roles, eq(userRoleAssignments.roleId, roles.id)).where(and(eq(userRoleAssignments.id, id), isNull(userRoleAssignments.revokedAt))).limit(1); return row ? { ...row.assignment, role: roleMap(row.role) } : null; },
    async revokeRole(id) { await db.update(userRoleAssignments).set({ revokedAt: new Date() }).where(eq(userRoleAssignments.id, id)); },
    async listAssignments(userId) { const rows = await db.select({ assignment: userRoleAssignments, role: roles }).from(userRoleAssignments).innerJoin(roles, eq(userRoleAssignments.roleId, roles.id)).where(and(eq(userRoleAssignments.userId, userId), isNull(userRoleAssignments.revokedAt))); return rows.map(row => ({ ...row.assignment, role: roleMap(row.role) })); },
    async listBuildings(scope, filters = {}) {
      const conditions: any[] = [];
      const scoped = scopedCommunities(scope); if (scoped) conditions.push(scoped);
      if (filters.communityId) conditions.push(eq(buildings.communityId, filters.communityId));
      if (filters.keyword) conditions.push(or(sql`${buildings.name} ILIKE ${`%${filters.keyword}%`}`, sql`${buildings.code} ILIKE ${`%${filters.keyword}%`}`));
      const rows = await db.select({ building: buildings, community: communities }).from(buildings).innerJoin(communities, eq(buildings.communityId, communities.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(buildings.code);
      return rows.map(row => ({ ...buildingMap(row.building), displayAddress: row.building.displayName || row.building.name }));
    },
    async getBuilding(id, scope) {
      const scoped = scopedCommunities(scope); const conditions = scoped ? and(eq(buildings.id, id), scoped) : eq(buildings.id, id);
      const [row] = await db.select({ building: buildings, community: communities }).from(buildings).innerJoin(communities, eq(buildings.communityId, communities.id)).where(conditions).limit(1);
      return row ? { ...buildingMap(row.building), displayAddress: row.building.displayName || row.building.name } : null;
    },
    async createBuilding(input) { const [row] = await db.insert(buildings).values(input).returning(); return buildingMap(row); },
    async updateBuilding(id, input, scope) { if (!(await repository.getBuilding(id, scope))) return null; const [row] = await db.update(buildings).set({ ...input, updatedAt: new Date() }).where(eq(buildings.id, id)).returning(); return row ? buildingMap(row) : null; },
    async disableBuilding(id, scope) { if (!(await repository.getBuilding(id, scope))) return null; const [row] = await db.update(buildings).set({ status: 'INACTIVE', disabledAt: new Date(), updatedAt: new Date() }).where(eq(buildings.id, id)).returning(); return row ? buildingMap(row) : null; },
    async listBuildingUnits(buildingId, scope) { if (!(await repository.getBuilding(buildingId, scope))) return []; const rows = await db.select().from(buildingUnits).where(eq(buildingUnits.buildingId, buildingId)).orderBy(buildingUnits.code); return rows.map(unitMap); },
    async getBuildingUnit(id, scope) { const scoped = scopedCommunities(scope); const conditions = scoped ? and(eq(buildingUnits.id, id), eq(buildingUnits.buildingId, buildings.id), scoped) : eq(buildingUnits.id, id); const [row] = await db.select({ unit: buildingUnits }).from(buildingUnits).innerJoin(buildings, eq(buildingUnits.buildingId, buildings.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(conditions).limit(1); return row ? unitMap(row.unit) : null; },
    async createBuildingUnit(input) { const [row] = await db.insert(buildingUnits).values(input).returning(); return unitMap(row); },
    async updateBuildingUnit(id, input, scope) { if (!(await repository.getBuildingUnit(id, scope))) return null; const [row] = await db.update(buildingUnits).set({ ...input, updatedAt: new Date() }).where(eq(buildingUnits.id, id)).returning(); return row ? unitMap(row) : null; },
    async disableBuildingUnit(id, scope) { if (!(await repository.getBuildingUnit(id, scope))) return null; const [row] = await db.update(buildingUnits).set({ status: 'INACTIVE', disabledAt: new Date(), updatedAt: new Date() }).where(eq(buildingUnits.id, id)).returning(); return row ? unitMap(row) : null; },
    async listHouses(scope, filters = {}) {
      const conditions: any[] = []; const scoped = scopedCommunities(scope); if (scoped) conditions.push(scoped);
      if (filters.communityId) conditions.push(eq(communities.id, filters.communityId));
      if (filters.buildingId) conditions.push(eq(houses.buildingId, filters.buildingId));
      if (filters.unitId) conditions.push(eq(houses.buildingUnitId, filters.unitId));
      if (filters.status) conditions.push(eq(houses.status, filters.status as any));
      if (filters.keyword) conditions.push(or(sql`${houses.code} ILIKE ${`%${filters.keyword}%`}`, sql`${houses.legacyCode} ILIKE ${`%${filters.keyword}%`}`));
      const where = conditions.length ? and(...conditions) : undefined;
      const page = filters.page || 1; const pageSize = filters.pageSize || 20;
      const [totalRow] = await db.select({ total: sql<number>`count(*)` }).from(houses).innerJoin(buildings, eq(houses.buildingId, buildings.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(where);
      const rows = await db.select({ house: houses, building: buildings, unit: buildingUnits, community: communities }).from(houses).innerJoin(buildings, eq(houses.buildingId, buildings.id)).leftJoin(buildingUnits, eq(houses.buildingUnitId, buildingUnits.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(where).orderBy(communities.code, buildings.code, buildingUnits.code, houses.code, houses.id).limit(pageSize).offset((page - 1) * pageSize);
      return { items: rows.map(houseDto), page, pageSize, total: Number(totalRow?.total || 0) };
    },
    async getHouse(id, scope) { const scoped = scopedCommunities(scope); const conditions = scoped ? and(eq(houses.id, id), scoped) : eq(houses.id, id); const [row] = await db.select({ house: houses, building: buildings, unit: buildingUnits, community: communities }).from(houses).innerJoin(buildings, eq(houses.buildingId, buildings.id)).leftJoin(buildingUnits, eq(houses.buildingUnitId, buildingUnits.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(conditions).limit(1); return row ? houseDto(row) : null; },
    async createHouse(input) { const [row] = await db.insert(houses).values(input).returning(); return houseMap(row); },
    async updateHouse(id, input, scope) { if (!(await repository.getHouse(id, scope))) return null; const [row] = await db.update(houses).set({ ...input, updatedAt: new Date() }).where(eq(houses.id, id)).returning(); return row ? houseMap(row) : null; },
    async disableHouse(id, scope) { if (!(await repository.getHouse(id, scope))) return null; const [row] = await db.update(houses).set({ status: 'INACTIVE', disabledAt: new Date(), updatedAt: new Date() }).where(eq(houses.id, id)).returning(); return row ? houseMap(row) : null; },
    async listPeople(scope, filters = {}) {
      const conditions: any[] = []; const scoped = personScopeCondition(scope, false); if (scoped) conditions.push(scoped);
      if (filters.keyword) { const phone = normalizePhone(filters.keyword); conditions.push(phone ? or(sql`${people.name} ILIKE ${`%${filters.keyword}%`}`, eq(people.phone, phone)) : sql`${people.name} ILIKE ${`%${filters.keyword}%`}`); }
      if (filters.relationshipType || filters.houseId || filters.communityId || filters.buildingId || filters.unitId) {
        const relation: any[] = [eq(housePersonRelationships.personId, people.id)];
        if (filters.relationshipType) relation.push(eq(housePersonRelationships.relationshipType, filters.relationshipType as any));
        if (filters.houseId) relation.push(eq(housePersonRelationships.houseId, filters.houseId));
        if (!scope.companyWide && !scope.platform) relation.push(inArray(communities.id, scope.communityIds));
        if (filters.communityId) relation.push(eq(communities.id, filters.communityId));
        if (filters.buildingId) relation.push(eq(buildings.id, filters.buildingId));
        if (filters.unitId) relation.push(eq(houses.buildingUnitId, filters.unitId));
        relation.push(currentOrFuture(housePersonRelationships.endDate));
        conditions.push(exists(db.select({ id: housePersonRelationships.id }).from(housePersonRelationships).innerJoin(houses, eq(housePersonRelationships.houseId, houses.id)).innerJoin(buildings, eq(houses.buildingId, buildings.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(and(...relation))));
      }
      const where = conditions.length ? and(...conditions) : undefined;
      const page = filters.page || 1; const pageSize = filters.pageSize || 20;
      const [totalRow] = await db.select({ total: sql<number>`count(*)` }).from(people).where(where);
      const rows = await db.select().from(people).where(where).orderBy(people.name, people.id).limit(pageSize).offset((page - 1) * pageSize);
      return { items: rows.map(row => personDto(personMap(row))), page, pageSize, total: Number(totalRow?.total || 0) };
    },
    async getPerson(id, scope, options = {}) { const scoped = personScopeCondition(scope, options.includeHistory ?? false); const conditions = scoped ? and(eq(people.id, id), scoped) : eq(people.id, id); const [row] = await db.select().from(people).where(conditions).limit(1); return row ? personDto(personMap(row)) : null; },
    async createPerson(input) { const phone = normalizePhone(input.phone); if (input.phone && !phone) throw new Error('手机号格式不正确'); const [row] = await db.insert(people).values({ ...input, phone }).returning(); return personMap(row); },
    async updatePerson(id, input, scope) { if (!(await repository.getPerson(id, scope))) return null; const values: any = { ...input, updatedAt: new Date() }; if (input.phone !== undefined) { values.phone = normalizePhone(input.phone); if (input.phone && !values.phone) throw new Error('手机号格式不正确'); } const [row] = await db.update(people).set(values).where(eq(people.id, id)).returning(); return row ? personMap(row) : null; },
    async disablePerson(id, scope) { if (!(await repository.getPerson(id, scope))) return null; const [row] = await db.update(people).set({ status: 'DISABLED', disabledAt: new Date(), updatedAt: new Date() }).where(eq(people.id, id)).returning(); return row ? personMap(row) : null; },
    async getPersonContact(id, scope) { const person = await repository.getPerson(id, scope); return person ? { id: person.id, name: person.name, phone: (await db.select({ phone: people.phone }).from(people).where(eq(people.id, id)).limit(1))[0]?.phone || null } : null; },
    async listHouseRelationships(houseId, scope, includeHistory = true) {
      if (!(await repository.getHouse(houseId, scope))) return [];
      const rows = await db.select({ relation: housePersonRelationships, person: people }).from(housePersonRelationships).innerJoin(people, eq(housePersonRelationships.personId, people.id)).where(and(eq(housePersonRelationships.houseId, houseId), ...(includeHistory ? [] : [currentOrFuture(housePersonRelationships.endDate)]))).orderBy(housePersonRelationships.startDate);
      return rows.map(row => ({ ...relationshipMap(row.relation), person: personDto(personMap(row.person)) }));
    },
    async listPersonRelationships(personId, scope, includeHistory = true) {
      if (!(await repository.getPerson(personId, scope, { includeHistory }))) return [];
      const rows = await db.select({ relation: housePersonRelationships, house: houses, building: buildings, unit: buildingUnits, community: communities }).from(housePersonRelationships).innerJoin(houses, eq(housePersonRelationships.houseId, houses.id)).innerJoin(buildings, eq(houses.buildingId, buildings.id)).leftJoin(buildingUnits, eq(houses.buildingUnitId, buildingUnits.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(and(eq(housePersonRelationships.personId, personId), ...(includeHistory ? [] : [currentOrFuture(housePersonRelationships.endDate)]))).orderBy(housePersonRelationships.startDate);
      return rows.filter(row => { const scoped = scopedCommunities(scope); return !scoped || scope.platform || scope.companyWide ? true : scope.communityIds.includes(row.community.id); }).map(row => ({ ...relationshipMap(row.relation), house: houseDto({ house: row.house, building: row.building, unit: row.unit, community: row.community }) }));
    },
    async createHouseRelationship(input) {
      return db.transaction(async tx => {
        const [house] = await tx.select({ house: houses, companyId: communities.propertyCompanyId }).from(houses).innerJoin(buildings, eq(houses.buildingId, buildings.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(eq(houses.id, input.houseId)).for('update').limit(1);
        const [person] = await tx.select().from(people).where(eq(people.id, input.personId)).limit(1);
        if (!house || !person || person.propertyCompanyId !== house.companyId) throw new Error('房屋和客户不属于同一物业公司');
        const [row] = await tx.insert(housePersonRelationships).values(input as any).returning(); return relationshipMap(row) as HouseRelationshipRecord;
      });
    },
    async updateHouseRelationship(id, input, scope) { const [current] = await db.select().from(housePersonRelationships).where(eq(housePersonRelationships.id, id)).limit(1); if (!current || !(await repository.getHouse(current.houseId, scope))) return null; const [row] = await db.update(housePersonRelationships).set({ ...input, updatedAt: new Date() } as any).where(eq(housePersonRelationships.id, id)).returning(); return row ? relationshipMap(row) as HouseRelationshipRecord : null; },
    async endHouseRelationship(id, endDate, scope) { return repository.updateHouseRelationship(id, { endDate }, scope); },
    async verifyHouseRelationship(id, status, note, reviewerUserId, scope) { if (status === 'REJECTED' && !note) throw new Error('驳回关系必须填写原因'); const [current] = await db.select().from(housePersonRelationships).where(eq(housePersonRelationships.id, id)).limit(1); if (!current || !(await repository.getHouse(current.houseId, scope))) return null; const [row] = await db.update(housePersonRelationships).set({ verificationStatus: status, verificationNote: note, reviewedAt: new Date(), reviewedByUserId: reviewerUserId, updatedAt: new Date() }).where(eq(housePersonRelationships.id, id)).returning(); return row ? relationshipMap(row) as HouseRelationshipRecord : null; },
    async createResidentAtomic(input, scope) {
      const house = await repository.getHouse(input.houseId, scope); if (!house) throw new Error('无权访问房屋');
      if (input.existingPersonId && !(await repository.getPerson(input.existingPersonId, scope))) throw new Error('客户不在当前小区范围');
      return db.transaction(async tx => {
        const [lockedHouse] = await tx.select({ houseId: houses.id, propertyCompanyId: communities.propertyCompanyId, communityId: communities.id }).from(houses).innerJoin(buildings, eq(houses.buildingId, buildings.id)).innerJoin(communities, eq(buildings.communityId, communities.id)).where(eq(houses.id, input.houseId)).for('update').limit(1);
        if (!lockedHouse || lockedHouse.propertyCompanyId !== house.propertyCompanyId) throw new Error('房屋租户范围已变化');
        let person: PersonRecord;
        let createdPerson = false;
        if (input.existingPersonId) { const [row] = await tx.select().from(people).where(eq(people.id, input.existingPersonId)).limit(1); if (!row || row.propertyCompanyId !== house.propertyCompanyId) throw new Error('客户不属于当前物业公司'); person = personMap(row); }
        else { if (!input.newPerson) throw new Error('缺少新客户信息'); const phone = normalizePhone(input.newPerson.phone); if (input.newPerson.phone && !phone) throw new Error('手机号格式不正确'); const [row] = await tx.insert(people).values({ propertyCompanyId: house.propertyCompanyId!, name: input.newPerson.name, phone, gender: input.newPerson.gender || null }).returning(); person = personMap(row); createdPerson = true; }
        const [row] = await tx.insert(housePersonRelationships).values({ houseId: input.houseId, personId: person.id, ...input.relationship } as any).returning();
        if (input.actorUserId) {
          if (createdPerson) await tx.insert(auditLogs).values({ action: 'PERSON_CREATED', actorUserId: input.actorUserId, propertyCompanyId: lockedHouse.propertyCompanyId, communityId: lockedHouse.communityId, resourceType: 'person', resourceId: person.id, requestId: input.requestId, afterData: { name: person.name, phone: person.phone ? 'REDACTED' : null } });
          await tx.insert(auditLogs).values({ action: 'HOUSE_RELATION_CREATED', actorUserId: input.actorUserId, propertyCompanyId: lockedHouse.propertyCompanyId, communityId: lockedHouse.communityId, resourceType: 'house_relationship', resourceId: row.id, requestId: input.requestId, afterData: { personId: person.id, houseId: input.houseId, relationshipType: input.relationship.relationshipType } });
        }
        return { person, relationship: relationshipMap(row) as HouseRelationshipRecord };
      });
    },
    async listWorkOrders(scope, filters: WorkOrderFilters = {}) {
      const conditions: any[] = [];
      const scoped = workOrderScopeCondition(scope); if (scoped) conditions.push(scoped);
      if (filters.communityId) conditions.push(eq(workOrders.communityId, filters.communityId));
      if (filters.houseId) conditions.push(eq(workOrders.houseId, filters.houseId));
      if (filters.status) conditions.push(eq(workOrders.status, filters.status));
      if (filters.assignedUserId) conditions.push(eq(workOrders.assignedUserId, filters.assignedUserId));
      if (filters.keyword) conditions.push(or(sql`${workOrders.orderNo} ILIKE ${`%${filters.keyword}%`}`, sql`${workOrders.title} ILIKE ${`%${filters.keyword}%`}`, sql`${workOrders.description} ILIKE ${`%${filters.keyword}%`}`));
      const where = conditions.length ? and(...conditions) : undefined;
      const page = filters.page || 1; const pageSize = filters.pageSize || 20;
      const [totalRow] = await db.select({ total: sql<number>`count(*)` }).from(workOrders).where(where);
      const rows = await db.select().from(workOrders).where(where).orderBy(desc(workOrders.createdAt), desc(workOrders.id)).limit(pageSize).offset((page - 1) * pageSize);
      const revealPhone = scope.permissions.includes('work_order:contact:read');
      return { items: rows.map(row => workOrderDto(workOrderMap(row), revealPhone)), page, pageSize, total: Number(totalRow?.total || 0) };
    },
    async getWorkOrder(id, scope) {
      const scoped = workOrderScopeCondition(scope); const where = scoped ? and(eq(workOrders.id, id), scoped) : eq(workOrders.id, id);
      const [row] = await db.select().from(workOrders).where(where).limit(1);
      return row ? workOrderDto(workOrderMap(row), scope.permissions.includes('work_order:contact:read')) : null;
    },
    async createWorkOrder(input) {
      const orderNo = `WO-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const [row] = await db.insert(workOrders).values({ ...input, orderNo, communityId: input.communityId || null, houseId: input.houseId || null, requesterUserId: input.requesterUserId || null, requesterRelationshipId: input.requesterRelationshipId || null }).returning();
      await db.insert(workOrderEvents).values({ workOrderId: row.id, propertyCompanyId: row.propertyCompanyId, communityId: row.communityId, actorUserId: input.actorUserId || null, fromStatus: null, toStatus: 'PENDING_DISPATCH', action: 'CREATE', note: null });
      return workOrderMap(row);
    },
    async assignWorkOrder(id, assignedUserId, actorUserId, scope, note = null, requestId) {
      return db.transaction(async rawTx => {
        const tx = createDrizzleRepository(rawTx as unknown as AppDb);
        const current = await tx.getWorkOrder(id, scope); if (!current) return null;
        if (current.status !== 'PENDING_DISPATCH') throw new AppError(409, 'INVALID_WORK_ORDER_STATE', '只有待派工工单可以派工');
        const assigneeConditions: any[] = [eq(users.id, assignedUserId), eq(companyMemberships.propertyCompanyId, current.propertyCompanyId), eq(users.status, 'ACTIVE'), eq(companyMemberships.status, 'ACTIVE'), eq(roles.code, 'ENGINEER'), isNull(userRoleAssignments.revokedAt)];
        if (current.communityId) assigneeConditions.push(eq(userRoleAssignments.communityId, current.communityId));
        const [assignee] = await rawTx.select({ user: users, membership: companyMemberships }).from(users).innerJoin(companyMemberships, eq(companyMemberships.userId, users.id)).innerJoin(userRoleAssignments, eq(userRoleAssignments.userId, users.id)).innerJoin(roles, eq(userRoleAssignments.roleId, roles.id)).where(and(...assigneeConditions)).limit(1);
        if (!assignee) throw new AppError(422, 'INVALID_ASSIGNEE', '工程师不属于当前物业公司');
        if (current.communityId && !scope.platform && !scope.companyWide && !scope.communityIds.includes(current.communityId)) throw new AppError(403, 'FORBIDDEN', '无权派发该小区工单');
        const now = new Date();
        const [row] = await rawTx.update(workOrders).set({ assignedUserId, status: 'ASSIGNED', assignedAt: now, updatedAt: now }).where(eq(workOrders.id, id)).returning();
        await rawTx.insert(workOrderEvents).values({ workOrderId: id, propertyCompanyId: current.propertyCompanyId, communityId: current.communityId, actorUserId, fromStatus: current.status, toStatus: 'ASSIGNED', action: 'ASSIGN', note });
        await tx.audit({ action: 'WORK_ORDER_ASSIGNED', actorUserId, propertyCompanyId: current.propertyCompanyId, communityId: current.communityId, resourceType: 'work_order', resourceId: id, afterData: { assignedUserId }, requestId });
        return workOrderMap(row);
      });
    },
    async transitionWorkOrder(id, toStatus, actorUserId, scope, note = null, requestId) {
      return db.transaction(async rawTx => {
        const tx = createDrizzleRepository(rawTx as unknown as AppDb);
        const current = await tx.getWorkOrder(id, scope); if (!current) return null;
        if (!workOrderTransitions[current.status].includes(toStatus)) throw new AppError(409, 'INVALID_WORK_ORDER_TRANSITION', `不允许从 ${current.status} 流转到 ${toStatus}`);
        if (['ACCEPTED', 'ARRIVED', 'COMPLETED'].includes(toStatus) && current.assignedUserId !== actorUserId && !scope.companyWide && !scope.platform) throw new AppError(403, 'FORBIDDEN', '只有被派工工程师或管理者可以更新工单');
        const now = new Date();
        const values: Record<string, unknown> = { status: toStatus, updatedAt: now };
        if (toStatus === 'ACCEPTED') values.acceptedAt = now;
        if (toStatus === 'ARRIVED') values.arrivedAt = now;
        if (toStatus === 'COMPLETED') values.completedAt = now;
        if (toStatus === 'ARCHIVED') values.archivedAt = now;
        if (toStatus === 'CANCELLED') values.cancelledAt = now;
        const [row] = await rawTx.update(workOrders).set(values as any).where(eq(workOrders.id, id)).returning();
        await rawTx.insert(workOrderEvents).values({ workOrderId: id, propertyCompanyId: current.propertyCompanyId, communityId: current.communityId, actorUserId, fromStatus: current.status, toStatus, action: 'TRANSITION', note });
        await tx.audit({ action: `WORK_ORDER_${toStatus}`, actorUserId, propertyCompanyId: current.propertyCompanyId, communityId: current.communityId, resourceType: 'work_order', resourceId: id, afterData: { fromStatus: current.status, toStatus, note }, requestId });
        return workOrderMap(row);
      });
    },
    async listWorkOrderEvents(id, scope) {
      const order = await repository.getWorkOrder(id, scope); if (!order) return [];
      const conditions: any[] = [eq(workOrderEvents.workOrderId, id)]; const scoped = workOrderEventScopeCondition(scope); if (scoped) conditions.push(scoped);
      const rows = await db.select().from(workOrderEvents).where(and(...conditions)).orderBy(workOrderEvents.createdAt);
      return rows.map(workOrderEventMap);
    },
    async audit(input) { await db.insert(auditLogs).values({ ...input, beforeData: input.beforeData as any, afterData: input.afterData as any }); }
  };
  return repository;
}
