/**
 * ==========================================
 * TENANT MANAGEMENT UTILITIES
 * ==========================================
 * 
 * Comprehensive utilities for managing tenants in the system.
 * Provides functions for tenant CRUD operations, validation, and isolation.
 * 
 * KEY FEATURES:
 * - Tenant creation and management
 * - Hostname-based tenant resolution
 * - Data isolation enforcement
 * - Tenant statistics and analytics
 * - Bulk operations with tenant filtering
 * 
 * ==========================================
 */

import TenantAdmin from '../models/SuperAdmin';
import Account from '../models/Account';
import { connectDB } from './mongodb';
import { createTenantFilter, validateTenantFilter } from './tenant-db-connect';

/**
 * Tenant information interface
 */
export interface TenantInfo {
    tenantId: string;
    hostname: string;
    organizationKey: string;
    organizationName: string;
    adminId: string;
    isActive: boolean;
}

/**
 * Get tenant by ID
 * @param tenantId - Tenant identifier
 * @returns Tenant information
 */
export async function getTenantById(tenantId: string): Promise<TenantInfo | null> {
    await connectDB();
    const admin = await TenantAdmin.findOne({ tenantId, isActive: true });
    
    if (!admin) {
        return null;
    }
    
    return {
        tenantId: admin.tenantId,
        hostname: admin.hostname,
        organizationKey: admin.organizationKey,
        organizationName: admin.organizationName,
        adminId: admin._id.toString(),
        isActive: admin.isActive
    };
}

/**
 * Get tenant by hostname
 * @param hostname - Tenant hostname
 * @returns Tenant information
 */
export async function getTenantByHostname(hostname: string): Promise<TenantInfo | null> {
    await connectDB();
    const admin = await TenantAdmin.findOne({ 
        hostname: hostname.toLowerCase(), 
        isActive: true 
    });
    
    if (!admin) {
        return null;
    }
    
    return {
        tenantId: admin.tenantId,
        hostname: admin.hostname,
        organizationKey: admin.organizationKey,
        organizationName: admin.organizationName,
        adminId: admin._id.toString(),
        isActive: admin.isActive
    };
}

/**
 * Get tenant by Admin ID
 * @param adminId - Admin's MongoDB ObjectId
 * @returns Tenant information
 */
export async function getTenantByAdminId(adminId: string): Promise<TenantInfo> {
    await connectDB();
    const admin = await TenantAdmin.findById(adminId);
    
    if (!admin) {
        throw new Error('Admin not found');
    }
    
    return {
        tenantId: admin.tenantId,
        hostname: admin.hostname,
        organizationKey: admin.organizationKey,
        organizationName: admin.organizationName,
        adminId: admin._id.toString(),
        isActive: admin.isActive
    };
}

/**
 * Validate tenant access
 * @param tenantId - Tenant identifier
 * @param adminId - Admin ID attempting access
 * @returns True if access is valid
 */
export async function validateTenantAccess(tenantId: string, adminId: string): Promise<boolean> {
    await connectDB();
    const admin = await TenantAdmin.findById(adminId);
    
    if (!admin) {
        return false;
    }
    
    return admin.tenantId === tenantId && admin.isActive && !admin.isBlocked;
}

/**
 * Get tenant statistics
 * @param tenantId - Tenant identifier
 * @returns Tenant statistics
 */
export async function getTenantStats(tenantId: string) {
    await connectDB();
    
    const [admin, accountCount] = await Promise.all([
        TenantAdmin.findOne({ tenantId }),
        Account.countDocuments({ tenantId })
    ]);
    
    if (!admin) {
        throw new Error('Tenant not found');
    }
    
    // Get plan breakdown
    const planStats = await Account.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);
    
    const planBreakdown = {
        FREE: 0,
        PRO: 0,
        MAX: 0
    };
    
    planStats.forEach(stat => {
        planBreakdown[stat._id as keyof typeof planBreakdown] = stat.count;
    });
    
    return {
        tenantId,
        organizationName: admin.organizationName,
        hostname: admin.hostname,
        totalAccounts: accountCount,
        planBreakdown,
        createdAt: admin.createdAt,
        isActive: admin.isActive
    };
}

/**
 * List all tenants
 * @param options - Query options (limit, skip, filter)
 * @returns List of tenants
 */
