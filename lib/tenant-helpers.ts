/**
 * ==========================================
 * TENANT ISOLATION HELPERS
 * ==========================================
 * 
 * Database query helpers that enforce tenant isolation
 * Based on Owner → Admin → Account hierarchy
 */

import { AuthPayload, UserRole } from './unified-auth';
import { FilterQuery } from 'mongoose';

// ==========================================
// TENANT FILTER BUILDERS
// ==========================================

/**
 * Build MongoDB filter with tenant isolation
 * Owner: No filter (access all data)
 * Admin: Filter by tenantId
 * Account: Filter by tenantId and optionally accountId
 */
export function buildTenantFilter<T = any>(
    user: AuthPayload,
    baseFilter: FilterQuery<T> = {}
): FilterQuery<T> {
    // Owner has access to all data
    if (user.role === 'owner') {
        return baseFilter;
    }
    
    // Admin: Filter by their tenantId
    if (user.role === 'admin') {
        return {
            ...baseFilter,
            tenantId: user.tenantId,
        } as FilterQuery<T>;
    }
    
    // Account: Filter by their tenantId
    if (user.role === 'account') {
        return {
            ...baseFilter,
            tenantId: user.tenantId,
        } as FilterQuery<T>;
    }
    
    // Fallback: No access
    return {
        ...baseFilter,
        _id: { $exists: false }, // Match nothing
    } as FilterQuery<T>;
}

/**
 * Build filter for accounts belonging to an admin
 * Owner: Access all accounts
 * Admin: Access only their accounts
 * Account: Access only their own account
 */
export function buildAccountFilter(
    user: AuthPayload,
    accountId?: string
): FilterQuery<any> {
    if (user.role === 'owner') {
        return accountId ? { _id: accountId } : {};
    }
    
    if (user.role === 'admin') {
        const filter: any = { adminId: user.userId, tenantId: user.tenantId };
        if (accountId) filter._id = accountId;
        return filter;
    }
    
    if (user.role === 'account') {
        // Accounts can only access their own data
        return { _id: user.userId };
    }
    
    return { _id: { $exists: false } };
}

/**
 * Build filter for admins
 * Owner: Access all admins
 * Admin: Access only themselves
 * Account: No access
 */
export function buildAdminFilter(
    user: AuthPayload,
    adminId?: string
): FilterQuery<any> {
    if (user.role === 'owner') {
        return adminId ? { _id: adminId } : {};
    }
    
    if (user.role === 'admin') {
        return { _id: user.userId };
    }
    
    // Accounts cannot access admin data
    return { _id: { $exists: false } };
}

// ==========================================
// PERMISSION CHECKERS
// ==========================================

/**
 * Check if user can manage admins
 */
export function canManageAdmins(user: AuthPayload): boolean {
    return user.role === 'owner';
}

/**
 * Check if user can manage accounts
 */
export function canManageAccounts(user: AuthPayload): boolean {
    return user.role === 'owner' || user.role === 'admin';
}

/**
 * Check if user can view specific admin
 */
export function canViewAdmin(user: AuthPayload, adminId: string): boolean {
    if (user.role === 'owner') return true;
    if (user.role === 'admin') return user.userId === adminId;
    return false;
}

/**
 * Check if user can view specific account
 */
export function canViewAccount(user: AuthPayload, accountId: string, accountTenantId?: string): boolean {
    if (user.role === 'owner') return true;
    if (user.role === 'admin') {
        return accountTenantId ? user.tenantId === accountTenantId : true;
    }
    if (user.role === 'account') return user.userId === accountId;
    return false;
}

/**
 * Check if user can modify specific account
 */
export function canModifyAccount(user: AuthPayload, accountId: string, accountTenantId?: string): boolean {
    if (user.role === 'owner') return true;
    if (user.role === 'admin') {
        return accountTenantId ? user.tenantId === accountTenantId : true;
    }
    if (user.role === 'account') return user.userId === accountId;
    return false;
}

/**
 * Check if user can delete specific account
 */
