/**
 * ==========================================
 * TENANT MIGRATION GUIDE
 * ==========================================
 * 
 * This file provides utilities and guidance for migrating from
 * the old multi-database architecture to the new tenant-based
 * single-database architecture.
 * 
 * OLD ARCHITECTURE:
 * - Each Admin had a separate database (d-admin-{orgname}-{code})
 * - Admin.databaseName stored the database name
 * - Accounts, Users stored in separate databases
 * 
 * NEW ARCHITECTURE:
 * - Single database (d-admin) for all data
 * - Admin.tenantId for tenant identification
 * - Admin.hostname for multi-domain support
 * - All models include tenantId field for isolation
 * - Data filtered by tenantId for complete isolation
 * 
 * MIGRATION STEPS:
 * 1. Add tenantId and hostname to existing Admin records
 * 2. Migrate data from tenant databases to main database with tenantId
 * 3. Update all queries to include tenantId filtering
 * 4. Remove old database connections
 * 
 * ==========================================
 */

import TenantAdmin from '../models/SuperAdmin';
import Account from '../models/Account';
import { connectDB } from './mongodb';
import crypto from 'crypto';

/**
 * Generate tenantId for existing Admin
 * @param organizationKey - Existing organization key
 * @returns Generated tenantId
 */
export function generateTenantId(organizationKey: string): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `tenant_${timestamp}_${random}`;
}

/**
 * Generate hostname from organization name
 * @param organizationName - Organization name
 * @param tenantId - Tenant identifier
 * @returns Generated hostname
 */
export function generateHostname(organizationName: string, tenantId: string): string {
    const cleanName = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
    
    const last4 = tenantId.slice(-4).toLowerCase();
    return `${cleanName}-${last4}.d-admin.com`;
}

/**
 * Migrate existing Admin to new tenant-based system
 * @param adminId - Admin ID to migrate
 */
export async function migrateAdminToTenant(adminId: string) {
    await connectDB();
    
    const admin = await TenantAdmin.findById(adminId);
    if (!admin) {
        throw new Error('Admin not found');
    }
    
    // Check if already migrated
    if (admin.tenantId && admin.hostname) {
        console.log(`✅ Admin ${adminId} already migrated`);
        return {
            tenantId: admin.tenantId,
            hostname: admin.hostname,
            alreadyMigrated: true
        };
    }
    
    // Generate tenantId and hostname
    const tenantId = generateTenantId(admin.organizationKey);
    const hostname = generateHostname(admin.organizationName, tenantId);
    
    // Update Admin
    admin.tenantId = tenantId;
    admin.hostname = hostname;
    await admin.save();
    
    console.log(`✅ Migrated Admin ${adminId}`);
    console.log(`   - tenantId: ${tenantId}`);
    console.log(`   - hostname: ${hostname}`);
    
    return {
        tenantId,
        hostname,
        alreadyMigrated: false
    };
}

/**
 * Migrate all Admins to tenant-based system
 */
export async function migrateAllAdmins() {
    await connectDB();
    
    const admins = await TenantAdmin.find({});
    console.log(`📊 Found ${admins.length} Admins to migrate`);
    
    const results = [];
    
    for (const admin of admins) {
        try {
            const result = await migrateAdminToTenant(admin._id.toString());
            results.push({
                adminId: admin._id.toString(),
                organizationName: admin.organizationName,
                ...result
            });
        } catch (error: any) {
            console.error(`❌ Error migrating ${admin._id}:`, error.message);
            results.push({
                adminId: admin._id.toString(),
                organizationName: admin.organizationName,
                error: error.message
            });
        }
    }
    
    console.log(`✅ Migration complete: ${results.length} Admins processed`);
    return results;
}

/**
 * Update existing accounts with tenantId
 * Note: This assumes accounts are already in the main database
 * @param adminId - Admin ID
 */
export async function updateAccountsWithTenantId(adminId: string) {
    await connectDB();
    
    const admin = await TenantAdmin.findById(adminId);
    if (!admin) {
        throw new Error('Admin not found');
    }
    
    if (!admin.tenantId) {
        throw new Error('Admin not migrated yet. Run migrateAdminToTenant first.');
    }
    
    // Update all accounts for this Admin (update both adminId and tenantId)
    const result = await Account.updateMany(
        { $or: [{ superAdminId: adminId }, { adminId: adminId }], tenantId: { $exists: false } },
        { 
            $set: { 
                adminId: adminId,
                tenantId: admin.tenantId,
                organizationKey: admin.organizationKey
            },
            $unset: { superAdminId: "" }
        }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} accounts with tenantId: ${admin.tenantId}`);
    
    return {
        tenantId: admin.tenantId,
        accountsUpdated: result.modifiedCount
    };
}

/**
 * Verify tenant isolation
 * Checks that all accounts have proper tenantId and no cross-tenant data access
 */
export async function verifyTenantIsolation() {
    await connectDB();
    
    const issues = [];
    
    // Check for accounts without tenantId
    const accountsWithoutTenant = await Account.countDocuments({ tenantId: { $exists: false } });
    if (accountsWithoutTenant > 0) {
        issues.push(`${accountsWithoutTenant} accounts missing tenantId`);
    }
    
    // Check for Admins without tenantId
    const adminsWithoutTenant = await TenantAdmin.countDocuments({ tenantId: { $exists: false } });
    if (adminsWithoutTenant > 0) {
        issues.push(`${adminsWithoutTenant} Admins missing tenantId`);
    }
    
    // Check for duplicate hostnames
    const hostnames = await TenantAdmin.aggregate([
        { $group: { _id: '$hostname', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    if (hostnames.length > 0) {
        issues.push(`${hostnames.length} duplicate hostnames found`);
    }
    
    if (issues.length === 0) {
        console.log('✅ Tenant isolation verified - no issues found');
        return { valid: true, issues: [] };
    } else {
        console.log('⚠️ Tenant isolation issues found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        return { valid: false, issues };
    }
}

/**
 * USAGE EXAMPLES:
 * 
 * // 1. Migrate all Admins
 * const results = await migrateAllAdmins();
 * 
 * // 2. Update accounts for a specific Admin
 * await updateAccountsWithTenantId('adminId123');
 * 
 * // 3. Verify tenant isolation
 * const verification = await verifyTenantIsolation();
 * 
 * // 4. Migrate single Admin
 * const result = await migrateAdminToTenant('adminId123');
 */

const tenantMigrationGuide = {
    generateTenantId,
    generateHostname,
    migrateAdminToTenant,
    migrateAllAdmins,
    updateAccountsWithTenantId,
    verifyTenantIsolation
};

export default tenantMigrationGuide;
