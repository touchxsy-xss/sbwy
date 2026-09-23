import { relations } from 'drizzle-orm';
import { boolean, check, date, index, integer, jsonb, numeric, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const statusEnum = pgEnum('record_status', ['ACTIVE', 'DISABLED', 'INVITED']);
export const membershipTypeEnum = pgEnum('membership_type', ['PROPERTY_EMPLOYEE', 'PROPERTY_ADMIN']);
export const scopeTypeEnum = pgEnum('scope_type', ['PLATFORM', 'COMPANY', 'COMMUNITY']);
export const accessTypeEnum = pgEnum('access_type', ['READ', 'OPERATE', 'ADMIN']);
export const buildingStatusEnum = pgEnum('building_status', ['ACTIVE', 'INACTIVE']);
export const houseStatusEnum = pgEnum('house_status', ['ACTIVE', 'RENOVATING', 'INACTIVE']);
export const personStatusEnum = pgEnum('person_status', ['ACTIVE', 'DISABLED']);
export const genderEnum = pgEnum('person_gender', ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']);
export const relationshipTypeEnum = pgEnum('house_relationship_type', ['OWNER', 'TENANT', 'FAMILY_MEMBER', 'OCCUPANT']);
export const verificationStatusEnum = pgEnum('relationship_verification_status', ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
};

export const propertyCompanies = pgTable('property_companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').default('ACTIVE').notNull(),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps
}, table => ({ codeUnique: uniqueIndex('property_companies_code_uq').on(table.code) }));

export const communities = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyCompanyId: uuid('property_company_id').notNull().references(() => propertyCompanies.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  address: text('address'),
  status: statusEnum('status').default('ACTIVE').notNull(),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps
}, table => ({ companyCodeUnique: uniqueIndex('communities_company_code_uq').on(table.propertyCompanyId, table.code), companyIndex: index('communities_company_idx').on(table.propertyCompanyId) }));

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  passwordHash: text('password_hash').notNull(),
  status: statusEnum('status').default('ACTIVE').notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps
}, table => ({ phoneUnique: uniqueIndex('users_phone_uq').on(table.phone), emailUnique: uniqueIndex('users_email_uq').on(table.email) }));

export const companyMemberships = pgTable('company_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  propertyCompanyId: uuid('property_company_id').notNull().references(() => propertyCompanies.id),
  membershipType: membershipTypeEnum('membership_type').notNull(),
  status: statusEnum('status').default('ACTIVE').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  ...timestamps
}, table => ({ userCompanyUnique: uniqueIndex('company_memberships_user_company_uq').on(table.userId, table.propertyCompanyId), companyIndex: index('company_memberships_company_idx').on(table.propertyCompanyId) }));

export const employeeProfiles = pgTable('employee_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyMembershipId: uuid('company_membership_id').notNull().references(() => companyMemberships.id),
  employeeNo: text('employee_no').notNull(),
  department: text('department'),
  position: text('position'),
  employeeType: text('employee_type'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  leftAt: timestamp('left_at', { withTimezone: true }),
  ...timestamps
}, table => ({ membershipUnique: uniqueIndex('employee_profiles_membership_uq').on(table.companyMembershipId) }));

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  scopeType: scopeTypeEnum('scope_type').notNull(),
  ...timestamps
}, table => ({ codeUnique: uniqueIndex('roles_code_uq').on(table.code) }));

export const permissions = pgTable('permissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  ...timestamps
}, table => ({ codeUnique: uniqueIndex('permissions_code_uq').on(table.code) }));

export const rolePermissions = pgTable('role_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, table => ({ pk: primaryKey({ columns: [table.roleId, table.permissionId] }) }));

export const userRoleAssignments = pgTable('user_role_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  roleId: uuid('role_id').notNull().references(() => roles.id),
  propertyCompanyId: uuid('property_company_id').references(() => propertyCompanies.id),
  communityId: uuid('community_id').references(() => communities.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true })
}, table => ({ userIndex: index('user_role_assignments_user_idx').on(table.userId), companyIndex: index('user_role_assignments_company_idx').on(table.propertyCompanyId), communityIndex: index('user_role_assignments_community_idx').on(table.communityId) }));

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tokenHash: text('token_hash').notNull(),
  activePropertyCompanyId: uuid('active_property_company_id').references(() => propertyCompanies.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  userAgent: text('user_agent'),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, table => ({ tokenUnique: uniqueIndex('sessions_token_hash_uq').on(table.tokenHash), userIndex: index('sessions_user_idx').on(table.userId) }));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyCompanyId: uuid('property_company_id').references(() => propertyCompanies.id),
  communityId: uuid('community_id').references(() => communities.id),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  requestId: text('request_id'),
  beforeData: jsonb('before_data'),
  afterData: jsonb('after_data'),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, table => ({ actorIndex: index('audit_logs_actor_idx').on(table.actorUserId), tenantIndex: index('audit_logs_tenant_idx').on(table.propertyCompanyId, table.communityId), actionIndex: index('audit_logs_action_idx').on(table.action) }));

