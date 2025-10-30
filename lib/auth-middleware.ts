import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectDB } from './mongodb';
import SuperAdmin from '../models/SuperAdmin';
import Owner from '../models/Owner';
import Account from '../models/Account';

export type UserRole = 'owner' | 'superadmin' | 'account';
export type AccountPlan = 'free' | 'pro' | 'max';

export interface AuthUser {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    plan?: AccountPlan; // For account role
    organizationKey?: string; // For SuperAdmin and Account
    databaseName?: string; // For Account
    permissions?: any; // For backward compatibility
}

export interface AuthRequest extends NextRequest {
    user?: AuthUser;
}

/**
 * Verify JWT token and return user data
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(token, secret);

        if (!payload || !payload.userId || !payload.role) {
            return null;
        }

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            name: payload.name as string,
            role: payload.role as UserRole,
            plan: payload.plan as AccountPlan | undefined,
            organizationKey: payload.organizationKey as string | undefined,
            databaseName: payload.databaseName as string | undefined,
            permissions: payload.permissions,
        };
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Extract token from request
 * Checks multiple cookie types for different user roles
 */
export function extractToken(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Try different cookie types based on user role
    // Check all possible auth cookies
    const authToken = request.cookies.get('auth_token')?.value; // SuperAdmin
    const ownerToken = request.cookies.get('owner_token')?.value; // Owner
    const planAuthToken = request.cookies.get('plan_auth_token')?.value; // Account (plan)
    const userToken = request.cookies.get('user_token')?.value; // Account (user)

    // Return first available token
    return authToken || ownerToken || planAuthToken || userToken || null;
}

/**
 * Middleware to authenticate requests
 */
export async function authenticate(request: NextRequest): Promise<{
    authenticated: boolean;
    user?: AuthUser;
    error?: string;
}> {
    const token = extractToken(request);

    if (!token) {
        return { authenticated: false, error: 'No token provided' };
    }

    const user = await verifyToken(token);

    if (!user) {
        return { authenticated: false, error: 'Invalid token' };
    }

    return { authenticated: true, user };
}

/**
 * Middleware to require Owner role
 */
export async function requireOwner(request: NextRequest): Promise<{
    authorized: boolean;
    user?: AuthUser;
    error?: string;
}> {
    const { authenticated, user, error } = await authenticate(request);

    if (!authenticated || !user) {
        return { authorized: false, error: error || 'Authentication required' };
    }

    if (user.role !== 'owner') {
        return { authorized: false, error: 'Owner access required' };
    }

    // Verify Owner exists and is active
    await connectDB();
    const owner = await Owner.findById(user.userId);

    if (!owner || !owner.isActive) {
        return { authorized: false, error: 'Owner account not found or inactive' };
    }

    return { authorized: true, user };
}

/**
 * Middleware to require SuperAdmin role
 */
export async function requireSuperAdmin(request: NextRequest): Promise<{
    authorized: boolean;
    user?: AuthUser;
    error?: string;
}> {
    const { authenticated, user, error } = await authenticate(request);

    if (!authenticated || !user) {
        return { authorized: false, error: error || 'Authentication required' };
    }

    if (user.role !== 'superadmin') {
        return { authorized: false, error: 'SuperAdmin access required' };
    }

    // Verify SuperAdmin exists and is approved
    await connectDB();
    const superAdmin = await SuperAdmin.findById(user.userId);

    if (!superAdmin || !superAdmin.isActive) {
        return { authorized: false, error: 'SuperAdmin account not found or inactive' };
    }

    if (superAdmin.approvalStatus !== 'approved') {
        return { authorized: false, error: 'SuperAdmin account not approved' };
    }

    return { authorized: true, user };
}

/**
 * Middleware to require Account role
 */
export async function requireAccount(request: NextRequest): Promise<{
    authorized: boolean;
    user?: AuthUser;
    error?: string;
}> {
    const { authenticated, user, error } = await authenticate(request);

    if (!authenticated || !user) {
        return { authorized: false, error: error || 'Authentication required' };
    }

    if (user.role !== 'account') {
        return { authorized: false, error: 'Account access required' };
    }

    // Verify Account exists and is active
    await connectDB();
    const account = await Account.findById(user.userId);

    if (!account || !account.isActive) {
        return { authorized: false, error: 'Account not found or inactive' };
    }

    return { authorized: true, user };
}

