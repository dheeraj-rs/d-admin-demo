import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import OwnerAccessToken from '../../../../models/OwnerAccessToken';
import SuperAdmin from '../../../../models/SuperAdmin';
import { createToken } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find the access token
        const accessToken = await OwnerAccessToken.findOne({
            token,
            isActive: true,
            expiresAt: { $gt: new Date() },
        });

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Invalid or expired access token' },
                { status: 401 }
            );
        }

        // Check if token has exceeded max uses
        if (accessToken.maxUses && accessToken.usedCount >= accessToken.maxUses) {
            return NextResponse.json(
                { error: 'Access token has exceeded maximum uses' },
                { status: 401 }
            );
        }

        // Get super admin details
        const superAdmin = await SuperAdmin.findById(accessToken.superAdminId);

        if (!superAdmin) {
            return NextResponse.json(
                { error: 'Super Admin not found' },
                { status: 404 }
            );
        }

        // Validate Super Admin account status (same as normal login)
        if (!superAdmin.isActive) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Your account has been deactivated. Please contact the owner.',
                    approvalStatus: 'inactive',
                },
                { status: 403 }
            );
        }

        // Check approval status
        if (superAdmin.approvalStatus === 'pending') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Your account is pending approval',
                    approvalStatus: 'pending',
                },
                { status: 403 }
            );
        }

        if (superAdmin.approvalStatus === 'rejected') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Your account was rejected',
                    approvalStatus: 'rejected',
                },
                { status: 403 }
            );
        }

        if (superAdmin.approvalStatus !== 'approved') {
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Invalid account status' 
                },
                { status: 400 }
            );
        }

        // Determine permissions based on access mode
        let permissions: any = {};
        
        switch (accessToken.accessMode) {
            case 'owner':
                // Full owner-level access
                permissions = {
                    isOwner: true,
                    ownerAccess: true,
                    fullDbAccess: true,
                    accessAllPages: true,
                    accessAllAccounts: true,
                    emergencyAccess: false,
                };
                break;
            
            case 'superadmin':
                // Normal super admin access
                permissions = {
                    isSuperAdmin: true,
                    canManageAdmins: true,
                    canManageUsers: true,
                    accessOwnOrganization: true,
                    emergencyAccess: false,
                };
                break;
            
            case 'emergency':
            default:
                // Emergency access - super admin logs in with their normal permissions
                permissions = {
                    isSuperAdmin: true,
                    canManageAdmins: true,
                    canManageUsers: true,
                    accessOwnOrganization: true,
                    emergencyAccess: true, // Flag to indicate emergency access
                    emergencyLoginTime: new Date().toISOString(),
                };
                break;
        }

        // Update Super Admin's last login (same as normal login)
        superAdmin.lastLogin = new Date();
        await superAdmin.save();

        // Update token usage and deactivate if one-time use
        const updateData: any = {
            $inc: { usedCount: 1 },
            $set: { lastUsedAt: new Date() },
        };

        // If one-time use, deactivate the token after first use
        if (accessToken.oneTimeUse && accessToken.usedCount === 0) {
            updateData.$set.isActive = false;
        }

        await OwnerAccessToken.updateOne(
            { _id: accessToken._id },
            updateData
        );

        console.log('✅ Emergency access login successful:', {
            email: superAdmin.email,
            name: superAdmin.name,
            organizationKey: superAdmin.organizationKey,
            accessMode: accessToken.accessMode,
            emergencyAccess: accessToken.accessMode === 'emergency',
        });

        // Create JWT token with appropriate permissions
        const jwtToken = await createToken(superAdmin._id.toString(), {
            email: superAdmin.email,
            name: superAdmin.name,
            role: 'superadmin',
            organizationKey: superAdmin.organizationKey,
            permissions,
        });

        // Prepare user data (same structure as normal login)
        const userData = {
            id: superAdmin._id.toString(),
            userId: superAdmin._id.toString(), // Keep for backward compatibility
            email: superAdmin.email,
            name: superAdmin.name,
            role: 'superadmin',
            organizationKey: superAdmin.organizationKey,
            organizationName: superAdmin.organizationName,
            profilePicture: superAdmin.profilePicture,
            permissions,
        };

        // Create response with same structure as normal login
        const response = NextResponse.json({
            success: true,
            approvalStatus: 'approved',
            user: userData,
            needsPinSetup: !superAdmin.pinSetup,
            emergencyAccess: accessToken.accessMode === 'emergency',
            accessMode: accessToken.accessMode,
            data: {
                token: jwtToken,
                user: userData,
                expiresAt: accessToken.expiresAt,
            },
        });

        // Set auth cookie (same as normal login)
        response.cookies.set('auth_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Error validating access token:', error);
        return NextResponse.json(
            { error: 'Failed to validate access token' },
            { status: 500 }
        );
    }
}
