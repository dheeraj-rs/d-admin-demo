/**
 * ==========================================
 * API ROUTE EXAMPLES
 * ==========================================
 * 
 * Examples showing how to use the unified auth system
 * in API routes with proper Owner → Admin → Account hierarchy
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import { buildTenantFilter, canManageAccounts } from './tenant-helpers';

// ==========================================
// EXAMPLE 1: Owner-Only Route
// ==========================================

/**
 * Example: Get all admins (Owner only)
 * Usage: GET /api/owner/admins
 */
export const GET_AllAdmins = middleware.owner(
    async (request: NextRequest, user: AuthPayload) => {
        // User is guaranteed to be owner here
        // Fetch all admins from database
        // const admins = await Admin.find({});
        
        return NextResponse.json({
            success: true,
            data: {
                // admins,
                message: 'Owner has access to all admins',
            },
        });
    }
);

// ==========================================
// EXAMPLE 2: Admin-or-Higher Route
// ==========================================

/**
 * Example: Get accounts (Admin or Owner)
 * Usage: GET /api/accounts
 */
export const GET_Accounts = middleware.admin(
    async (request: NextRequest, user: AuthPayload) => {
        // User is guaranteed to be admin or owner here
        
        // Build tenant-isolated query
        const filter = buildTenantFilter(user);
        // const accounts = await Account.find(filter);
        
        return NextResponse.json({
            success: true,
            data: {
                // accounts,
                role: user.role,
                tenantId: user.tenantId,
                message: user.role === 'owner' 
                    ? 'Owner viewing all accounts' 
                    : 'Admin viewing their accounts',
            },
        });
    }
);

// ==========================================
// EXAMPLE 3: Any Authenticated User
// ==========================================

/**
 * Example: Get user profile (Any authenticated user)
 * Usage: GET /api/profile
 */
export const GET_Profile = middleware.auth(
    async (request: NextRequest, user: AuthPayload) => {
        // Any authenticated user can access
        
        return NextResponse.json({
            success: true,
            data: {
                id: user.userId,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                plan: user.plan,
            },
        });
    }
);

// ==========================================
// EXAMPLE 4: Plan-Based Access
// ==========================================

/**
 * Example: AI Generation (PRO plan or higher)
 * Usage: POST /api/ai/generate
 */
export const POST_AIGenerate = middleware.plan('PRO',
    async (request: NextRequest, user: AuthPayload) => {
        // User has PRO or MAX plan (or is admin/owner)
        
        const body = await request.json();
        
        return NextResponse.json({
            success: true,
            data: {
                message: 'AI generation started',
                plan: user.plan,
                role: user.role,
            },
        });
    }
);

// ==========================================
// EXAMPLE 5: Feature-Based Access
// ==========================================

/**
 * Example: Custom domain setup (Feature-based)
 * Usage: POST /api/domain/setup
 */
export const POST_DomainSetup = middleware.feature('custom_domain',
    async (request: NextRequest, user: AuthPayload) => {
        // User has custom_domain feature enabled
        
        return NextResponse.json({
            success: true,
            data: {
                message: 'Custom domain feature available',
            },
        });
    }
);

// ==========================================
// EXAMPLE 6: Tenant Isolation
// ==========================================

/**
 * Example: Update account (with tenant isolation)
 * Usage: PUT /api/accounts/:id
 */
export const PUT_Account = middleware.combine(
    middleware.admin,
    middleware.tenant
)(
    async (request: NextRequest, user: AuthPayload, context?: any) => {
        // User is admin or owner
        // Tenant isolation is enforced
        
        const accountId = context?.params?.id;
        const body = await request.json();
        
        // Check permissions
        if (!canManageAccounts(user)) {
            return NextResponse.json(
                { success: false, error: 'Cannot manage accounts' },
                { status: 403 }
            );
        }
        
        // Build tenant-safe filter
        const filter = buildTenantFilter(user, { _id: accountId });
        // const account = await Account.findOneAndUpdate(filter, body);
        
        return NextResponse.json({
            success: true,
            data: {
                message: 'Account updated',
                accountId,
            },
        });
    }
);

