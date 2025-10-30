/**
 * ==========================================
 * IMPLEMENTATION GUIDE
 * ==========================================
 * 
 * Complete guide for implementing the unified auth system
 * aligned with website_informations.md
 * 
 * HIERARCHY: Owner → Admin → Account
 * ==========================================
 */

/**
 * 1. AUTHENTICATION FLOW
 * ==========================================
 * 
 * OWNER LOGIN:
 * - Route: /owner-login
 * - Methods: Google OAuth or Backup Key
 * - Token: owner_token (httpOnly cookie)
 * - Access: Full platform access
 * 
 * ADMIN LOGIN:
 * - Route: /superadmin-login (will be renamed to /admin-login)
 * - Method: Google OAuth (invitation required)
 * - Token: auth_token (httpOnly cookie)
 * - Access: Tenant-isolated admin access
 * 
 * ACCOUNT LOGIN:
 * - Route: /login or Google OAuth
 * - Method: Google OAuth
 * - Token: plan_auth_token (httpOnly cookie)
 * - Access: Plan-based feature access
 */

/**
 * 2. USING UNIFIED AUTH IN API ROUTES
 * ==========================================
 */

// Example 1: Owner-only route
// File: app/api/owner/admins/route.ts
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import { NextRequest, NextResponse } from 'next/server';
import SuperAdmin from '../models/SuperAdmin';

export const GET = middleware.owner(
    async (request: NextRequest, user: AuthPayload) => {
        // User is guaranteed to be owner
        const admins = await SuperAdmin.find({});
        
        return NextResponse.json({
            success: true,
            data: admins,
        });
    }
);
*/

// Example 2: Admin-or-higher route with tenant isolation
// File: app/api/accounts/route.ts
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import { buildTenantFilter } from './tenant-helpers';
import { NextRequest, NextResponse } from 'next/server';
import Account from '../models/Account';

export const GET = middleware.admin(
    async (request: NextRequest, user: AuthPayload) => {
        // Build tenant-isolated query
        const filter = buildTenantFilter(user);
        const accounts = await Account.find(filter);
        
        return NextResponse.json({
            success: true,
            data: accounts,
            role: user.role,
            tenantId: user.tenantId,
        });
    }
);

export const POST = middleware.admin(
    async (request: NextRequest, user: AuthPayload) => {
        const body = await request.json();
        
        // Enrich with tenant data
        const accountData = {
            ...body,
            tenantId: user.tenantId,
            adminId: user.userId,
        };
        
        const account = await Account.create(accountData);
        
        return NextResponse.json({
            success: true,
            data: account,
        });
    }
);
*/

// Example 3: Plan-based access
// File: app/api/ai/generate/route.ts
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import { NextRequest, NextResponse } from 'next/server';

export const POST = middleware.plan('PRO',
    async (request: NextRequest, user: AuthPayload) => {
        // User has PRO or MAX plan (or is admin/owner)
        const body = await request.json();
        
        // AI generation logic here
        
        return NextResponse.json({
            success: true,
            data: { message: 'AI generation started' },
        });
    }
);
*/

/**
 * 3. FRONTEND AUTHENTICATION
 * ==========================================
 */

// Getting current user role
/*
import { getUserFromRequest } from './unified-auth';

// In a server component
const user = await getUserFromRequest(request);
if (user?.role === 'owner') {
    // Show owner UI
} else if (user?.role === 'admin') {
    // Show admin UI
} else if (user?.role === 'account') {
    // Show account UI based on plan
}
*/

// Client-side role checking
/*
'use client';
import { getUserRole } from './auth';

const role = getUserRole();
if (role === 'owner') {
    // Render owner components
}
*/

/**
 * 4. DATABASE QUERIES WITH TENANT ISOLATION
 * ==========================================
 */

// Example: Get accounts with proper isolation
/*
import { buildTenantFilter, buildAccountFilter } from './tenant-helpers';
import Account from '../models/Account';

// In your API handler
const filter = buildTenantFilter(user, {
    plan: 'PRO',
    isActive: true,
});

const accounts = await Account.find(filter);
// Owner: Gets all PRO accounts
// Admin: Gets only their tenant's PRO accounts
// Account: Gets only their own account
*/

/**
 * 5. PERMISSION CHECKS
 * ==========================================
 */

// Check if user can manage accounts
/*
import { canManageAccounts, canDeleteAccount } from './tenant-helpers';

if (!canManageAccounts(user)) {
    return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
    );
}

if (!canDeleteAccount(user, accountId, accountTenantId)) {
    return NextResponse.json(
        { error: 'Cannot delete this account' },
        { status: 403 }
    );
}
*/

