import { NextRequest, NextResponse } from 'next/server';
import { verifyGoogleToken, handleGoogleAuth } from '../../../../lib/google-auth';
import { createPlanAuthToken } from '../../../../lib/plan-auth';
import { resolveAdminFromRequest } from '../../../../lib/hostname-resolver';

export async function POST(request: NextRequest) {
    try {
        const { googleId, email, name, profilePicture } = await request.json();

        if (!googleId || !email || !name) {
            return NextResponse.json({ error: 'Google credentials are required' }, { status: 400 });
        }

        // Auto-detect admin from hostname
        let superAdminId: string | undefined;
        const resolvedAdmin = await resolveAdminFromRequest(request);
        if (resolvedAdmin) {
            superAdminId = resolvedAdmin.adminId;
            console.log(`🌐 Auto-detected admin from hostname: ${resolvedAdmin.organizationName} (${resolvedAdmin.hostname})`);
        }

        // Create Google user payload from provided credentials
        const googleUser = {
            sub: googleId,
            email,
            name,
            picture: profilePicture,
        };

        // Handle account registration/login with auto-detected admin
        const result = await handleGoogleAuth(googleUser, superAdminId);

        if (!result.success) {
            if (result.error === 'NO_SUPERADMIN_SELECTED') {
                return NextResponse.json(
                    {
                        success: false,
                        needsSuperAdminSelection: true,
                        message: 'Please select an organization to continue. Visit /account-login to register.',
                    },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: result.error || 'Authentication failed' }, { status: 400 });
        }

        const account = result.account;

        // Create plan-based auth token
        const authPayload = {
            userId: account._id.toString(),
            email: account.email,
            name: account.name,
            role: 'user' as const,
            superAdminId: account.adminId || '',
            organizationKey: account.organizationKey || '',
            plan: account.plan || 'FREE',
            features: account.features || ['basic'],
            isPlanActive: account.isPlanActive !== false,
            planEndDate: account.planEndDate,
        };

        const planToken = await createPlanAuthToken(authPayload);

        // Set authentication cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: account._id,
                email: account.email,
                name: account.name,
                profilePicture: account.profilePicture,
                tier: (account.plan || 'free').toLowerCase(),
                plan: account.plan || 'FREE',
            },
            isNewUser: result.isNewAccount || false,
        });

        response.cookies.set('plan_auth_token', planToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        response.cookies.set('user_token', planToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Simple login error:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