export function canDeleteAccount(user: AuthPayload, accountId: string, accountTenantId?: string): boolean {
    if (user.role === 'owner') return true;
    if (user.role === 'admin') {
        return accountTenantId ? user.tenantId === accountTenantId : true;
    }
    // Accounts cannot delete themselves
    return false;
}

// ==========================================
// DATA VALIDATION
// ==========================================

/**
 * Validate that data being created belongs to user's tenant
 */
export function validateTenantData(user: AuthPayload, data: any): { valid: boolean; error?: string } {
    // Owner can create data for any tenant
    if (user.role === 'owner') {
        return { valid: true };
    }
    
    // Admin can only create data for their tenant
    if (user.role === 'admin') {
        if (data.tenantId && data.tenantId !== user.tenantId) {
            return {
                valid: false,
                error: 'Cannot create data for different tenant',
            };
        }
        return { valid: true };
    }
    
    // Account can only create data for their tenant
    if (user.role === 'account') {
        if (data.tenantId && data.tenantId !== user.tenantId) {
            return {
                valid: false,
                error: 'Cannot create data for different tenant',
            };
        }
        if (data.adminId && data.adminId !== user.adminId) {
            return {
                valid: false,
                error: 'Cannot create data for different admin',
            };
        }
        return { valid: true };
    }
    
    return { valid: false, error: 'Invalid user role' };
}

/**
 * Enrich data with tenant information before saving
 */
export function enrichWithTenantData(user: AuthPayload, data: any): any {
    const enriched = { ...data };
    
    if (user.role === 'admin') {
        enriched.tenantId = user.tenantId;
        enriched.adminId = user.userId;
        enriched.organizationKey = user.organizationKey;
    }
    
    if (user.role === 'account') {
        enriched.tenantId = user.tenantId;
        enriched.adminId = user.adminId;
    }
    
    return enriched;
}

// ==========================================
// QUERY HELPERS
// ==========================================

/**
 * Get all accounts for a user's scope
 */
export function getAccountsQuery(user: AuthPayload, filters: any = {}) {
    return buildTenantFilter(user, {
        role: 'account',
        ...filters,
    });
}

/**
 * Get all admins for a user's scope
 */
export function getAdminsQuery(user: AuthPayload, filters: any = {}) {
    if (user.role === 'owner') {
        return {
            role: 'admin',
            ...filters,
        };
    }
    
    if (user.role === 'admin') {
        return {
            _id: user.userId,
            role: 'admin',
            ...filters,
        };
    }
    
    // Accounts cannot query admins
    return { _id: { $exists: false } };
}

/**
 * Get statistics query with tenant isolation
 */
export function getStatsQuery(user: AuthPayload) {
    if (user.role === 'owner') {
        return {}; // All data
    }
    
    if (user.role === 'admin') {
        return { tenantId: user.tenantId };
    }
    
    if (user.role === 'account') {
        return { tenantId: user.tenantId, _id: user.userId };
    }
    
    return { _id: { $exists: false } };
}

// ==========================================
// HOSTNAME HELPERS
// ==========================================

/**
 * Extract hostname from request URL
 */
export function extractHostname(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        // Check if first path segment looks like a hostname
        if (pathParts.length > 0 && pathParts[0].includes('-')) {
            return pathParts[0];
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Validate hostname matches user's tenant
 */
export function validateHostname(user: AuthPayload, hostname: string): boolean {
    if (user.role === 'owner') return true;
    if (user.role === 'admin') return user.hostname === hostname;
    return false;
}

// ==========================================
// EXPORT UTILITIES
// ==========================================

export const tenantHelpers = {
    // Filters
    buildTenantFilter,
    buildAccountFilter,
    buildAdminFilter,
    
    // Permissions
    canManageAdmins,
    canManageAccounts,
    canViewAdmin,
    canViewAccount,
    canModifyAccount,
    canDeleteAccount,
    
    // Validation
    validateTenantData,
    enrichWithTenantData,
    
    // Queries
    getAccountsQuery,
    getAdminsQuery,
    getStatsQuery,
    
    // Hostname
    extractHostname,
    validateHostname,
};

export default tenantHelpers;
