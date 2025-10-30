/**
 * ==========================================
 * UNIFIED AUTHENTICATION & AUTHORIZATION
 * ==========================================
 * 
 * Aligned with website_informations.md
 * Hierarchy: Owner → Admin → Account
 * 
 * ROLES:
 * - owner: Platform owner (single user, full access)
 * - admin: Organization admin (multi-tenant, invited by owner)
 * - account: End user (belongs to admin, plan-based access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type UserRole = 'owner' | 'admin' | 'account';
export type PlanType = 'FREE' | 'PRO' | 'MAX';

export interface AuthPayload {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    
    // Admin-specific fields
    tenantId?: string;
    hostname?: string;
    organizationKey?: string;
    organizationName?: string;
    
    // Account-specific fields
    adminId?: string;
    plan?: PlanType;
    
    // Owner-specific fields
    isOwner?: boolean;
    
    // Permissions
    permissions?: {
        isOwner?: boolean;
        fullAccess?: boolean;
        canManageAdmins?: boolean;
        canManageAccounts?: boolean;
        features?: string[];
    };
}

export interface AuthResult {
    authenticated: boolean;
    role?: UserRole;
    payload?: AuthPayload;
    error?: string;
    response?: NextResponse;
}

// ==========================================
// JWT TOKEN UTILITIES
// ==========================================

const JWT_SECRET = () => new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');

/**
 * Create JWT token with role-based payload
 */
export async function createAuthToken(payload: AuthPayload): Promise<string> {
    const token = await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 days for all roles
        .sign(JWT_SECRET());
    
    return token;
}

/**
 * Verify JWT token and extract payload
 */
export async function verifyAuthToken(token: string): Promise<AuthPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET());
        return payload as unknown as AuthPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

/**
 * Authenticate request and extract user info
 * Checks multiple token types: owner_token, auth_token, plan_auth_token
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
    // Try owner token first (highest priority)
    const ownerToken = request.cookies.get('owner_token')?.value;
    if (ownerToken) {
        const payload = await verifyAuthToken(ownerToken);
        if (payload && payload.role === 'owner' && payload.permissions?.isOwner) {
            return {
                authenticated: true,
                role: 'owner',
                payload,
            };
        }
    }
    
    // Try auth_token (for admin)
    const authToken = request.cookies.get('auth_token')?.value;
    if (authToken) {
        const payload = await verifyAuthToken(authToken);
        if (payload && payload.role === 'admin') {
            return {
                authenticated: true,
                role: 'admin',
                payload,
            };
        }
    }
    
    // Try plan_auth_token (for account)
    const planAuthToken = request.cookies.get('plan_auth_token')?.value;
    if (planAuthToken) {
        const payload = await verifyAuthToken(planAuthToken);
        if (payload && payload.role === 'account') {
            return {
                authenticated: true,
                role: 'account',
                payload,
            };
        }
    }
    
    return {
        authenticated: false,
        error: 'No valid authentication token found',
    };
}

// ==========================================
// ROLE-BASED AUTHORIZATION
// ==========================================

/**
 * Role hierarchy levels
 * Higher number = more privileges
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
    account: 1,
    admin: 2,
    owner: 3,
};

/**
 * Check if user has required role or higher
 */
export function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Require Owner authentication
 */
export async function requireOwner(request: NextRequest): Promise<NextResponse | null> {
    const auth = await authenticateRequest(request);
    
    if (!auth.authenticated || auth.role !== 'owner') {
        return NextResponse.json(
            { 
                success: false, 
                error: 'Owner authentication required',
                message: 'This action requires owner-level access'
            },
            { status: 403 }
        );
    }
    
    return null; // No error, proceed
}

/**
 * Require Admin authentication (or higher)
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
    const auth = await authenticateRequest(request);
    
    if (!auth.authenticated) {
        return NextResponse.json(
            { 
                success: false, 
                error: 'Authentication required',
                message: 'Please login to continue'
            },
            { status: 401 }
        );
    }
    
    if (!hasRoleAccess(auth.role!, 'admin')) {
        return NextResponse.json(
            { 
                success: false, 
                error: 'Admin access required',
                message: 'This action requires admin-level access'
            },
            { status: 403 }
        );
    }
    
    return null; // No error, proceed
}

/**
 * Require Account authentication (or higher)
 */
export async function requireAccount(request: NextRequest): Promise<NextResponse | null> {
    const auth = await authenticateRequest(request);
    
    if (!auth.authenticated) {
        return NextResponse.json(
            { 
                success: false, 
                error: 'Authentication required',
                message: 'Please login to continue'
            },
            { status: 401 }
        );
    }
    
    return null; // No error, proceed
}

/**
 * Require specific role (exact match)
 */
