import { AuthUser } from './auth-middleware';

/**
 * Data Isolation Utilities
 * Provides organization-level data isolation for multi-tenant architecture
 */

/**
 * Get organization key from authenticated user
 * @param user - Authenticated user object
 * @returns Organization key or null
 */
export function getOrganizationKey(user: AuthUser): string | null {
    // Owner has access to all organizations (no isolation)
    if (user.role === 'owner') {
        return null;
    }

    // SuperAdmin and Account users have organization-specific access
    if (user.role === 'superadmin' || user.role === 'account') {
        return user.organizationKey || null;
    }

    return null;
}

/**
 * Verify if user has access to specific organization
 * @param user - Authenticated user object
 * @param organizationKey - Organization key to check
 * @returns True if user has access
 */
export function hasOrganizationAccess(user: AuthUser, organizationKey: string): boolean {
    // Owner has access to all organizations
    if (user.role === 'owner') {
        return true;
    }

    // SuperAdmin and Account must match organization key
    if (user.role === 'superadmin' || user.role === 'account') {
        return user.organizationKey === organizationKey;
    }

    return false;
}

/**
 * Get tenant database name from user
 * @param user - Authenticated user object
 * @returns Database name or null
 */
export function getTenantDatabaseName(user: AuthUser): string | null {
    if (user.role === 'account') {
        return user.databaseName || null;
    }

    // For superadmin, construct database name from organization key
    if (user.role === 'superadmin' && user.organizationKey) {
        return `tenant_${user.organizationKey}`;
    }

    return null;
}

/**
 * Build tenant-isolated query filter
 * @param user - Authenticated user object
 * @param baseQuery - Base query object
 * @returns Query with tenant isolation applied
 */
export function applyTenantIsolation(user: AuthUser, baseQuery: any = {}): any {
    const organizationKey = getOrganizationKey(user);

    // Owner sees all data (no isolation)
    if (user.role === 'owner') {
        return baseQuery;
    }

    // Add organization key filter for isolated users
    if (organizationKey) {
        return {
            ...baseQuery,
            organizationKey,
        };
    }

    return baseQuery;
}

/**
 * Log data access for audit purposes
 * @param user - Authenticated user object
 * @param action - Action performed (CREATE, READ, UPDATE, DELETE)
 * @param model - Model name
 * @param recordId - Record ID
 * @param organizationKey - Organization key
 */
export function logDataAccess(
    user: AuthUser,
    action: string,
    model: string,
    recordId: string,
    organizationKey: string
): void {
    console.log(`[DATA ACCESS] ${action} ${model}:${recordId} by ${user.role}:${user.userId} in org:${organizationKey}`);
}

/**
 * Create unauthorized response
 * @param message - Error message
 * @returns NextResponse with 403 status
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized access') {
    const { NextResponse } = require('next/server');
    return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
    );
}
