/**
 * ==========================================
 * ROUTE MIGRATION EXAMPLES
 * ==========================================
 * 
 * Before/After examples for migrating existing routes
 * to use the unified auth system
 */

/**
 * EXAMPLE 1: Owner-only route
 * ==========================================
 */

// ❌ BEFORE (Old way)
/*
import { requireOwnerAuth } from './owner-auth-middleware';

export async function GET(request: NextRequest) {
    const authError = await requireOwnerAuth(request);
    if (authError) return authError;
    
    // Your logic here
    const admins = await SuperAdmin.find({});
    return NextResponse.json({ success: true, data: admins });
}
*/

// ✅ AFTER (New way)
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';

export const GET = middleware.owner(
    async (request: NextRequest, user: AuthPayload) => {
        // User is guaranteed to be owner
        const admins = await SuperAdmin.find({});
        return NextResponse.json({ success: true, data: admins });
    }
);
*/

/**
 * EXAMPLE 2: Admin route with manual tenant check
 * ==========================================
 */

// ❌ BEFORE (Old way - manual checks)
/*
export async function GET(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { payload } = await jwtVerify(authToken, secret);
    if (payload.role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Manual tenant filtering
    const accounts = await Account.find({
        tenantId: payload.tenantId
    });
    
    return NextResponse.json({ success: true, data: accounts });
}
*/

// ✅ AFTER (New way - automatic tenant isolation)
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import { buildTenantFilter } from './tenant-helpers';

export const GET = middleware.admin(
    async (request: NextRequest, user: AuthPayload) => {
        // Automatic tenant filtering
        const filter = buildTenantFilter(user);
        const accounts = await Account.find(filter);
        
        return NextResponse.json({ success: true, data: accounts });
    }
);
*/

/**
 * EXAMPLE 3: Account route with plan check
 * ==========================================
 */

// ❌ BEFORE (Old way - manual plan check)
/*
export async function POST(request: NextRequest) {
    const token = request.cookies.get('plan_auth_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { payload } = await jwtVerify(token, secret);
    
    // Manual plan check
    if (payload.plan !== 'PRO' && payload.plan !== 'MAX') {
        return NextResponse.json(
            { error: 'PRO plan required' },
            { status: 403 }
        );
    }
    
    // Your logic here
    return NextResponse.json({ success: true });
}
*/

// ✅ AFTER (New way - automatic plan check)
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';

export const POST = middleware.plan('PRO',
    async (request: NextRequest, user: AuthPayload) => {
        // User has PRO or MAX plan (or is admin/owner)
        // Your logic here
        return NextResponse.json({ success: true });
    }
);
*/

/**
 * EXAMPLE 4: Mixed permissions (Admin or Owner)
 * ==========================================
 */

// ❌ BEFORE (Old way - complex manual checks)
/*
export async function PUT(request: NextRequest) {
    const ownerToken = request.cookies.get('owner_token')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    
    let userRole = null;
    let tenantId = null;
    
    if (ownerToken) {
        const { payload } = await jwtVerify(ownerToken, secret);
        if (payload.permissions?.isOwner) {
            userRole = 'owner';
        }
    } else if (authToken) {
        const { payload } = await jwtVerify(authToken, secret);
        if (payload.role === 'superadmin') {
            userRole = 'admin';
            tenantId = payload.tenantId;
        }
    }
    
    if (!userRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const accountId = body.accountId;
    
    // Manual tenant check for admin
    let filter = { _id: accountId };
    if (userRole === 'admin') {
        filter.tenantId = tenantId;
    }
    
    const account = await Account.findOneAndUpdate(filter, body);
    return NextResponse.json({ success: true, data: account });
}
*/

// ✅ AFTER (New way - clean and simple)
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import { buildTenantFilter } from './tenant-helpers';

export const PUT = middleware.admin(
    async (request: NextRequest, user: AuthPayload) => {
        const body = await request.json();
        const accountId = body.accountId;
        
        // Automatic tenant filtering (owner sees all, admin sees their tenant)
        const filter = buildTenantFilter(user, { _id: accountId });
        const account = await Account.findOneAndUpdate(filter, body);
        
        return NextResponse.json({ success: true, data: account });
    }
);
*/

/**
 * EXAMPLE 5: Multiple middleware (Rate limiting + Auth)
 * ==========================================
 */

// ❌ BEFORE (Old way - manual implementation)
/*
const rateLimitMap = new Map();

export async function POST(request: NextRequest) {
    // Manual rate limiting
    const ip = request.headers.get('x-forwarded-for');
    const now = Date.now();
    const limit = rateLimitMap.get(ip);
    
    if (limit && limit.count > 100 && now < limit.resetTime) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    // Manual auth check
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Your logic here
    return NextResponse.json({ success: true });
}
*/

