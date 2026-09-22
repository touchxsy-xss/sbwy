export type Status = 'ACTIVE' | 'DISABLED' | 'INVITED';
export type ScopeType = 'PLATFORM' | 'COMPANY' | 'COMMUNITY';

export type UserRecord = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  passwordHash: string;
  status: Status;
  lastLoginAt: Date | null;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyRecord = { id: string; code: string; name: string; status: Status; disabledAt: Date | null; createdAt: Date; updatedAt: Date };
export type CommunityRecord = { id: string; propertyCompanyId: string; code: string; name: string; address: string | null; status: Status; disabledAt: Date | null; createdAt: Date; updatedAt: Date };
export type MembershipRecord = { id: string; userId: string; propertyCompanyId: string; membershipType: 'PROPERTY_EMPLOYEE' | 'PROPERTY_ADMIN'; status: Status; joinedAt: Date; leftAt: Date | null; createdAt: Date; updatedAt: Date };
export type EmployeeRecord = { id: string; companyMembershipId: string; employeeNo: string; department: string | null; position: string | null; employeeType: string | null; joinedAt: Date; leftAt: Date | null; createdAt: Date; updatedAt: Date };
export type RoleRecord = { id: string; code: string; name: string; scopeType: ScopeType; createdAt: Date; updatedAt: Date };
export type PermissionRecord = { id: string; code: string; name: string; resource: string; action: string; createdAt: Date; updatedAt: Date };
export type AssignmentRecord = { id: string; userId: string; roleId: string; propertyCompanyId: string | null; communityId: string | null; createdAt: Date; revokedAt: Date | null };
export type SessionRecord = { id: string; userId: string; tokenHash: string; activePropertyCompanyId: string | null; expiresAt: Date; lastSeenAt: Date; revokedAt: Date | null; userAgent: string | null; ipHash: string | null; createdAt: Date };

export type Scope = {
  userId: string;
  platform: boolean;
  companyWide: boolean;
  companyIds: string[];
  communityIds: string[];
  roles: string[];
  permissions: string[];
  activePropertyCompanyId: string | null;
};

export type AuditInput = {
  propertyCompanyId?: string | null;
  communityId?: string | null;
  actorUserId?: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  requestId?: string;
  beforeData?: unknown;
  afterData?: unknown;
  ipHash?: string | null;
  userAgent?: string | null;
};

export interface Repository {
  findUserByPhone(phone: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  hasCompanyMembership(userId: string, propertyCompanyId: string): Promise<boolean>;
  getCommunityCompanyId(communityId: string): Promise<string | null>;
  updateUserLastLogin(id: string): Promise<void>;
  createSession(input: Omit<SessionRecord, 'createdAt' | 'lastSeenAt' | 'revokedAt'>): Promise<SessionRecord>;
  findActiveSession(tokenHash: string): Promise<SessionRecord | null>;
  touchSession(id: string): Promise<void>;
  revokeSession(id: string): Promise<void>;
  listSessions(userId: string): Promise<SessionRecord[]>;
  scopeForUser(userId: string, activeCompanyId?: string | null): Promise<Scope>;
  listCompanies(scope: Scope): Promise<CompanyRecord[]>;
  getCompany(id: string, scope: Scope): Promise<CompanyRecord | null>;
  createCompany(input: { code: string; name: string }): Promise<CompanyRecord>;
  listCommunities(scope: Scope): Promise<CommunityRecord[]>;
  getCommunity(id: string, scope: Scope): Promise<CommunityRecord | null>;
  createCommunity(input: { propertyCompanyId: string; code: string; name: string; address?: string | null }): Promise<CommunityRecord>;
  updateCommunity(id: string, input: { name?: string; address?: string | null }, scope: Scope): Promise<CommunityRecord | null>;
  disableCommunity(id: string, scope: Scope): Promise<CommunityRecord | null>;
  listEmployees(scope: Scope): Promise<Array<EmployeeRecord & { user: UserRecord; membership: MembershipRecord }>>;
  getEmployee(id: string, scope: Scope): Promise<(EmployeeRecord & { user: UserRecord; membership: MembershipRecord }) | null>;
  createEmployee(input: { companyId: string; user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'disabledAt'>; employee: Omit<EmployeeRecord, 'id' | 'companyMembershipId' | 'createdAt' | 'updatedAt' | 'joinedAt' | 'leftAt'> }): Promise<{ user: UserRecord; membership: MembershipRecord; employee: EmployeeRecord }>;
  updateEmployee(id: string, input: { name?: string; phone?: string | null; status?: Status; department?: string | null; position?: string | null; employeeType?: string | null }, scope: Scope): Promise<(EmployeeRecord & { user: UserRecord; membership: MembershipRecord }) | null>;
  disableEmployee(id: string, scope: Scope): Promise<(EmployeeRecord & { user: UserRecord; membership: MembershipRecord }) | null>;
  listRoles(): Promise<RoleRecord[]>;
  listPermissions(): Promise<PermissionRecord[]>;
  assignRole(input: { userId: string; roleId: string; propertyCompanyId?: string | null; communityId?: string | null }): Promise<AssignmentRecord>;
  getAssignment(id: string): Promise<(AssignmentRecord & { role: RoleRecord }) | null>;
  revokeRole(id: string): Promise<void>;
  listAssignments(userId: string): Promise<Array<AssignmentRecord & { role: RoleRecord }>>;
  audit(input: AuditInput): Promise<void>;
}