/**
 * 6. MIGRATION STEPS
 * ==========================================
 * 
 * Step 1: Update existing API routes
 * - Replace old auth checks with middleware
 * - Use buildTenantFilter for database queries
 * - Update role checks from 'superadmin' to 'admin'
 * 
 * Step 2: Update frontend components
 * - Use unified role names (owner/admin/account)
 * - Update permission checks
 * - Update navigation based on roles
 * 
 * Step 3: Update models (if needed)
 * - Ensure all models have tenantId field
 * - Ensure proper indexes on tenantId
 * - Add adminId field to Account model
 * 
 * Step 4: Test flows
 * - Owner → Create Admin → Admin Login
 * - Admin → Create Account → Account Login
 * - Verify tenant isolation
 * - Verify plan-based permissions
 */

/**
 * 7. COMMON PATTERNS
 * ==========================================
 */

// Pattern 1: Owner manages admins
/*
// GET /api/owner/admins
export const GET = middleware.owner(async (req, user) => {
    const admins = await SuperAdmin.find({});
    return NextResponse.json({ success: true, data: admins });
});

// POST /api/owner/approve-admin
export const POST = middleware.owner(async (req, user) => {
    const { adminId, approved } = await req.json();
    const admin = await SuperAdmin.findByIdAndUpdate(adminId, {
        approvalStatus: approved ? 'approved' : 'rejected',
        approvedBy: user.email,
    });
    return NextResponse.json({ success: true, data: admin });
});
*/

// Pattern 2: Admin manages accounts
/*
// GET /api/accounts
export const GET = middleware.admin(async (req, user) => {
    const filter = buildTenantFilter(user);
    const accounts = await Account.find(filter);
    return NextResponse.json({ success: true, data: accounts });
});

// PUT /api/accounts/:id
export const PUT = middleware.admin(async (req, user, ctx) => {
    const accountId = ctx?.params?.id;
    const body = await req.json();
    
    const filter = buildTenantFilter(user, { _id: accountId });
    const account = await Account.findOneAndUpdate(filter, body);
    
    return NextResponse.json({ success: true, data: account });
});
*/

// Pattern 3: Account self-service
/*
// GET /api/profile
export const GET = middleware.account(async (req, user) => {
    const account = await Account.findById(user.userId);
    return NextResponse.json({ success: true, data: account });
});

// PUT /api/profile
export const PUT = middleware.account(async (req, user) => {
    const body = await req.json();
    const account = await Account.findByIdAndUpdate(user.userId, body);
    return NextResponse.json({ success: true, data: account });
});
*/

/**
 * 8. TESTING CHECKLIST
 * ==========================================
 * 
 * □ Owner can login with Google OAuth
 * □ Owner can login with backup key
 * □ Owner can view all admins
 * □ Owner can approve/reject admin registrations
 * □ Owner can view all accounts across all tenants
 * 
 * □ Admin can register with invitation
 * □ Admin requires owner approval
 * □ Admin can login after approval
 * □ Admin can only see their tenant's accounts
 * □ Admin cannot access other tenants' data
 * □ Admin cannot access owner-only routes
 * 
 * □ Account can register/login
 * □ Account is associated with correct tenant
 * □ Account can only access their own data
 * □ Account permissions based on plan (FREE/PRO/MAX)
 * □ Account cannot access admin or owner routes
 * 
 * □ Middleware properly blocks unauthorized access
 * □ Tenant isolation works correctly
 * □ Plan-based features work correctly
 * □ All database queries respect tenant boundaries
 */

/**
 * 9. TROUBLESHOOTING
 * ==========================================
 * 
 * Issue: "Authentication required" error
 * Solution: Check if correct cookie is set (owner_token/auth_token/plan_auth_token)
 * 
 * Issue: "Access denied to this tenant"
 * Solution: Verify tenantId matches between user and resource
 * 
 * Issue: "Upgrade required" error
 * Solution: Check user's plan level vs required plan level
 * 
 * Issue: Admin can see other tenants' data
 * Solution: Ensure buildTenantFilter is used in all queries
 * 
 * Issue: Role confusion (superadmin vs admin)
 * Solution: Use 'admin' consistently, update old 'superadmin' references
 */

/**
 * 10. NEXT STEPS
 * ==========================================
 * 
 * 1. Update remaining API routes to use new middleware
 * 2. Update frontend components to use unified roles
 * 3. Add comprehensive tests for each role
 * 4. Update documentation
 * 5. Deploy and monitor
 */

export const IMPLEMENTATION_COMPLETE = true;
