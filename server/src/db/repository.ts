import { and, desc, eq, inArray, isNull, or } from 'drizzle-orm';
import type { AppDb } from './client.js';
import { auditLogs, communities, companyMemberships, employeeProfiles, permissions, propertyCompanies, rolePermissions, roles, sessions, userRoleAssignments, users } from './schema/index.js';
import type { AssignmentRecord, AuditInput, CommunityRecord, CompanyRecord, EmployeeRecord, MembershipRecord, PermissionRecord, Repository, RoleRecord, Scope, SessionRecord, Status, UserRecord } from '../shared/types.js';

const userMap = (row: any): UserRecord => ({ id: row.id, name: row.name, phone: row.phone, email: row.email, passwordHash: row.passwordHash, status: row.status, lastLoginAt: row.lastLoginAt, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const companyMap = (row: any): CompanyRecord => ({ id: row.id, code: row.code, name: row.name, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const communityMap = (row: any): CommunityRecord => ({ id: row.id, propertyCompanyId: row.propertyCompanyId, code: row.code, name: row.name, address: row.address, status: row.status, disabledAt: row.disabledAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const membershipMap = (row: any): MembershipRecord => ({ id: row.id, userId: row.userId, propertyCompanyId: row.propertyCompanyId, membershipType: row.membershipType, status: row.status, joinedAt: row.joinedAt, leftAt: row.leftAt, createdAt: row.createdAt, updatedAt: row.updatedAt });
const roleMap = (row: any): RoleRecord => ({ id: row.id, code: row.code, name: row.name, scopeType: row.scopeType, createdAt: row.createdAt, updatedAt: row.updatedAt });
const permissionMap = (row: any): PermissionRecord => ({ id: row.id, code: row.code, name: row.name, resource: row.resource, action: row.action, createdAt: row.createdAt, updatedAt: row.updatedAt });
const sessionMap = (row: any): SessionRecord => ({ id: row.id, userId: row.userId, tokenHash: row.tokenHash, activePropertyCompanyId: row.activePropertyCompanyId, expiresAt: row.expiresAt, lastSeenAt: row.lastSeenAt, revokedAt: row.revokedAt, userAgent: row.userAgent, ipHash: row.ipHash, createdAt: row.createdAt });

export function createDrizzleRepository(db: AppDb): Repository {
  const companyFilter = (scope: Scope) => scope.platform ? undefined : scope.companyIds.length ? inArray(propertyCompanies.id, scope.companyIds) : eq(propertyCompanies.id, '00000000-0000-0000-0000-000000000000');
  const communityFilter = (scope: Scope) => {
    if (scope.platform) return undefined;
    const companyCondition = scope.companyIds.length ? inArray(communities.propertyCompanyId, scope.companyIds) : eq(communities.id, '00000000-0000-0000-0000-000000000000');
    return scope.companyWide ? companyCondition : scope.communityIds.length ? and(companyCondition, inArray(communities.id, scope.communityIds)) : eq(communities.id, '00000000-0000-0000-0000-000000000000');
  };
  const repository: Repository = {
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
    async listEmployees(scope) { const rows = await db.select({ employee: employeeProfiles, membership: companyMemberships, user: users }).from(employeeProfiles).innerJoin(companyMemberships, eq(employeeProfiles.companyMembershipId, companyMemberships.id)).innerJoin(users, eq(companyMemberships.userId, users.id)); return rows.filter(row => scope.platform || scope.companyIds.includes(row.membership.propertyCompanyId)).map(row => ({ ...row.employee, user: userMap(row.user), membership: membershipMap(row.membership) })); },
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
    async audit(input) { await db.insert(auditLogs).values({ ...input, beforeData: input.beforeData as any, afterData: input.afterData as any }); }
  };
  return repository;
}
