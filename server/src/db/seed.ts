import { and, eq, isNull } from 'drizzle-orm';
import { createConfiguredDb } from './client.js';
import { companyMemberships, communities, permissions, propertyCompanies, rolePermissions, roles, userRoleAssignments, users, employeeProfiles } from './schema/index.js';
import { hashPassword } from '../modules/auth/service.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();
const defaultPassword = env.SEED_ADMIN_PASSWORD;
if (!defaultPassword) throw new Error('SEED_ADMIN_PASSWORD is required for database seed');

const passwords = {
  manager: env.SEED_MANAGER_PASSWORD || defaultPassword,
  engineer: env.SEED_ENGINEER_PASSWORD || defaultPassword,
  bAdmin: env.SEED_B_ADMIN_PASSWORD || defaultPassword
};

const { db, client } = createConfiguredDb();

const roleSeed = [
  ['PLATFORM_ADMIN', '平台管理员', 'PLATFORM'],
  ['PROPERTY_ADMIN', '物业公司管理员', 'COMPANY'],
  ['COMMUNITY_MANAGER', '项目/小区负责人', 'COMMUNITY'],
  ['PROPERTY_STAFF', '物业员工', 'COMMUNITY'],
  ['ENGINEER', '工程员工', 'COMMUNITY']
] as const;

const permissionSeed = [
  ['company:read', '查看物业公司', 'company', 'read'],
  ['community:read', '查看小区', 'community', 'read'],
  ['community:create', '创建小区', 'community', 'create'],
  ['community:update', '修改小区', 'community', 'update'],
  ['community:disable', '停用小区', 'community', 'disable'],
  ['community:write', '管理小区', 'community', 'write'],
  ['employee:read', '查看员工', 'employee', 'read'],
  ['employee:write', '管理员工', 'employee', 'write'],
  ['role:read', '查看角色权限', 'role', 'read'],
  ['access:read', '查看授权', 'access', 'read'],
  ['access:write', '管理授权', 'access', 'write'],
  ['building:read', '查看楼栋', 'building', 'read'],
  ['building:write', '管理楼栋', 'building', 'write'],
  ['house:read', '查看房屋', 'house', 'read'],
  ['house:write', '管理房屋', 'house', 'write'],
  ['person:read', '查看客户', 'person', 'read'],
  ['person:write', '管理客户', 'person', 'write'],
  ['house_relation:read', '查看房屋关系', 'house_relation', 'read'],
  ['house_relation:write', '管理房屋关系', 'house_relation', 'write'],
  ['person:phone:read', '查看完整手机号', 'person', 'phone:read'],
  ['work_order:read', '查看工单', 'work_order', 'read'],
  ['work_order:create', '创建报修工单', 'work_order', 'create'],
  ['work_order:assign', '派发工单', 'work_order', 'assign'],
  ['work_order:transition', '更新工单状态', 'work_order', 'transition'],
  ['work_order:contact:read', '查看工单必要联系人', 'work_order', 'contact:read']
] as const;

const companySeed = [
  { code: 'property-a', name: '物业公司 A' },
  { code: 'property-b', name: '物业公司 B' }
] as const;

const communitySeed = [
  { companyCode: 'property-a', code: 'community-a1', name: '小区 A1' },
  { companyCode: 'property-a', code: 'community-a2', name: '小区 A2' },
  { companyCode: 'property-b', code: 'community-b1', name: '小区 B1' }
] as const;