// ✅ AFTER (New way - composable middleware)
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';

export const POST = middleware.rateLimit(100, 60000)(
    middleware.admin(
        async (request: NextRequest, user: AuthPayload) => {
            // Rate limiting and auth automatically handled
            // Your logic here
            return NextResponse.json({ success: true });
        }
    )
);
*/

/**
 * EXAMPLE 6: Feature-based access
 * ==========================================
 */

// ❌ BEFORE (Old way - manual feature check)
/*
export async function POST(request: NextRequest) {
    const token = request.cookies.get('plan_auth_token')?.value;
    const { payload } = await jwtVerify(token, secret);
    
    // Manual feature check
    const hasFeature = payload.features?.includes('custom_domain');
    if (!hasFeature) {
        return NextResponse.json(
            { error: 'Custom domain feature not available' },
            { status: 403 }
        );
    }
    
    // Your logic here
    return NextResponse.json({ success: true });
}
*/

// ✅ AFTER (New way - automatic feature check)
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';

export const POST = middleware.feature('custom_domain',
    async (request: NextRequest, user: AuthPayload) => {
        // Feature access automatically verified
        // Your logic here
        return NextResponse.json({ success: true });
    }
);
*/

/**
 * EXAMPLE 7: Updating existing owner API routes
 * ==========================================
 */

// File: app/api/owner/users/route.ts

// ❌ BEFORE
/*
import { requireOwnerAuth } from './owner-auth-middleware';

export async function GET(request: NextRequest) {
    const authError = await requireOwnerAuth(request);
    if (authError) return authError;
    
    const users = await Account.find({});
    return NextResponse.json({ success: true, data: users });
}

export async function DELETE(request: NextRequest) {
    const authError = await requireOwnerAuth(request);
    if (authError) return authError;
    
    const { userId } = await request.json();
    await Account.findByIdAndDelete(userId);
    return NextResponse.json({ success: true });
}
*/

// ✅ AFTER
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import Account from '../models/Account';

export const GET = middleware.owner(
    async (request: NextRequest, user: AuthPayload) => {
        const users = await Account.find({});
        return NextResponse.json({ success: true, data: users });
    }
);

export const DELETE = middleware.owner(
    async (request: NextRequest, user: AuthPayload) => {
        const { userId } = await request.json();
        await Account.findByIdAndDelete(userId);
        return NextResponse.json({ success: true });
    }
);
*/

/**
 * EXAMPLE 8: Updating admin API routes
 * ==========================================
 */

// File: app/api/admins/[id]/route.ts

// ❌ BEFORE
/*
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = request.cookies.get('auth_token')?.value;
    const { payload } = await jwtVerify(token, secret);
    
    // Only owner can view admin details
    if (payload.role !== 'owner') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const admin = await SuperAdmin.findById(params.id);
    return NextResponse.json({ success: true, data: admin });
}
*/

// ✅ AFTER
/*
import { middleware } from './rbac-middleware';
import { AuthPayload } from './unified-auth';
import SuperAdmin from '../models/SuperAdmin';

export const GET = middleware.owner(
    async (
        request: NextRequest,
        user: AuthPayload,
        { params }: { params: { id: string } }
    ) => {
        const admin = await SuperAdmin.findById(params.id);
        return NextResponse.json({ success: true, data: admin });
    }
);
*/

/**
 * QUICK MIGRATION CHECKLIST
 * ==========================================
 * 
 * For each API route file:
 * 
 * 1. Import new middleware:
 *    import { middleware } from './rbac-middleware';
 *    import { AuthPayload } from './unified-auth';
 * 
 * 2. Replace function declaration:
 *    export async function GET(request) { ... }
 *    →
 *    export const GET = middleware.owner(async (request, user) => { ... });
 * 
 * 3. Remove manual auth checks:
 *    - Remove requireOwnerAuth()
 *    - Remove jwtVerify() calls
 *    - Remove manual role checks
 * 
 * 4. Use tenant helpers for queries:
 *    - Replace manual tenantId filtering with buildTenantFilter()
 *    - Use canManageAccounts(), canDeleteAccount(), etc.
 * 
 * 5. Update role references:
 *    - Change 'superadmin' to 'admin'
 *    - Use consistent role naming
 * 
 * 6. Test the route:
 *    - Verify authentication works
 *    - Verify tenant isolation
 *    - Verify permissions
 */

export const MIGRATION_EXAMPLES_COMPLETE = true;
