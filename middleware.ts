import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest, hasRoleAccess } from './lib/unified-auth';

/**
 * Validate owner token
 */
async function validateOwnerToken(request: NextRequest): Promise<boolean> {
    const auth = await authenticateRequest(request);
    return auth.authenticated && auth.role === 'owner';
}

/**
 * Validate admin token (admin or owner)
 */
async function validateAdminToken(request: NextRequest): Promise<boolean> {
    const auth = await authenticateRequest(request);
    return auth.authenticated && !!auth.role && hasRoleAccess(auth.role, 'admin');
}

// Paths that require owner authentication (redirect to login if not authenticated)
const OWNER_PATHS = ['/owner-dashboard', '/api/owner/', '/api/auth/owner-logout'];

// Paths that require admin authentication (admin or owner)
const ADMIN_PATHS = ['/settings', '/admins', '/api/admins/'];

// Paths that require any authentication (account, admin, or owner)
const PROTECTED_PATHS = ['/dashboard', '/profile'];

const PUBLIC_API_PATHS = [
    '/api/auth/simple-login',
    '/api/auth/simple-logout',
    '/api/auth/user',
    '/api/auth/google',
    '/api/auth/superadmins',
    '/api/auth/register-superadmin',
    '/api/auth/superadmin-login',
    '/api/auth/owner-login',
    '/api/owner/send-2fa-pin', // Allow 2FA PIN sending during login
    '/api/payment/webhook/stripe',
    '/api/payment/webhook/razorpay',
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.startsWith('/_next/') || path.startsWith('/static/') || path === '/favicon.ico' || path === '/robots.txt' || path === '/sitemap.xml') {
        return NextResponse.next();
    }

    if (PUBLIC_API_PATHS.some((apiPath) => path.startsWith(apiPath))) {
        return NextResponse.next();
    }

    // Check authentication using unified auth system
    const auth = await authenticateRequest(request);
    const isAuthenticated = auth.authenticated;

    // Owner has FULL ACCESS to entire website
    if (auth.authenticated && auth.role === 'owner') {
        // Redirect from login pages to dashboard if already logged in
        if (path === '/owner-login') {
            return NextResponse.redirect(new URL('/owner-dashboard', request.url));
        }
        if (path === '/superadmin-login' || path === '/admin-login') {
            return NextResponse.redirect(new URL('/owner-dashboard', request.url));
        }

        // Owner has unrestricted access to ALL pages and APIs
        return NextResponse.next();
    }

    // Admin has access to admin paths and below
    if (auth.authenticated && auth.role === 'admin') {
        // Redirect from login pages to dashboard if already logged in
        if (path === '/superadmin-login' || path === '/admin-login' || path === '/owner-login') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Block access to owner-only paths
        if (OWNER_PATHS.some((ownerPath) => path.startsWith(ownerPath))) {
            if (path.startsWith('/api/')) {
                return NextResponse.json({ success: false, error: 'Owner access required' }, { status: 403 });
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Allow access to admin and protected paths
        return NextResponse.next();
    }

    // Account has access to protected paths only
    if (auth.authenticated && auth.role === 'account') {
        // Redirect from login pages to dashboard if already logged in
        if (path === '/superadmin-login' || path === '/admin-login' || path === '/owner-login') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Block access to owner and admin paths
        if (OWNER_PATHS.some((ownerPath) => path.startsWith(ownerPath)) || ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath))) {
            if (path.startsWith('/api/')) {
                return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Allow access to protected paths
        return NextResponse.next();
    }

    // Check owner-only paths
    if (OWNER_PATHS.some((ownerPath) => path.startsWith(ownerPath))) {
        if (path.startsWith('/api/')) {
            return NextResponse.json({ success: false, error: 'Owner authentication required' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/owner-login', request.url));
    }

    // Check admin paths (require admin or owner)
    if (ADMIN_PATHS.some((adminPath) => path.startsWith(adminPath))) {
        if (!isAuthenticated) {
            if (path.startsWith('/api/')) {
                return NextResponse.json({ success: false, error: 'Admin authentication required' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/superadmin-login', request.url));
        }
        return NextResponse.next();
    }

    // Check protected paths (require any authentication)
    if (PROTECTED_PATHS.some((protectedPath) => path.startsWith(protectedPath))) {
        if (!isAuthenticated) {
            if (path.startsWith('/api/')) {
                return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/?login=required', request.url));
        }
        return NextResponse.next();
    }

    // Allow access to public paths
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next|_vercel|static|.*\\..*|_next/static|_next/image).*)'],
};
