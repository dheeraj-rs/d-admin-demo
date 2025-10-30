import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { verifyGoogleToken } from '../../../../lib/google-auth';
import { createAuthToken, createAuthSuccessResponse, AuthPayload } from '../../../../lib/unified-auth';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Google token is required' },
                { status: 400 }
            );
        }

        // Verify Google token
        const googleUser = await verifyGoogleToken(token);
        if (!googleUser) {
            return NextResponse.json(
                { success: false, error: 'Invalid Google token' },
                { status: 401 }
            );
        }

        await connectDB();

        // Find SuperAdmin by email or googleId
        const superAdmin = await SuperAdmin.findOne({
            $or: [
                { email: googleUser.email },
                { googleId: googleUser.sub }
            ]
        });

        if (!superAdmin) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'SuperAdmin not found',
                    message: 'No account found. Please register first or contact the owner for an invite.'
                },
                { status: 404 }
            );
        }

        // Check approval status
        if (superAdmin.approvalStatus === 'pending') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account pending approval',
                    approvalStatus: 'pending',
                    message: 'Your account is waiting for owner approval. You will receive an email once approved.'
                },
                { status: 403 }
            );
        }

        if (superAdmin.approvalStatus === 'rejected') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account rejected',
                    approvalStatus: 'rejected',
                    message: 'Your account was rejected. Please contact support for more information.'
                },
                { status: 403 }
            );
        }

        // Check if account is active
        if (!superAdmin.isActive || superAdmin.isBlocked) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account inactive or blocked',
                    message: 'Your account has been deactivated. Please contact support.'
                },
                { status: 403 }
            );
        }

        // Update last login
        superAdmin.lastLogin = new Date();
        await superAdmin.save();

        // Create unified auth token with admin role
        const authPayload: AuthPayload = {
            userId: superAdmin._id.toString(),
            email: superAdmin.email,
            name: superAdmin.name,
            role: 'admin', // Using 'admin' instead of 'superadmin' for consistency
            tenantId: superAdmin.tenantId,
            hostname: superAdmin.hostname,
            organizationKey: superAdmin.organizationKey,
            organizationName: superAdmin.organizationName,
            permissions: {
                canManageAccounts: true,
                features: [], // Will be populated from plan configurations
            },
        };

        const authToken = await createAuthToken(authPayload);

        return createAuthSuccessResponse(
            {
                id: superAdmin._id,
                email: superAdmin.email,
                name: superAdmin.name,
                role: 'admin', // Consistent role naming
                organizationKey: superAdmin.organizationKey,
                organizationName: superAdmin.organizationName,
                tenantId: superAdmin.tenantId,
                hostname: superAdmin.hostname,
                approvalStatus: superAdmin.approvalStatus,
                pinSetup: superAdmin.pinSetup,
            },
            authToken,
            'admin',
            {
                needsPinSetup: !superAdmin.pinSetup,
                approvalStatus: superAdmin.approvalStatus,
            }
        );
    } catch (error: any) {
        console.error('SuperAdmin login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Login failed',
                message: error.message || 'An error occurred during login'
            },
            { status: 500 }
        );
    }
}