export async function requireExactRole(
    request: NextRequest, 
    role: UserRole
): Promise<NextResponse | null> {
    const auth = await authenticateRequest(request);
    
    if (!auth.authenticated || auth.role !== role) {
        return NextResponse.json(
            { 
                success: false, 
                error: `${role} authentication required`,
                message: `This action requires ${role} access`
            },
            { status: 403 }
        );
    }
    
    return null; // No error, proceed
}

// ==========================================
// TENANT ISOLATION HELPERS
// ==========================================

/**
 * Get tenant context from authenticated user
 */
export function getTenantContext(payload: AuthPayload) {
    if (payload.role === 'owner') {
        return {
            isOwner: true,
            hasGlobalAccess: true,
            tenantId: null,
            adminId: null,
        };
    }
    
    if (payload.role === 'admin') {
        return {
            isOwner: false,
            hasGlobalAccess: false,
            tenantId: payload.tenantId,
            adminId: payload.userId,
            hostname: payload.hostname,
            organizationKey: payload.organizationKey,
        };
    }
    
    if (payload.role === 'account') {
        return {
            isOwner: false,
            hasGlobalAccess: false,
            tenantId: payload.tenantId,
            adminId: payload.adminId,
            accountId: payload.userId,
            plan: payload.plan,
        };
    }
    
    return null;
}

/**
 * Verify tenant access
 * Ensures user can only access data from their tenant
 */
export function verifyTenantAccess(
    userPayload: AuthPayload,
    resourceTenantId: string
): boolean {
    // Owner has access to all tenants
    if (userPayload.role === 'owner') {
        return true;
    }
    
    // Admin can only access their own tenant
    if (userPayload.role === 'admin') {
        return userPayload.tenantId === resourceTenantId;
    }
    
    // Account can only access their own tenant
    if (userPayload.role === 'account') {
        return userPayload.tenantId === resourceTenantId;
    }
    
    return false;
}

// ==========================================
// PLAN-BASED PERMISSIONS
// ==========================================

/**
 * Check if account has access to feature based on plan
 */
export function hasFeatureAccess(plan: PlanType, feature: string): boolean {
    const planFeatures: Record<PlanType, string[]> = {
        FREE: ['basic_elements', 'basic_templates', 'view_dashboard'],
        PRO: [
            'basic_elements',
            'basic_templates',
            'view_dashboard',
            'advanced_elements',
            'ai_generation',
            'analytics',
        ],
        MAX: [
            'basic_elements',
            'basic_templates',
            'view_dashboard',
            'advanced_elements',
            'ai_generation',
            'analytics',
            'custom_domain',
            'priority_support',
            'api_access',
        ],
    };
    
    return planFeatures[plan]?.includes(feature) || false;
}

/**
 * Get plan limits
 */
export function getPlanLimits(plan: PlanType) {
    const limits = {
        FREE: {
            maxApiCalls: 100,
            maxStorage: 100, // MB
            maxDownloads: 10,
            maxPages: 5,
            maxWebsites: 1,
        },
        PRO: {
            maxApiCalls: 1000,
            maxStorage: 1000, // MB
            maxDownloads: 100,
            maxPages: 50,
            maxWebsites: 10,
        },
        MAX: {
            maxApiCalls: 10000,
            maxStorage: 10000, // MB
            maxDownloads: 1000,
            maxPages: 500,
            maxWebsites: 100,
        },
    };
    
    return limits[plan];
}

// ==========================================
// COOKIE MANAGEMENT
// ==========================================

/**
 * Set authentication cookie based on role
 */
export function setAuthCookie(
    response: NextResponse,
    token: string,
    role: UserRole
): void {
    const cookieName = role === 'owner' ? 'owner_token' 
        : role === 'admin' ? 'auth_token' 
        : 'plan_auth_token';
    
    response.cookies.set(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    });
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(response: NextResponse): void {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/',
    };
    
    response.cookies.set('owner_token', '', cookieOptions);
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('plan_auth_token', '', cookieOptions);
    response.cookies.set('user_token', '', cookieOptions);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Create success response with user data
 */
export function createAuthSuccessResponse(
    user: any,
    token: string,
    role: UserRole,
    additionalData?: any
): NextResponse {
    const response = NextResponse.json({
        success: true,
        user,
        ...additionalData,
    });
    
    setAuthCookie(response, token, role);
    
    return response;
}

/**
 * Create error response
 */
export function createAuthErrorResponse(
    error: string,
    status: number = 401,
    additionalData?: any
): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error,
            ...additionalData,
        },
        { status }
    );
}

/**
 * Extract user info from request
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthPayload | null> {
    const auth = await authenticateRequest(request);
    return auth.authenticated ? auth.payload! : null;
}