export async function listAllTenants(options: {
    limit?: number;
    skip?: number;
    isActive?: boolean;
} = {}) {
    await connectDB();
    
    const filter: any = {};
    if (options.isActive !== undefined) {
        filter.isActive = options.isActive;
    }
    
    const query = TenantAdmin.find(filter)
        .select('tenantId hostname organizationKey organizationName isActive createdAt')
        .sort({ createdAt: -1 });
    
    if (options.limit) {
        query.limit(options.limit);
    }
    
    if (options.skip) {
        query.skip(options.skip);
    }
    
    const tenants = await query.exec();
    
    return tenants.map(tenant => ({
        tenantId: tenant.tenantId,
        hostname: tenant.hostname,
        organizationKey: tenant.organizationKey,
        organizationName: tenant.organizationName,
        superAdminId: tenant._id.toString(),
        isActive: tenant.isActive,
        createdAt: tenant.createdAt
    }));
}

/**
 * Update tenant hostname
 * @param tenantId - Tenant identifier
 * @param newHostname - New hostname
 * @returns Updated tenant
 */
export async function updateTenantHostname(tenantId: string, newHostname: string) {
    await connectDB();
    
    // Check if hostname is already in use
    const existing = await TenantAdmin.findOne({ 
        hostname: newHostname.toLowerCase(),
        tenantId: { $ne: tenantId }
    });
    
    if (existing) {
        throw new Error('Hostname already in use');
    }
    
    const admin = await TenantAdmin.findOneAndUpdate(
        { tenantId },
        { hostname: newHostname.toLowerCase() },
        { new: true }
    );
    
    if (!admin) {
        throw new Error('Tenant not found');
    }
    
    console.log(`✅ Updated hostname for tenant ${tenantId} to ${newHostname}`);
    
    return {
        tenantId: admin.tenantId,
        hostname: admin.hostname,
        organizationName: admin.organizationName
    };
}

/**
 * Deactivate a tenant
 * @param tenantId - Tenant identifier
 * @param reason - Reason for deactivation
 */
export async function deactivateTenant(tenantId: string, reason?: string) {
    await connectDB();
    
    const admin = await TenantAdmin.findOneAndUpdate(
        { tenantId },
        { 
            isActive: false,
            isBlocked: true,
            blockedReason: reason,
            blockedAt: new Date()
        },
        { new: true }
    );
    
    if (!admin) {
        throw new Error('Tenant not found');
    }
    
    console.log(`⚠️ Deactivated tenant: ${tenantId}`);
    
    return admin;
}

/**
 * Reactivate a tenant
 * @param tenantId - Tenant identifier
 */
export async function reactivateTenant(tenantId: string) {
    await connectDB();
    
    const admin = await TenantAdmin.findOneAndUpdate(
        { tenantId },
        { 
            isActive: true,
            isBlocked: false,
            blockedReason: undefined,
            blockedAt: undefined
        },
        { new: true }
    );
    
    if (!admin) {
        throw new Error('Tenant not found');
    }
    
    console.log(`✅ Reactivated tenant: ${tenantId}`);
    
    return admin;
}

/**
 * Get all data for a tenant (for export/backup)
 * @param tenantId - Tenant identifier
 * @returns All tenant data
 */
export async function getTenantData(tenantId: string) {
    await connectDB();
    
    const [admin, accounts] = await Promise.all([
        TenantAdmin.findOne({ tenantId }),
        Account.find({ tenantId })
    ]);
    
    if (!admin) {
        throw new Error('Tenant not found');
    }
    
    return {
        tenant: {
            tenantId: admin.tenantId,
            hostname: admin.hostname,
            organizationKey: admin.organizationKey,
            organizationName: admin.organizationName,
            createdAt: admin.createdAt
        },
        accounts: accounts.map(acc => ({
            email: acc.email,
            name: acc.name,
            plan: acc.plan,
            createdAt: acc.createdAt
        }))
    };
}

/**
 * Check if hostname is available
 * @param hostname - Hostname to check
 * @returns True if available
 */
export async function isHostnameAvailable(hostname: string): Promise<boolean> {
    await connectDB();
    const existing = await TenantAdmin.findOne({ hostname: hostname.toLowerCase() });
    return !existing;
}

const tenantManagement = {
    getTenantById,
    getTenantByHostname,
    getTenantByAdminId,
    validateTenantAccess,
    getTenantStats,
    listAllTenants,
    updateTenantHostname,
    deactivateTenant,
    reactivateTenant,
    getTenantData,
    isHostnameAvailable,
    createTenantFilter,
    validateTenantFilter
};

export default tenantManagement;
