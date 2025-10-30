/**
 * ==========================================
 * MULTI-TENANT HELPER
 * ==========================================
 * 
 * This file provides helper functions to work with the tenant-based architecture.
 * 
 * DATABASE STRUCTURE:
 * 
 * SINGLE DATABASE (d-admin):
 *    Collections:
 *    - tenantadmins (ALL Admin accounts with tenantId)
 *    - accounts (ALL accounts with tenantId for isolation)
 *    - admins (ALL admins with tenantId for isolation)
 *    - users (ALL users with tenantId for isolation)
 *    - websites (ALL websites with tenantId for isolation)
 *    - elements (ALL elements with tenantId for isolation)
 *    - aiwebsites (ALL AI websites with tenantId for isolation)
 *    - owners (Owner account)
 *    - ownernotifications (Owner notifications)
 *    - planconfigurations (Plan configs for all SuperAdmins)
 *    - usedaccesskeys (Used registration keys)
 * 
 * TENANT ISOLATION:
 *    - Each Admin has a unique tenantId
 *    - All tenant data includes tenantId field
 *    - Queries MUST filter by tenantId for isolation
 *    - Hostname provides multi-domain support
 * 
 * EXAMPLES:
 * 
 * Example 1: TechCorp Admin
 * - Admin: { tenantId: "tenant_abc123", hostname: "techcorp.d-admin.com" }
 * - Accounts: [{ tenantId: "tenant_abc123", email: "user1@example.com" }, ...]
 * - Websites: [{ tenantId: "tenant_abc123", name: "website1" }, ...]
 * 
 * Example 2: StartupXYZ Admin
 * - Admin: { tenantId: "tenant_def456", hostname: "startupxyz.d-admin.com" }
 * - Accounts: [{ tenantId: "tenant_def456", email: "user3@example.com" }, ...]
 * - Websites: [{ tenantId: "tenant_def456", name: "website3" }, ...]
 * 
 * DATA ISOLATION:
 * ✅ TechCorp cannot see StartupXYZ's data (different tenantId)
 * ✅ StartupXYZ cannot see TechCorp's data (different tenantId)
 * ✅ Complete tenant-level isolation via tenantId filtering
 * ✅ Single database for easier management
 * 
 * ==========================================
 */

import TenantAdmin from '../models/SuperAdmin';
import Account from '../models/Account';
import { connectDB } from './mongodb';

/**
 * Get tenant information for an Admin
 * @param adminId - Admin's MongoDB ObjectId
 * @returns Tenant information (tenantId, hostname, organizationKey)
 */
export async function getAdminTenantInfo(adminId: string) {
    // 1. Connect to main database
    await connectDB();
    
    // 2. Get Admin record from main database
    const admin = await TenantAdmin.findById(adminId);
    if (!admin) {
        throw new Error('Admin not found');
    }
    
    console.log(`✅ Retrieved tenant info for: ${admin.organizationName}`);
    
    return {
        tenantId: admin.tenantId,
        hostname: admin.hostname,
        organizationKey: admin.organizationKey,
        organizationName: admin.organizationName
    };
}

/**
 * Get accounts for a specific tenant
 * @param tenantId - Tenant identifier
 * @returns Query builder for accounts filtered by tenantId
 */
export async function getAccountsForTenant(tenantId: string) {
    await connectDB();
    return Account.find({ tenantId });
}

/**
 * Create an account for a specific tenant
 * @param adminId - Admin's MongoDB ObjectId
 * @param accountData - Account data (without tenantId)
 * @returns Created account
 */
export async function createAccountForTenant(adminId: string, accountData: any) {
    const tenantInfo = await getAdminTenantInfo(adminId);
    await connectDB();
    
    // Create account with tenantId
    const account = await Account.create({
        ...accountData,
        adminId,
        tenantId: tenantInfo.tenantId,
        organizationKey: tenantInfo.organizationKey
    });
    
    console.log(`✅ Created account for tenant: ${tenantInfo.tenantId}`);
    return account;
}

/**
 * Get tenant by hostname
 * @param hostname - Tenant hostname
 * @returns Admin with matching hostname
 */
export async function getTenantByHostname(hostname: string) {
    await connectDB();
    const admin = await TenantAdmin.findOne({ hostname: hostname.toLowerCase(), isActive: true });
    if (!admin) {
        throw new Error(`No tenant found for hostname: ${hostname}`);
    }
    return admin;
}

/**
 * Example usage in API routes:
 * 
 * // In an API route where Admin is creating an account
 * const adminId = req.user.userId; // From auth token
 * 
 * // Create account for this tenant
 * const newAccount = await createAccountForTenant(adminId, {
 *     googleId: '...',
 *     email: 'user@example.com',
 *     name: 'User Name',
 *     plan: 'FREE',
 *     // ... other fields
 * });
 * 
 * // Account is now saved in main database with tenantId
 * 
 * // Query accounts for a tenant
 * const tenantInfo = await getAdminTenantInfo(adminId);
 * const accounts = await Account.find({ tenantId: tenantInfo.tenantId });
 */

/**
 * Get all tenants in the system
 * @returns List of all tenants with their information
 */
export async function getAllTenants() {
    await connectDB();
    
    // Get all Admins
    const admins = await TenantAdmin.find();
    
    return admins.map(admin => ({
        adminId: admin._id.toString(),
        organizationName: admin.organizationName,
        organizationKey: admin.organizationKey,
        tenantId: admin.tenantId,
        hostname: admin.hostname,
        isActive: admin.isActive
    }));
}

const tenantHelper = {
    getAdminTenantInfo,
    getAccountsForTenant,
    createAccountForTenant,
    getTenantByHostname,
    getAllTenants
};

export default tenantHelper;
