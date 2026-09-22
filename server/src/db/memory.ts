import { randomUUID } from 'node:crypto';
import type { AssignmentRecord, AuditInput, CommunityRecord, CompanyRecord, EmployeeRecord, MembershipRecord, PermissionRecord, Repository, RoleRecord, Scope, SessionRecord, UserRecord } from '../shared/types.js';

const now = () => new Date();
const copy = <T>(value: T): T => structuredClone(value);

export function createMemoryRepository(seed: Partial<MemoryState> = {}): Repository {
  const state: MemoryState = {
    users: [], companies: [], communities: [], memberships: [], employees: [], roles: [], permissions: [], rolePermissions: [], assignments: [], sessions: [], audits: [],
    ...copy(seed)
  };
  const visibleCompany = (scope: Scope, id: string) => scope.platform || scope.companyIds.includes(id);
  const visibleCommunity = (scope: Scope, item: CommunityRecord) => visibleCompany(scope, item.propertyCompanyId) && (scope.platform || scope.companyWide || scope.communityIds.includes(item.id));
  const employee = (id: string) => {
    const profile = state.employees.find(item => item.id === id); if (!profile) return null;
    const membership = state.memberships.find(item => item.id === profile.companyMembershipId); const user = membership && state.users.find(item => item.id === membership.userId);
    return membership && user ? { ...copy(profile), user: copy(user), membership: copy(membership) } : null;
  };
  const allEmployees = () => state.employees.map(item => employee(item.id)).filter(Boolean) as Array<EmployeeRecord & { user: UserRecord; membership: MembershipRecord }>;
  const repository: Repository = {
    async findUserByPhone(phone) { return copy(state.users.find(item => item.phone === phone) || null); },
    async findUserById(id) { return copy(state.users.find(item => item.id === id) || null); },
    async hasCompanyMembership(userId, propertyCompanyId) { return state.memberships.some(item => item.userId === userId && item.propertyCompanyId === propertyCompanyId && item.status === 'ACTIVE'); },
    async getCommunityCompanyId(communityId) { return state.communities.find(item => item.id === communityId)?.propertyCompanyId || null; },
    async updateUserLastLogin(id) { const user = state.users.find(item => item.id === id); if (user) user.lastLoginAt = now(); },
    async createSession(input) { const session: SessionRecord = { ...input, createdAt: now(), lastSeenAt: now(), revokedAt: null }; state.sessions.push(session); return copy(session); },
    async findActiveSession(tokenHash) { const item = state.sessions.find(session => session.tokenHash === tokenHash && !session.revokedAt && session.expiresAt > now()); return copy(item || null); },
    async touchSession(id) { const item = state.sessions.find(session => session.id === id); if (item) item.lastSeenAt = now(); },
    async revokeSession(id) { const item = state.sessions.find(session => session.id === id); if (item) item.revokedAt = now(); },
    async listSessions(userId) { return copy(state.sessions.filter(session => session.userId === userId)); },
    async scopeForUser(userId, activeCompanyId = null) {
      const assignments = state.assignments.filter(item => item.userId === userId && !item.revokedAt);
      const roles = assignments.map(item => state.roles.find(role => role.id === item.roleId)).filter(Boolean) as RoleRecord[];
      const platform = roles.some(role => role.code === 'PLATFORM_ADMIN');
      const activeAssignments = assignments.filter(item => {
        const communityCompanyId = item.communityId ? state.communities.find(community => community.id === item.communityId)?.propertyCompanyId : null;
        return !activeCompanyId || item.propertyCompanyId === activeCompanyId || communityCompanyId === activeCompanyId || (!item.propertyCompanyId && !communityCompanyId);
      });
      const activeRoles = activeAssignments.map(item => state.roles.find(role => role.id === item.roleId)).filter(Boolean) as RoleRecord[];
      const companyWide = platform || activeRoles.some(role => role.scopeType === 'COMPANY');
      const communityCompanyIds = activeAssignments.map(item => item.communityId ? state.communities.find(community => community.id === item.communityId)?.propertyCompanyId : null).filter(Boolean) as string[];
      const companyIds = [...new Set([...activeAssignments.map(item => item.propertyCompanyId), ...communityCompanyIds].filter(Boolean) as string[])].filter(id => !activeCompanyId || id === activeCompanyId);
      const communityIds = [...new Set(activeAssignments.map(item => item.communityId).filter(Boolean) as string[])];
      const permissions = [...new Set(activeRoles.flatMap(role => state.rolePermissions.filter(link => link.roleId === role.id).map(link => state.permissions.find(permission => permission.id === link.permissionId)?.code).filter(Boolean) as string[]))];
      return { userId, platform, companyWide, companyIds, communityIds, roles: activeRoles.map(role => role.code), permissions, activePropertyCompanyId: activeCompanyId || companyIds[0] || null };
    },
    async listCompanies(scope) { return copy(state.companies.filter(company => scope.platform || scope.companyIds.includes(company.id))); },
    async getCompany(id, scope) { const item = state.companies.find(company => company.id === id && visibleCompany(scope, id)); return copy(item || null); },
    async createCompany(input) { const item: CompanyRecord = { id: randomUUID(), code: input.code, name: input.name, status: 'ACTIVE', disabledAt: null, createdAt: now(), updatedAt: now() }; state.companies.push(item); return copy(item); },
    async listCommunities(scope) { return copy(state.communities.filter(item => visibleCommunity(scope, item))); },
    async getCommunity(id, scope) { const item = state.communities.find(community => community.id === id && visibleCommunity(scope, community)); return copy(item || null); },
    async createCommunity(input) { const item: CommunityRecord = { id: randomUUID(), propertyCompanyId: input.propertyCompanyId, code: input.code, name: input.name, address: input.address || null, status: 'ACTIVE', disabledAt: null, createdAt: now(), updatedAt: now() }; state.communities.push(item); return copy(item); },
    async updateCommunity(id, input, scope) { const item = state.communities.find(community => community.id === id && visibleCommunity(scope, community)); if (!item) return null; Object.assign(item, input, { updatedAt: now() }); return copy(item); },
    async disableCommunity(id, scope) { const item = state.communities.find(community => community.id === id && visibleCommunity(scope, community)); if (!item) return null; Object.assign(item, { status: 'DISABLED', disabledAt: now(), updatedAt: now() }); return copy(item); },
    async listEmployees(scope) { return allEmployees().filter(item => visibleCompany(scope, item.membership.propertyCompanyId)); },
    async getEmployee(id, scope) { const item = employee(id); return item && visibleCompany(scope, item.membership.propertyCompanyId) ? item : null; },
    async createEmployee(input) { const user: UserRecord = { ...input.user, id: randomUUID(), lastLoginAt: null, disabledAt: null, createdAt: now(), updatedAt: now() }; const membership: MembershipRecord = { id: randomUUID(), userId: user.id, propertyCompanyId: input.companyId, membershipType: 'PROPERTY_EMPLOYEE', status: 'ACTIVE', joinedAt: now(), leftAt: null, createdAt: now(), updatedAt: now() }; const employee: EmployeeRecord = { ...input.employee, id: randomUUID(), companyMembershipId: membership.id, joinedAt: now(), leftAt: null, createdAt: now(), updatedAt: now() }; state.users.push(user); state.memberships.push(membership); state.employees.push(employee); return { user: copy(user), membership: copy(membership), employee: copy(employee) }; },
    async updateEmployee(id, input, scope) { const item = employee(id); if (!item || !visibleCompany(scope, item.membership.propertyCompanyId)) return null; const user = state.users.find(value => value.id === item.user.id); const profile = state.employees.find(value => value.id === id); if (user) Object.assign(user, { name: input.name ?? user.name, phone: input.phone ?? user.phone, status: input.status ?? user.status, disabledAt: input.status === 'DISABLED' ? now() : input.status === 'ACTIVE' ? null : user.disabledAt, updatedAt: now() }); if (profile) Object.assign(profile, { department: input.department ?? profile.department, position: input.position ?? profile.position, employeeType: input.employeeType ?? profile.employeeType, updatedAt: now() }); return employee(id); },
    async disableEmployee(id, scope) { return this.updateEmployee(id, { status: 'DISABLED' }, scope); },
    async listRoles() { return copy(state.roles); },
    async listPermissions() { return copy(state.permissions); },
    async assignRole(input) { const item: AssignmentRecord = { id: randomUUID(), userId: input.userId, roleId: input.roleId, propertyCompanyId: input.propertyCompanyId || null, communityId: input.communityId || null, createdAt: now(), revokedAt: null }; state.assignments.push(item); return copy(item); },
    async getAssignment(id) { const item = state.assignments.find(value => value.id === id && !value.revokedAt); if (!item) return null; const role = state.roles.find(value => value.id === item.roleId); return role ? { ...copy(item), role: copy(role) } : null; },
    async revokeRole(id) { const item = state.assignments.find(value => value.id === id); if (item) item.revokedAt = now(); },
    async listAssignments(userId) { return copy(state.assignments.filter(item => item.userId === userId && !item.revokedAt).map(item => ({ ...item, role: state.roles.find(role => role.id === item.roleId)! }))); },
    async audit(input) { state.audits.push(copy(input)); }
  };
  return repository;
}

type MemoryState = {
  users: UserRecord[];
  companies: CompanyRecord[];
  communities: CommunityRecord[];
  memberships: MembershipRecord[];
  employees: EmployeeRecord[];
  roles: RoleRecord[];
  permissions: PermissionRecord[];
  rolePermissions: Array<{ roleId: string; permissionId: string }>;
  assignments: AssignmentRecord[];
  sessions: SessionRecord[];
  audits: AuditInput[];
};