/**
 * Middleware to require Admin role (LEGACY - for backward compatibility)
 */
export async function requireAdmin(request: NextRequest): Promise<{
    authorized: boolean;
    user?: AuthUser;
    error?: string;
}> {
    const { authenticated, user, error } = await authenticate(request);

    if (!authenticated || !user) {
        return { authorized: false, error: error || 'Authentication required' };
    }

    // Allow owner and superadmin for admin routes
    if (user.role !== 'owner' && user.role !== 'superadmin') {
        return { authorized: false, error: 'Admin access required' };
    }

    return { authorized: true, user };
}

/**
 * Middleware to require Admin privileges (Owner or SuperAdmin)
 */
export async function requireAdminPrivileges(request: NextRequest): Promise<{
    authorized: boolean;
    user?: AuthUser;
    error?: string;
}> {
    const { authenticated, user, error } = await authenticate(request);

    if (!authenticated || !user) {
        return { authorized: false, error: error || 'Authentication required' };
    }

    if (user.role !== 'owner' && user.role !== 'superadmin') {
        return { authorized: false, error: 'Admin privileges required' };
    }

    await connectDB();

    if (user.role === 'owner') {
        const owner = await Owner.findById(user.userId);
        if (!owner || !owner.isActive) {
            return { authorized: false, error: 'Owner account not valid' };
        }
    } else if (user.role === 'superadmin') {
        const superAdmin = await SuperAdmin.findById(user.userId);
        if (!superAdmin || !superAdmin.isActive || superAdmin.approvalStatus !== 'approved') {
            return { authorized: false, error: 'SuperAdmin account not valid' };
        }
    }

    return { authorized: true, user };
}

/**
 * Legacy: requireSuperAdminOrAdmin - redirects to requireAdminPrivileges
 */
export async function requireSuperAdminOrAdmin(request: NextRequest): Promise<{
    authorized: boolean;
    user?: AuthUser;
    error?: string;
}> {
    return requireAdminPrivileges(request);
}

/**
 * Check if user has specific permission based on role and plan
 */
export async function checkUserPermission(userId: string, role: UserRole, feature: string): Promise<boolean> {
    try {
        await connectDB();

        // Owner has all permissions
        if (role === 'owner') {
            return true;
        }

        // SuperAdmin has all permissions
        if (role === 'superadmin') {
            return true;
        }

        // Account permissions based on plan
        if (role === 'account') {
            const account = await Account.findById(userId);
            if (!account || !account.isActive) {
                return false;
            }

            // Check tier-based permissions
            const tierFeatures: Record<string, string[]> = {
                free: ['view_dashboard', 'view_own_content', 'manage_own_profile'],
                premium: ['view_dashboard', 'view_own_content', 'manage_own_profile', 'ai_generation', 'analytics', 'advanced_elements'],
                enterprise: [
                    'view_dashboard',
                    'view_own_content',
                    'manage_own_profile',
                    'ai_generation',
                    'analytics',
                    'advanced_elements',
                    'custom_domain',
                    'priority_support',
                    'api_access',
                ],
            };

            const features = tierFeatures[account.plan] || [];
            return features.includes(feature);
        }

        return false;
    } catch (error) {
        console.error('Error checking user permission:', error);
        return false;
    }
}

/**
 * Check if admin has specific permission (LEGACY - for backward compatibility)
 */
export async function checkAdminPermission(adminId: string, module: string, action?: string): Promise<boolean> {
    try {
        await connectDB();
        const admin = await SuperAdmin.findById(adminId);

        if (!admin || !admin.isActive || admin.approvalStatus !== 'approved') {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error checking admin permission:', error);
        return false;
    }
}

/**
 * Verify organization access
 */
export async function verifyOrganizationAccess(user: AuthUser, organizationKey: string): Promise<boolean> {
    // Owner has access to all organizations
    if (user.role === 'owner') {
        return true;
    }

    if (user.role === 'superadmin') {
        return user.organizationKey === organizationKey;
    }

    if (user.role === 'account') {
        return user.organizationKey === organizationKey;
    }

    return false;
}

/**
 * Create error response
 */
export function createErrorResponse(message: string, status: number = 401) {
    return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
    return NextResponse.json({ success: true, ...data }, { status });
}
