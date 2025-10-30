/**
 * ==========================================
 * TENANT SETUP HELPER
 * ==========================================
 * 
 * Helper functions for setting up new tenants when admins register
 * Handles hostname generation, tenant ID creation, and initial configuration
 * 
 * ==========================================
 */

import crypto from 'crypto';
import Tenant from '../models/Tenant';
import { connectDB } from './mongodb';

/**
 * Generate a unique tenant ID
 * Format: tenant_[random_string]
 */
export function generateTenantId(): string {
    const randomString = crypto.randomBytes(12).toString('hex');
    return `tenant_${randomString}`;
}

/**
 * Generate hostname from organization name
 * Converts "Tech Corp Inc." to "techcorp"
 */
export function generateHostname(organizationName: string): string {
    return organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove special characters
        .substring(0, 20); // Limit length
}

/**
 * Check if hostname is available
 */
export async function isHostnameAvailable(hostname: string): Promise<boolean> {
    await connectDB();
    const existing = await Tenant.findOne({
        $or: [
            { hostname: hostname.toLowerCase() },
            { customDomain: hostname.toLowerCase() }
        ]
    });
    return !existing;
}

/**
 * Generate unique hostname (adds number suffix if needed)
 */
export async function generateUniqueHostname(organizationName: string): Promise<string> {
    let hostname = generateHostname(organizationName);
    let counter = 1;
    
    while (!(await isHostnameAvailable(hostname))) {
        hostname = `${generateHostname(organizationName)}${counter}`;
        counter++;
    }
    
    return hostname;
}

/**
 * Create tenant record for new admin
 */
export async function createTenantForAdmin(params: {
    adminId: string;
    adminEmail: string;
    organizationName: string;
    organizationKey: string;
    plan?: 'free' | 'pro' | 'max';
}) {
    await connectDB();
    
    const { adminId, adminEmail, organizationName, organizationKey, plan = 'free' } = params;
    
    // Generate unique identifiers
    const tenantId = generateTenantId();
    const hostname = await generateUniqueHostname(organizationName);
    
    // Set max users based on plan
    const maxUsers = {
        free: 10,
        pro: 100,
        max: 1000
    }[plan];
    
    // Create tenant record
    const tenant = await Tenant.create({
        tenantId,
        hostname,
        adminId,
        adminEmail,
        organizationName,
        organizationKey,
        isActive: true,
        plan,
        maxUsers,
    });
    
    console.log(`✅ Created tenant: ${tenantId} with hostname: ${hostname}.d-admin.com`);
    
    return {
        tenantId,
        hostname,
        fullHostname: `${hostname}.d-admin.com`,
        tenant,
    };
}

/**
 * Update tenant hostname
 */
export async function updateTenantHostname(tenantId: string, newHostname: string): Promise<boolean> {
    await connectDB();
    
    // Check if new hostname is available
    if (!(await isHostnameAvailable(newHostname))) {
        throw new Error('Hostname already in use');
    }
    
    const result = await Tenant.findOneAndUpdate(
        { tenantId },
        { hostname: newHostname.toLowerCase() },
        { new: true }
    );
    
    return !!result;
}

/**
 * Set custom domain for tenant
 */
export async function setCustomDomain(tenantId: string, customDomain: string): Promise<boolean> {
    await connectDB();
    
    // Check if domain is available
    const existing = await Tenant.findOne({ customDomain: customDomain.toLowerCase() });
    if (existing && existing.tenantId !== tenantId) {
        throw new Error('Custom domain already in use');
    }
    
    const result = await Tenant.findOneAndUpdate(
        { tenantId },
        { customDomain: customDomain.toLowerCase() },
        { new: true }
    );
    
    return !!result;
}

/**
 * Get tenant by hostname (including custom domains)
 */
export async function getTenantByHostname(hostname: string) {
    await connectDB();
    
    const cleanHostname = hostname.toLowerCase().replace('.d-admin.com', '');
    
    const tenant = await Tenant.findOne({
        $or: [
            { hostname: cleanHostname },
            { customDomain: hostname.toLowerCase() }
        ],
        isActive: true,
    });
    
    return tenant;
}

/**
 * Validate tenant access for admin
 */
export async function validateTenantAccess(tenantId: string, adminId: string): Promise<boolean> {
    await connectDB();
    
    const tenant = await Tenant.findOne({
        tenantId,
        adminId,
        isActive: true,
    });
    
    return !!tenant;
}

/**
 * Get tenant statistics
 */
export async function getTenantStats(tenantId: string) {
    await connectDB();
    
    const Account = (await import('../models/Account')).default;
    
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return null;
    
    // Count accounts by plan
    const accountStats = await Account.aggregate([
        { $match: { tenantId } },
        { $group: {
            _id: '$plan',
            count: { $sum: 1 }
        }}
    ]);
    
    const totalAccounts = await Account.countDocuments({ tenantId });
    
    return {
        tenantId,
        hostname: tenant.hostname,
        organizationName: tenant.organizationName,
        plan: tenant.plan,
        maxUsers: tenant.maxUsers,
        totalAccounts,
        accountsByPlan: accountStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
        }, {} as Record<string, number>),
        usagePercentage: (totalAccounts / tenant.maxUsers) * 100,
    };
}

const tenantSetupHelper = {
    generateTenantId,
    generateHostname,
    generateUniqueHostname,
    createTenantForAdmin,
    updateTenantHostname,
    setCustomDomain,
    getTenantByHostname,
    validateTenantAccess,
    getTenantStats,
};

export default tenantSetupHelper;
