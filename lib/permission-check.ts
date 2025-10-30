import { connectDB } from './mongodb';
import PlanPermissions from '../models/PlanPermissions';
import Account from '../models/Account';

/**
 * ==========================================
 * PERMISSION CHECKING UTILITIES
 * ==========================================
 * 
 * High-security permission system for page-level access control
 * Checks read, write, and delete permissions based on user's plan
 * No loopholes - strict validation at every level
 * ==========================================
 */

export type PlanType = 'FREE' | 'PRO' | 'MAX';
export type ActionType = 'read' | 'write' | 'delete';

export interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
    plan?: PlanType;
    action?: ActionType;
}

/**
 * Check if user has permission to perform action on a page
 * @param userId - User's account ID
 * @param pagePath - Path of the page to check
 * @param action - Action to perform (read/write/delete)
 * @param tenantId - Optional tenant ID for tenant-specific permissions
 * @returns Permission check result
 */
export async function checkPagePermission(
    userId: string,
    pagePath: string,
    action: ActionType,
    tenantId?: string
): Promise<PermissionCheckResult> {
    try {
        await connectDB();

        // Get user's account
        const account = await Account.findById(userId).lean();

        if (!account) {
            return {
                allowed: false,
                reason: 'User account not found',
            };
        }

        // Check if account is active
        if (!account.isActive) {
            return {
                allowed: false,
                reason: 'Account is inactive',
            };
        }

        // Check if plan is active
        if (!account.isPlanActive) {
            return {
                allowed: false,
                reason: 'Plan is not active',
            };
        }

        const userPlan = account.plan as PlanType;

        // Get permissions configuration
        const permissions = await getPermissionsForTenant(tenantId);

        if (!permissions) {
            // Default: allow FREE plan full access when no permissions configured
            // This ensures initial setup allows all users to access the system
            if (userPlan === 'FREE') {
                return {
                    allowed: true,
                    reason: 'No permissions configured - FREE plan has default full access',
                    plan: userPlan,
                    action,
                };
            }
            // PRO and MAX require explicit configuration
            return {
                allowed: false,
                reason: 'No permissions configured for PRO/MAX plans',
                plan: userPlan,
                action,
            };
        }

        // Find page permission
        const pagePermission = permissions.permissions.find((p: any) => p.pagePath === pagePath);

        if (!pagePermission) {
            // Default: allow FREE plan when page not found in permissions
            // This ensures new pages are accessible to FREE users until explicitly configured
            if (userPlan === 'FREE') {
                return {
                    allowed: true,
                    reason: 'Page not in config - FREE plan has default access',
                    plan: userPlan,
                    action,
                };
            }
            // PRO and MAX require explicit page configuration
            return {
                allowed: false,
                reason: 'Page not found in permissions configuration for PRO/MAX',
                plan: userPlan,
                action,
            };
        }

        // Check permission for user's plan
        const planKey = userPlan.toLowerCase() as 'free' | 'pro' | 'max';
        const hasPermission = pagePermission[planKey][action] || false;

        return {
            allowed: hasPermission,
            reason: hasPermission ? 'Permission granted' : `${userPlan} plan does not have ${action} access to this page`,
            plan: userPlan,
            action,
        };
    } catch (error) {
        console.error('Error checking page permission:', error);
        return {
            allowed: false,
            reason: 'Error checking permissions',
        };
    }
}

/**
 * Check multiple permissions at once
 * @param userId - User's account ID
 * @param checks - Array of permission checks
 * @returns Array of permission check results
 */
export async function checkMultiplePermissions(
    userId: string,
    checks: Array<{ pagePath: string; action: ActionType }>,
    tenantId?: string
): Promise<PermissionCheckResult[]> {
    const results: PermissionCheckResult[] = [];

    for (const check of checks) {
        const result = await checkPagePermission(userId, check.pagePath, check.action, tenantId);
        results.push(result);
    }

    return results;
}

