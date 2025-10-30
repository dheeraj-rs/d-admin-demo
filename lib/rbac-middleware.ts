/**
 * ==========================================
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * ==========================================
 * 
 * Provides middleware functions for API route protection
 * Based on Owner → Admin → Account hierarchy
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    authenticateRequest,
    requireOwner,
    requireAdmin,
    requireAccount,
    requireExactRole,
    AuthPayload,
    UserRole,
    hasRoleAccess,
    verifyTenantAccess,
} from './unified-auth';

// ==========================================
// MIDDLEWARE WRAPPER TYPE
// ==========================================

export type ApiHandler = (
    request: NextRequest,
    context?: any
) => Promise<NextResponse> | NextResponse;

export type AuthenticatedApiHandler = (
    request: NextRequest,
    user: AuthPayload,
    context?: any
) => Promise<NextResponse> | NextResponse;

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

/**
 * Wrap API handler with authentication check
 * Passes authenticated user to handler
 */
export function withAuth(handler: AuthenticatedApiHandler): ApiHandler {
    return async (request: NextRequest, context?: any) => {
        const auth = await authenticateRequest(request);
        
        if (!auth.authenticated || !auth.payload) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication required',
                    message: 'Please login to access this resource',
                },
                { status: 401 }
            );
        }
        
        return handler(request, auth.payload, context);
    };
}

/**
 * Wrap API handler with owner-only access
 */
export function withOwnerAuth(handler: AuthenticatedApiHandler): ApiHandler {
    return async (request: NextRequest, context?: any) => {
        const error = await requireOwner(request);
        if (error) return error;
        
        const auth = await authenticateRequest(request);
        return handler(request, auth.payload!, context);
    };
}

/**
 * Wrap API handler with admin-or-higher access
 */
export function withAdminAuth(handler: AuthenticatedApiHandler): ApiHandler {
    return async (request: NextRequest, context?: any) => {
        const error = await requireAdmin(request);
        if (error) return error;
        
        const auth = await authenticateRequest(request);
        return handler(request, auth.payload!, context);
    };
}

/**
 * Wrap API handler with account-or-higher access
 */
export function withAccountAuth(handler: AuthenticatedApiHandler): ApiHandler {
    return async (request: NextRequest, context?: any) => {
        const error = await requireAccount(request);
        if (error) return error;
        
        const auth = await authenticateRequest(request);
        return handler(request, auth.payload!, context);
    };
}

/**
 * Wrap API handler with specific role requirement
 */
export function withRole(role: UserRole, handler: AuthenticatedApiHandler): ApiHandler {
    return async (request: NextRequest, context?: any) => {
        const error = await requireExactRole(request, role);
        if (error) return error;
        
        const auth = await authenticateRequest(request);
        return handler(request, auth.payload!, context);
    };
}

// ==========================================
// TENANT ISOLATION MIDDLEWARE
// ==========================================

/**
 * Ensure user can only access their own tenant data
 * Extracts tenantId from request body or query params
 */
export function withTenantIsolation(handler: AuthenticatedApiHandler): ApiHandler {
    return withAuth(async (request: NextRequest, user: AuthPayload, context?: any) => {
        // Owner has access to all tenants
        if (user.role === 'owner') {
            return handler(request, user, context);
        }
        
        // Extract tenantId from request
        let requestTenantId: string | null = null;
        
        // Try query params
        const url = new URL(request.url);
        requestTenantId = url.searchParams.get('tenantId');
        
        // Try request body for POST/PUT/PATCH
        if (!requestTenantId && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
            try {
                const body = await request.json();
                requestTenantId = body.tenantId || body.tenant_id;
                
                // Recreate request with parsed body for handler
                const newRequest = new NextRequest(request.url, {
                    method: request.method,
                    headers: request.headers,
                    body: JSON.stringify(body),
                });
                request = newRequest;
            } catch (error) {
                // Body already consumed or not JSON
            }
        }
        
        // Verify tenant access
        if (requestTenantId && !verifyTenantAccess(user, requestTenantId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Access denied',
                    message: 'You do not have access to this tenant data',
                },
                { status: 403 }
            );
        }
        
        return handler(request, user, context);
    });
}

// ==========================================
// PLAN-BASED ACCESS MIDDLEWARE
// ==========================================

/**
 * Require specific plan or higher for accounts
 * Owner and Admin bypass this check
 */