try {
  await db.transaction(async tx => {
    const companies = new Map<string, any>();
    for (const item of companySeed) {
      const [existing] = await tx.select().from(propertyCompanies).where(eq(propertyCompanies.code, item.code)).limit(1);
      const [row] = existing ? [existing] : await tx.insert(propertyCompanies).values({ ...item, status: 'ACTIVE' }).returning();
      companies.set(item.code, row);
    }

    const communitiesByCode = new Map<string, any>();
    for (const item of communitySeed) {
      const company = companies.get(item.companyCode);
      const [existing] = await tx.select().from(communities).where(and(eq(communities.propertyCompanyId, company.id), eq(communities.code, item.code))).limit(1);
      const [row] = existing ? [existing] : await tx.insert(communities).values({ propertyCompanyId: company.id, code: item.code, name: item.name, status: 'ACTIVE' }).returning();
      communitiesByCode.set(item.code, row);
    }

    const rolesByCode = new Map<string, any>();
    for (const [code, name, scopeType] of roleSeed) {
      const [existing] = await tx.select().from(roles).where(eq(roles.code, code)).limit(1);
      const [row] = existing ? [existing] : await tx.insert(roles).values({ code, name, scopeType }).returning();
      rolesByCode.set(code, row);
    }

    const permissionsByCode = new Map<string, any>();
    for (const [code, name, resource, action] of permissionSeed) {
      const [existing] = await tx.select().from(permissions).where(eq(permissions.code, code)).limit(1);
      const [row] = existing ? [existing] : await tx.insert(permissions).values({ code, name, resource, action }).returning();
      permissionsByCode.set(code, row);
    }

    const permissionCodesByRole: Record<string, string[]> = {
      PROPERTY_ADMIN: permissionSeed.map(item => item[0]),
      COMMUNITY_MANAGER: ['community:read', 'community:update', 'employee:read', 'building:read', 'building:write', 'house:read', 'house:write', 'person:read', 'person:write', 'house_relation:read', 'house_relation:write', 'work_order:read', 'work_order:create', 'work_order:assign', 'work_order:transition', 'work_order:contact:read'],
      PROPERTY_STAFF: ['community:read', 'employee:read', 'building:read', 'house:read', 'person:read', 'house_relation:read', 'work_order:read', 'work_order:create', 'work_order:transition'],
      ENGINEER: ['community:read', 'work_order:read', 'work_order:transition', 'work_order:contact:read']
    };
    for (const [roleCode, codes] of Object.entries(permissionCodesByRole)) {
      const role = rolesByCode.get(roleCode);
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, role.id));
      for (const code of codes) {
        const permission = permissionsByCode.get(code);
        await tx.insert(rolePermissions).values({ roleId: role.id, permissionId: permission.id }).onConflictDoNothing();
      }
    }

    const userSeed = [
      { name: '物业公司 A 管理员', phone: '13800000001', email: 'a-admin@shengbian.local', password: defaultPassword, companyCode: 'property-a', membershipType: 'PROPERTY_ADMIN' as const, roleCode: 'PROPERTY_ADMIN', employeeNo: 'A-ADMIN-001', department: '物业运营', position: '物业公司管理员', employeeType: 'ADMIN', communityCode: null },
      { name: '物业公司 A 项目经理', phone: '13800000002', email: 'a-manager@shengbian.local', password: passwords.manager, companyCode: 'property-a', membershipType: 'PROPERTY_EMPLOYEE' as const, roleCode: 'COMMUNITY_MANAGER', employeeNo: 'A-MANAGER-001', department: '项目管理', position: '项目经理', employeeType: 'MANAGER', communityCode: 'community-a1' },
      { name: '物业公司 A 工程员工', phone: '13800000003', email: 'a-engineer@shengbian.local', password: passwords.engineer, companyCode: 'property-a', membershipType: 'PROPERTY_EMPLOYEE' as const, roleCode: 'ENGINEER', employeeNo: 'A-ENGINEER-001', department: '工程维修', position: '工程员工', employeeType: 'ENGINEER', communityCode: 'community-a1' },
      { name: '物业公司 B 管理员', phone: '13800000004', email: 'b-admin@shengbian.local', password: passwords.bAdmin, companyCode: 'property-b', membershipType: 'PROPERTY_ADMIN' as const, roleCode: 'PROPERTY_ADMIN', employeeNo: 'B-ADMIN-001', department: '物业运营', position: '物业公司管理员', employeeType: 'ADMIN', communityCode: null }
    ];

    for (const item of userSeed) {
      const company = companies.get(item.companyCode);
      const community = item.communityCode ? communitiesByCode.get(item.communityCode) : null;
      const passwordHash = await hashPassword(item.password);
      const [existingUser] = await tx.select().from(users).where(eq(users.phone, item.phone)).limit(1);
      const [user] = existingUser ? [existingUser] : await tx.insert(users).values({ name: item.name, phone: item.phone, email: item.email, passwordHash, status: 'ACTIVE' }).returning();
      const [existingMembership] = await tx.select().from(companyMemberships).where(and(eq(companyMemberships.userId, user.id), eq(companyMemberships.propertyCompanyId, company.id))).limit(1);
      const [membership] = existingMembership ? [existingMembership] : await tx.insert(companyMemberships).values({ userId: user.id, propertyCompanyId: company.id, membershipType: item.membershipType, status: 'ACTIVE' }).returning();
      const [existingEmployee] = await tx.select().from(employeeProfiles).where(eq(employeeProfiles.companyMembershipId, membership.id)).limit(1);
      if (!existingEmployee) await tx.insert(employeeProfiles).values({ companyMembershipId: membership.id, employeeNo: item.employeeNo, department: item.department, position: item.position, employeeType: item.employeeType });
      const role = rolesByCode.get(item.roleCode);
      const assignmentFilter = [eq(userRoleAssignments.userId, user.id), eq(userRoleAssignments.roleId, role.id), eq(userRoleAssignments.propertyCompanyId, company.id), isNull(userRoleAssignments.revokedAt)];
      if (community) assignmentFilter.push(eq(userRoleAssignments.communityId, community.id));
      else assignmentFilter.push(isNull(userRoleAssignments.communityId));
      const [existingAssignment] = await tx.select().from(userRoleAssignments).where(and(...assignmentFilter)).limit(1);
      if (!existingAssignment) await tx.insert(userRoleAssignments).values({ userId: user.id, roleId: role.id, propertyCompanyId: company.id, communityId: community?.id || null });
    }

    console.log('Seeded property-a/property-b, communities A1/A2/B1, and admin/manager/engineer test users.');
  });
} finally {
  await client.end();
}
