import { eq } from 'drizzle-orm';
import { createConfiguredDb } from './client.js';
import { companyMemberships, communities, permissions, propertyCompanies, rolePermissions, roles, userRoleAssignments, users, employeeProfiles } from './schema/index.js';
import { hashPassword } from '../modules/auth/service.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();
const password = env.SEED_ADMIN_PASSWORD;
if (!password) throw new Error('SEED_ADMIN_PASSWORD is required for database seed');
const { db, client } = createConfiguredDb();
const roleSeed = [
  ['PLATFORM_ADMIN', '平台管理员', 'PLATFORM'],
  ['PROPERTY_ADMIN', '物业公司管理员', 'COMPANY'],
  ['COMMUNITY_MANAGER', '项目/小区负责人', 'COMMUNITY'],
  ['PROPERTY_STAFF', '物业员工', 'COMMUNITY'],
  ['ENGINEER', '工程员工', 'COMMUNITY']
] as const;
const permissionSeed = [
  ['company:read', '查看物业公司', 'company', 'read'], ['community:read', '查看小区', 'community', 'read'], ['community:write', '管理小区', 'community', 'write'],
  ['employee:read', '查看员工', 'employee', 'read'], ['employee:write', '管理员工', 'employee', 'write'], ['role:read', '查看角色权限', 'role', 'read'], ['access:read', '查看授权', 'access', 'read'], ['access:write', '管理授权', 'access', 'write']
] as const;

try {
  await db.transaction(async tx => {
    const [company] = await tx.insert(propertyCompanies).values({ code: 'shengbian-demo', name: '声边演示物业', status: 'ACTIVE' }).onConflictDoNothing({ target: propertyCompanies.code }).returning();
    const companyRow = company || (await tx.select().from(propertyCompanies).where(eq(propertyCompanies.code, 'shengbian-demo')).limit(1))[0];
    const [community] = await tx.insert(communities).values({ propertyCompanyId: companyRow.id, code: 'pengyi', name: '彭一小区', address: '上海市示范地址', status: 'ACTIVE' }).onConflictDoNothing().returning();
    const communityRow = community || (await tx.select().from(communities).where(eq(communities.code, 'pengyi')).limit(1))[0];
    const roleRows = [] as any[];
    for (const [code, name, scopeType] of roleSeed) {
      const [row] = await tx.insert(roles).values({ code, name, scopeType }).onConflictDoNothing({ target: roles.code }).returning();
      roleRows.push(row || (await tx.select().from(roles).where(eq(roles.code, code)).limit(1))[0]);
    }
    const permissionRows = [] as any[];
    for (const [code, name, resource, action] of permissionSeed) {
      const [row] = await tx.insert(permissions).values({ code, name, resource, action }).onConflictDoNothing({ target: permissions.code }).returning();
      permissionRows.push(row || (await tx.select().from(permissions).where(eq(permissions.code, code)).limit(1))[0]);
    }
    const propertyAdmin = roleRows.find(row => row.code === 'PROPERTY_ADMIN');
    for (const permission of permissionRows) await tx.insert(rolePermissions).values({ roleId: propertyAdmin.id, permissionId: permission.id }).onConflictDoNothing();
    const passwordHash = await hashPassword(password);
    const [user] = await tx.insert(users).values({ name: '李明', phone: '13800000001', email: 'admin@shengbian.local', passwordHash, status: 'ACTIVE' }).onConflictDoNothing({ target: users.phone }).returning();
    const userRow = user || (await tx.select().from(users).where(eq(users.phone, '13800000001')).limit(1))[0];
    const [membership] = await tx.insert(companyMemberships).values({ userId: userRow.id, propertyCompanyId: companyRow.id, membershipType: 'PROPERTY_ADMIN', status: 'ACTIVE' }).onConflictDoNothing().returning();
    const membershipRow = membership || (await tx.select().from(companyMemberships).where(eq(companyMemberships.userId, userRow.id)).limit(1))[0];
    await tx.insert(employeeProfiles).values({ companyMembershipId: membershipRow.id, employeeNo: 'SB-ADMIN-001', department: '物业运营', position: '物业高级主管', employeeType: 'ADMIN' }).onConflictDoNothing();
    await tx.insert(userRoleAssignments).values({ userId: userRow.id, roleId: propertyAdmin.id, propertyCompanyId: companyRow.id }).onConflictDoNothing();
    console.log(`Seeded company ${companyRow.code}, community ${communityRow.code}, admin ${userRow.phone}.`);
  });
} finally {
  await client.end();
}