// ==========================================
// EXAMPLE 7: Combined Middleware
// ==========================================

/**
 * Example: Advanced analytics (Admin + PRO plan + Rate limited)
 * Usage: GET /api/analytics/advanced
 * 
 * Note: For complex middleware combinations, apply them sequentially
 */
export const GET_AdvancedAnalytics = middleware.log(
    middleware.rateLimit(10, 60000)(
        middleware.plan('PRO',
            middleware.admin(
                async (request: NextRequest, user: AuthPayload) => {
                    // All middleware checks passed
                    
                    return NextResponse.json({
                        success: true,
                        data: {
                            message: 'Advanced analytics data',
                            role: user.role,
                            plan: user.plan,
                        },
                    });
                }
            )
        )
    )
);

// ==========================================
// EXAMPLE 8: Manual Permission Check
// ==========================================

/**
 * Example: Delete account (Manual permission check)
 * Usage: DELETE /api/accounts/:id
 */
export const DELETE_Account = middleware.admin(
    async (request: NextRequest, user: AuthPayload, context?: any) => {
        const accountId = context?.params?.id;
        
        // Manual permission check
        if (user.role === 'account') {
            return NextResponse.json(
                { success: false, error: 'Accounts cannot delete other accounts' },
                { status: 403 }
            );
        }
        
        // Build tenant-safe filter
        const filter = buildTenantFilter(user, { _id: accountId });
        // const result = await Account.findOneAndDelete(filter);
        
        return NextResponse.json({
            success: true,
            data: {
                message: 'Account deleted',
                accountId,
                deletedBy: user.role,
            },
        });
    }
);

// ==========================================
// EXAMPLE 9: Owner Approval Workflow
// ==========================================

/**
 * Example: Approve admin registration (Owner only)
 * Usage: POST /api/owner/approve-admin
 */
export const POST_ApproveAdmin = middleware.owner(
    async (request: NextRequest, user: AuthPayload) => {
        const { adminId, approved } = await request.json();
        
        // Only owner can approve admins
        // const admin = await Admin.findByIdAndUpdate(adminId, {
        //     approvalStatus: approved ? 'approved' : 'rejected',
        //     approvedBy: user.email,
        //     approvedAt: new Date(),
        // });
        
        return NextResponse.json({
            success: true,
            data: {
                message: approved ? 'Admin approved' : 'Admin rejected',
                adminId,
                approvedBy: user.email,
            },
        });
    }
);

// ==========================================
// EXAMPLE 10: Hostname-Based Routing
// ==========================================

/**
 * Example: Get tenant data by hostname
 * Usage: GET /api/:hostname/data
 */
export const GET_TenantData = middleware.admin(
    async (request: NextRequest, user: AuthPayload, context?: any) => {
        const hostname = context?.params?.hostname;
        
        // Verify user has access to this hostname
        if (user.role === 'admin' && user.hostname !== hostname) {
            return NextResponse.json(
                { success: false, error: 'Access denied to this tenant' },
                { status: 403 }
            );
        }
        
        // Fetch tenant data
        // const tenant = await Tenant.findOne({ hostname });
        
        return NextResponse.json({
            success: true,
            data: {
                hostname,
                tenantId: user.tenantId,
                message: 'Tenant data retrieved',
            },
        });
    }
);

// ==========================================
// HOW TO USE IN ACTUAL API ROUTES
// ==========================================

/**
 * In your actual API route file (e.g., app/api/accounts/route.ts):
 * 
 * import { middleware } from './rbac-middleware';
 * import { AuthPayload } from './unified-auth';
 * import { NextRequest, NextResponse } from 'next/server';
 * 
 * export const GET = middleware.admin(
 *     async (request: NextRequest, user: AuthPayload) => {
 *         // Your logic here
 *         return NextResponse.json({ success: true });
 *     }
 * );
 * 
 * export const POST = middleware.owner(
 *     async (request: NextRequest, user: AuthPayload) => {
 *         // Your logic here
 *         return NextResponse.json({ success: true });
 *     }
 * );
 */
