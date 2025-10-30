import { NextRequest, NextResponse } from 'next/server';
import { verifyGoogleToken, handleGoogleAuth } from '../../../../lib/google-auth';
import { createPlanAuthToken } from '../../../../lib/plan-auth';
import { resolveAdminFromRequest } from '../../../../lib/hostname-resolver';
import { createAuthToken, createAuthSuccessResponse, type AuthPayload } from '../../../../lib/unified-auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let { token, superAdminId, googleId, email, name, profilePicture } = body;

        // Auto-detect admin from hostname if not provided
        if (!superAdminId) {
            const resolvedAdmin = await resolveAdminFromRequest(request);
            if (resolvedAdmin) {
                superAdminId = resolvedAdmin.adminId;
                console.log(`🌐 Auto-detected admin from hostname: ${resolvedAdmin.organizationName} (${resolvedAdmin.hostname})`);
            }
        }

        let googleUser;

        // Handle two authentication methods:
        // 1. JWT token from Google (recommended)
        // 2. Direct credentials from pre-decoded token
        if (token) {
            // Verify Google token
            googleUser = await verifyGoogleToken(token);
            if (!googleUser) {
                return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
            }
        } else if (googleId && email && name) {
            // Use provided credentials (already decoded from Google token)
            googleUser = {
                sub: googleId,
                email,
                name,
                picture: profilePicture,
            };
        } else {
            return NextResponse.json({ error: 'Google token or credentials are required' }, { status: 400 });
        }

        // Handle account registration/login
        const result = await handleGoogleAuth(googleUser, superAdminId);

        if (!result.success) {
            if (result.error === 'NO_SUPERADMIN_SELECTED') {
                return NextResponse.json(
                    {
                        success: false,
                        needsSuperAdminSelection: true,
                        message: 'Please select an organization to continue',
                    },
                    { status: 200 }
                );
            }
            if (result.error === 'ADMIN_NOT_APPROVED') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Your admin account is pending approval. Please wait for the owner to approve your registration.',
                        approvalStatus: 'pending',
                    },
                    { status: 403 }
                );
            }
            if (result.error === 'ADMIN_INACTIVE') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Your admin account is inactive or blocked. Please contact support.',
                    },
                    { status: 403 }
                );
            }
            return NextResponse.json({ error: result.error || 'Authentication failed' }, { status: 400 });
        }

        const account = result.account;

        // Handle admin authentication differently
        if (result.userType === 'admin') {
            const authPayload: AuthPayload = {
                userId: account._id.toString(),
                email: account.email,
                name: account.name,
                role: 'admin',
                tenantId: account.tenantId,
                hostname: account.hostname,
                organizationKey: account.organizationKey,
                organizationName: account.organizationName,
                permissions: {
                    canManageAccounts: true,
                    features: [],
                },
            };

            const authToken = await createAuthToken(authPayload);

            return createAuthSuccessResponse(
                {
                    id: account._id,
                    email: account.email,
                    name: account.name,
                    role: 'admin',
                    organizationKey: account.organizationKey,
                    organizationName: account.organizationName,
                    tenantId: account.tenantId,
                    hostname: account.hostname,
                    profilePicture: account.profilePicture,
                },
                authToken,
                'admin',
                {
                    isNewAccount: result.isNewAccount || false,
                }
            );
        }

        // Create plan-based auth token for regular accounts
        const authPayload = {
            userId: account._id.toString(),
            email: account.email,
            name: account.name,
            role: 'user' as const,
            superAdminId: account.adminId,
            organizationKey: account.organizationKey,
            plan: account.plan,
            features: account.features,
            isPlanActive: account.isPlanActive,
            planEndDate: account.planEndDate,
        };

        const planToken = await createPlanAuthToken(authPayload);

        // Set authentication cookie
        const response = NextResponse.json({
            success: true,
            account: {
                id: account._id,
                email: account.email,
                name: account.name,
                profilePicture: account.profilePicture,
                plan: account.plan,
                features: account.features,
                isPlanActive: account.isPlanActive,
            },
            isNewAccount: result.isNewAccount || false,
        });

        response.cookies.set('plan_auth_token', planToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        // Also set user_token for compatibility with other auth checks
        response.cookies.set('user_token', planToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        console.log('✅ Account login successful - cookies set:', {
            userId: account._id.toString(),
            email: account.email,
            plan: account.plan,
        });

        return response;
    } catch (error) {
        console.error('Google auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