export const buildings = pgTable('buildings', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull().references(() => communities.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  displayName: text('display_name'),
  legacyCode: text('legacy_code'),
  status: buildingStatusEnum('status').default('ACTIVE').notNull(),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps
}, table => ({
  communityCodeUnique: uniqueIndex('buildings_community_code_uq').on(table.communityId, table.code),
  communityIndex: index('buildings_community_idx').on(table.communityId)
}));

export const buildingUnits = pgTable('building_units', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildingId: uuid('building_id').notNull().references(() => buildings.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  displayName: text('display_name'),
  status: buildingStatusEnum('status').default('ACTIVE').notNull(),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps
}, table => ({
  buildingCodeUnique: uniqueIndex('building_units_building_code_uq').on(table.buildingId, table.code),
  buildingIndex: index('building_units_building_idx').on(table.buildingId),
  idBuildingUnique: uniqueIndex('building_units_id_building_uq').on(table.id, table.buildingId)
}));

export const houses = pgTable('houses', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildingId: uuid('building_id').notNull().references(() => buildings.id),
  buildingUnitId: uuid('building_unit_id'),
  code: text('code').notNull(),
  floor: integer('floor'),
  buildingArea: numeric('building_area', { precision: 10, scale: 2 }),
  usableArea: numeric('usable_area', { precision: 10, scale: 2 }),
  displayName: text('display_name'),
  legacyCode: text('legacy_code'),
  status: houseStatusEnum('status').default('ACTIVE').notNull(),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps
}, table => ({
  buildingIndex: index('houses_building_idx').on(table.buildingId),
  unitIndex: index('houses_unit_idx').on(table.buildingUnitId),
  buildingAreaPositive: check('houses_building_area_positive', sql`${table.buildingArea} IS NULL OR ${table.buildingArea} > 0`),
  usableAreaPositive: check('houses_usable_area_positive', sql`${table.usableArea} IS NULL OR ${table.usableArea} > 0`)
}));

export const people = pgTable('people', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyCompanyId: uuid('property_company_id').notNull().references(() => propertyCompanies.id),
  userId: uuid('user_id').references(() => users.id),
  name: text('name').notNull(),
  phone: text('phone'),
  gender: genderEnum('gender'),
  status: personStatusEnum('status').default('ACTIVE').notNull(),
  disabledAt: timestamp('disabled_at', { withTimezone: true }),
  ...timestamps
}, table => ({
  companyIndex: index('people_company_idx').on(table.propertyCompanyId),
  userIndex: index('people_user_idx').on(table.userId),
  companyUserUnique: uniqueIndex('people_company_user_uq').on(table.propertyCompanyId, table.userId).where(sql`${table.userId} IS NOT NULL`)
}));

export const housePersonRelationships = pgTable('house_person_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  houseId: uuid('house_id').notNull().references(() => houses.id),
  personId: uuid('person_id').notNull().references(() => people.id),
  relationshipType: relationshipTypeEnum('relationship_type').notNull(),
  ownershipShare: numeric('ownership_share', { precision: 5, scale: 2 }),
  isPrimaryContact: boolean('is_primary_contact').default(false).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  verificationStatus: verificationStatusEnum('verification_status').default('UNVERIFIED').notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id),
  verificationNote: text('verification_note'),
  ...timestamps
}, table => ({
  houseIndex: index('house_person_relationships_house_idx').on(table.houseId),
  personIndex: index('house_person_relationships_person_idx').on(table.personId),
  endAfterStart: check('house_person_relationships_date_order', sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`),
  ownerShareOnly: check('house_person_relationships_owner_share', sql`(${table.relationshipType} = 'OWNER' OR ${table.ownershipShare} IS NULL) AND (${table.ownershipShare} IS NULL OR (${table.ownershipShare} > 0 AND ${table.ownershipShare} <= 100))`),
  reviewFields: check('house_person_relationships_review_fields', sql`(${table.verificationStatus} IN ('UNVERIFIED', 'PENDING') AND ${table.reviewedAt} IS NULL AND ${table.reviewedByUserId} IS NULL) OR (${table.verificationStatus} IN ('VERIFIED', 'REJECTED') AND ${table.reviewedAt} IS NOT NULL AND ${table.reviewedByUserId} IS NOT NULL)`)
}));

export const usersRelations = relations(users, ({ many }) => ({ memberships: many(companyMemberships), sessions: many(sessions), roleAssignments: many(userRoleAssignments) }));
export const propertyCompaniesRelations = relations(propertyCompanies, ({ many }) => ({ communities: many(communities), memberships: many(companyMemberships), sessions: many(sessions) }));
export const communitiesRelations = relations(communities, ({ one, many }) => ({ company: one(propertyCompanies, { fields: [communities.propertyCompanyId], references: [propertyCompanies.id] }), roleAssignments: many(userRoleAssignments) }));
export const companyMembershipsRelations = relations(companyMemberships, ({ one }) => ({ user: one(users, { fields: [companyMemberships.userId], references: [users.id] }), company: one(propertyCompanies, { fields: [companyMemberships.propertyCompanyId], references: [propertyCompanies.id] }) }));

export const schema = { propertyCompanies, communities, users, companyMemberships, employeeProfiles, roles, permissions, rolePermissions, userRoleAssignments, sessions, auditLogs, buildings, buildingUnits, houses, people, housePersonRelationships };