export function withPlanAccess(
    requiredPlan: 'FREE' | 'PRO' | 'MAX',
    handler: AuthenticatedApiHandler
): ApiHandler {
    return withAuth(async (request: NextRequest, user: AuthPayload, context?: any) => {
        // Owner and Admin have full access
        if (user.role === 'owner' || user.role === 'admin') {
            return handler(request, user, context);
        }
        
        // Check account plan
        if (user.role === 'account') {
            const planHierarchy = { FREE: 1, PRO: 2, MAX: 3 };
            const userPlanLevel = planHierarchy[user.plan || 'FREE'];
            const requiredPlanLevel = planHierarchy[requiredPlan];
            
            if (userPlanLevel < requiredPlanLevel) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Upgrade required',
                        message: `This feature requires ${requiredPlan} plan or higher`,
                        currentPlan: user.plan,
                        requiredPlan,
                    },
                    { status: 403 }
                );
            }
        }
        
        return handler(request, user, context);
    });
}

/**
 * Require specific feature access based on plan
 */
export function withFeatureAccess(
    feature: string,
    handler: AuthenticatedApiHandler
): ApiHandler {
    return withAuth(async (request: NextRequest, user: AuthPayload, context?: any) => {
        // Owner and Admin have full access
        if (user.role === 'owner' || user.role === 'admin') {
            return handler(request, user, context);
        }
        
        // Check account features
        if (user.role === 'account') {
            const hasAccess = user.permissions?.features?.includes(feature) || false;
            
            if (!hasAccess) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Feature not available',
                        message: `This feature is not available in your current plan`,
                        feature,
                        currentPlan: user.plan,
                    },
                    { status: 403 }
                );
            }
        }
        
        return handler(request, user, context);
    });
}

// ==========================================
// COMBINED MIDDLEWARE
// ==========================================

/**
 * Combine multiple middleware functions
 */
export function combineMiddleware(
    ...middlewares: ((handler: AuthenticatedApiHandler) => ApiHandler)[]
): (handler: AuthenticatedApiHandler) => ApiHandler {
    return (handler: AuthenticatedApiHandler) => {
        return middlewares.reduceRight(
            (acc, middleware) => {
                const wrappedHandler: AuthenticatedApiHandler = async (req, user, ctx) => {
                    return acc(req, user, ctx);
                };
                return middleware(wrappedHandler) as any;
            },
            handler as any
        );
    };
}

// ==========================================
// UTILITY MIDDLEWARE
// ==========================================

/**
 * Log API requests with user info
 */
export function withLogging(handler: AuthenticatedApiHandler): ApiHandler {
    return withAuth(async (request: NextRequest, user: AuthPayload, context?: any) => {
        const startTime = Date.now();
        
        console.log(`[API] ${request.method} ${request.url}`);
        console.log(`[USER] ${user.role} - ${user.email} (${user.userId})`);
        
        const response = await handler(request, user, context);
        
        const duration = Date.now() - startTime;
        console.log(`[RESPONSE] ${response.status} - ${duration}ms`);
        
        return response;
    });
}

/**
 * Rate limiting per user
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
): (handler: AuthenticatedApiHandler) => ApiHandler {
    return (handler: AuthenticatedApiHandler) => {
        return withAuth(async (request: NextRequest, user: AuthPayload, context?: any) => {
            const now = Date.now();
            const key = `${user.userId}-${request.url}`;
            
            const limit = rateLimitMap.get(key);
            
            if (limit) {
                if (now < limit.resetTime) {
                    if (limit.count >= maxRequests) {
                        return NextResponse.json(
                            {
                                success: false,
                                error: 'Rate limit exceeded',
                                message: 'Too many requests. Please try again later.',
                                retryAfter: Math.ceil((limit.resetTime - now) / 1000),
                            },
                            { status: 429 }
                        );
                    }
                    limit.count++;
                } else {
                    // Reset window
                    limit.count = 1;
                    limit.resetTime = now + windowMs;
                }
            } else {
                rateLimitMap.set(key, {
                    count: 1,
                    resetTime: now + windowMs,
                });
            }
            
            return handler(request, user, context);
        });
    };
}

// ==========================================
// EXPORT CONVENIENCE FUNCTIONS
// ==========================================

/**
 * Quick access to common middleware combinations
 */
export const middleware = {
    // Authentication
    auth: withAuth,
    owner: withOwnerAuth,
    admin: withAdminAuth,
    account: withAccountAuth,
    role: withRole,
    
    // Tenant isolation
    tenant: withTenantIsolation,
    
    // Plan-based
    plan: withPlanAccess,
    feature: withFeatureAccess,
    
    // Utility
    log: withLogging,
    rateLimit: withRateLimit,
    
    // Combined
    combine: combineMiddleware,
};

export default middleware;
