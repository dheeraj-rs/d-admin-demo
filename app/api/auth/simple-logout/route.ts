import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Simple logout - clearing all auth cookies...');

        const response = NextResponse.json({ success: true });

        // Clear ALL authentication cookies - SuperAdmin, Admin, User, Owner
        const cookiesToClear = [
            'auth_token', // SuperAdmin token
            'user_token', // User token
            'plan_auth_token', // Plan auth token
            'owner_token', // Owner token
            'session_id', // Session ID
            'user_data', // User data
            'g_state', // Google state
        ];

        cookiesToClear.forEach((cookieName) => {
            // Use delete() method - most reliable
            response.cookies.delete({
                name: cookieName,
                path: '/',
            });

            // Also set to empty with expires date as fallback
            response.cookies.set(cookieName, '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 0,
                path: '/',
                expires: new Date(0),
            });

            console.log(`✅ Cleared cookie: ${cookieName}`);
        });

        console.log('✅ All auth cookies cleared successfully');
        return response;
    } catch (error) {
        console.error('❌ Logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