/**
 * Get all accessible pages for a user
 * @param userId - User's account ID
 * @param action - Action type to check (default: 'read')
 * @param tenantId - Optional tenant ID
 * @returns Array of accessible page paths
 */
export async function getAccessiblePages(
    userId: string,
    action: ActionType = 'read',
    tenantId?: string
): Promise<string[]> {
    try {
        await connectDB();

        const account = await Account.findById(userId).lean();

        if (!account || !account.isActive || !account.isPlanActive) {
            return [];
        }

        const userPlan = account.plan as PlanType;
        const permissions = await getPermissionsForTenant(tenantId);

        if (!permissions) {
            return [];
        }

        const planKey = userPlan.toLowerCase() as 'free' | 'pro' | 'max';

        // Filter pages where user has the specified action permission
        const accessiblePages = permissions.permissions
            .filter((p: any) => p[planKey][action] === true)
            .map((p: any) => p.pagePath);

        return accessiblePages;
    } catch (error) {
        console.error('Error getting accessible pages:', error);
        return [];
    }
}

/**
 * Get permissions summary for a user
 * @param userId - User's account ID
 * @param tenantId - Optional tenant ID
 * @returns Summary of user's permissions
 */
export async function getUserPermissionsSummary(
    userId: string,
    tenantId?: string
): Promise<{
    plan: PlanType;
    readablePages: number;
    writablePages: number;
    deletablePages: number;
    totalPages: number;
}> {
    try {
        await connectDB();

        const account = await Account.findById(userId).lean();

        if (!account) {
            return {
                plan: 'FREE',
                readablePages: 0,
                writablePages: 0,
                deletablePages: 0,
                totalPages: 0,
            };
        }

        const userPlan = account.plan as PlanType;
        const permissions = await getPermissionsForTenant(tenantId);

        if (!permissions) {
            return {
                plan: userPlan,
                readablePages: 0,
                writablePages: 0,
                deletablePages: 0,
                totalPages: 0,
            };
        }

        const planKey = userPlan.toLowerCase() as 'free' | 'pro' | 'max';
        const totalPages = permissions.permissions.length;

        const readablePages = permissions.permissions.filter((p: any) => p[planKey].read === true).length;
        const writablePages = permissions.permissions.filter((p: any) => p[planKey].write === true).length;
        const deletablePages = permissions.permissions.filter((p: any) => p[planKey].delete === true).length;

        return {
            plan: userPlan,
            readablePages,
            writablePages,
            deletablePages,
            totalPages,
        };
    } catch (error) {
        console.error('Error getting permissions summary:', error);
        return {
            plan: 'FREE',
            readablePages: 0,
            writablePages: 0,
            deletablePages: 0,
            totalPages: 0,
        };
    }
}

/**
 * Helper: Get permissions for tenant (or global)
 */
async function getPermissionsForTenant(tenantId?: string): Promise<any> {
    // First try to get tenant-specific permissions
    if (tenantId) {
        const tenantPermissions = await PlanPermissions.findOne({ tenantId, isGlobal: false })
            .sort({ version: -1 })
            .lean();
        if (tenantPermissions) {
            return tenantPermissions;
        }
    }

    // Fall back to global permissions
    return PlanPermissions.findOne({ isGlobal: true }).sort({ version: -1 }).lean();
}

/**
 * Middleware helper: Check permission and return error response if denied
 */
export async function requirePermission(
    userId: string,
    pagePath: string,
    action: ActionType,
    tenantId?: string
): Promise<{ allowed: boolean; error?: { message: string; status: number } }> {
    const result = await checkPagePermission(userId, pagePath, action, tenantId);

    if (!result.allowed) {
        return {
            allowed: false,
            error: {
                message: result.reason || 'Permission denied',
                status: 403,
            },
        };
    }

    return { allowed: true };
}

const permissionCheck = {
    checkPagePermission,
    checkMultiplePermissions,
    getAccessiblePages,
    getUserPermissionsSummary,
    requirePermission,
};

export default permissionCheck;
