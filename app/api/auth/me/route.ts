import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth-middleware';
import { connectDB } from '../../../../lib/mongodb';
import Owner from '../../../../models/Owner';
import SuperAdmin from '../../../../models/SuperAdmin';
import Account from '../../../../models/Account';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Not authenticated' }, { status: 401 });
        }

        await connectDB();

        let userData: any = null;

        if (user.role === 'owner') {
            const owner = await Owner.findById(user.userId);
            if (owner && owner.isActive) {
                userData = {
                    id: owner._id,
                    email: owner.email,
                    name: owner.name,
                    role: 'owner',
                    twoFactorEnabled: owner.twoFactorEnabled,
                    config: owner.config,
                };
            }
        } else if (user.role === 'superadmin') {
            const superAdmin = await SuperAdmin.findById(user.userId);
            if (superAdmin && superAdmin.isActive && superAdmin.approvalStatus === 'approved') {
                userData = {
                    id: superAdmin._id,
                    email: superAdmin.email,
                    name: superAdmin.name,
                    profilePicture: superAdmin.profilePicture,
                    role: 'superadmin',
                    organizationKey: superAdmin.organizationKey,
                    organizationName: superAdmin.organizationName,
                    approvalStatus: superAdmin.approvalStatus,
                    usage: superAdmin.usage,
                    pinSetup: superAdmin.pinSetup,
                };
            }
        } else if (user.role === 'account') {
            const account = await Account.findById(user.userId);
            if (account && account.isActive) {
                userData = {
                    id: account._id,
                    email: account.email,
                    name: account.name,
                    profilePicture: account.profilePicture,
                    role: 'account',
                    plan: account.plan,
                    isVerified: account.isVerified,
                    usage: account.usage,
                };
            }
        }

        if (!userData) {
            return NextResponse.json({ success: false, error: 'User not found or inactive' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: userData,
        });
    } catch (error: any) {
        console.error('Get user error:', error);
        return NextResponse.json({ success: false, error: 'Failed to get user data' }, { status: 500 });
    }
}
