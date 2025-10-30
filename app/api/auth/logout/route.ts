import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Server-side logout initiated...');

        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });

        // Clear ALL auth cookies (including httpOnly cookies that JavaScript can't clear)
        const cookiesToClear = ['auth_token', 'plan_auth_token', 'owner_token', 'session_id', 'user_data', 'g_state'];

        cookiesToClear.forEach((cookieName) => {
            // Use delete() method - more reliable for httpOnly cookies
            response.cookies.delete({
                name: cookieName,
                path: '/',
            });

            // Also set to empty with maxAge: 0 as fallback
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

        console.log('✅ All server-side cookies cleared');

        return response;
    } catch (error: any) {
        console.error('❌ Logout error:', error);
        return NextResponse.json({ success: false, error: 'Logout failed' }, { status: 500 });
    }
}
