import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../lib/auth-middleware';
import { connectDB } from '../../../lib/mongodb';
import Owner from '../../../models/Owner';
import SuperAdmin from '../../../models/SuperAdmin';
import Account from '../../../models/Account';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
        }

        await connectDB();

        let userData: any = null;

        if (user.role === 'owner') {
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(user.userId)) {
                return NextResponse.json({ authenticated: false, user: null, error: 'Invalid user ID format' }, { status: 200 });
            }
            const owner = await Owner.findById(user.userId);
            if (owner && owner.isActive) {
                userData = {
                    id: owner._id,
                    email: owner.email,
                    name: owner.name,
                    role: 'owner',
                    twoFactorEnabled: owner.twoFactorEnabled,
                };
            }
        } else if (user.role === 'superadmin') {
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(user.userId)) {
                return NextResponse.json({ authenticated: false, user: null, error: 'Invalid user ID format' }, { status: 200 });
            }
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
                };
            }
        } else if (user.role === 'account') {
            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(user.userId)) {
                return NextResponse.json({ authenticated: false, user: null, error: 'Invalid user ID format' }, { status: 200 });
            }
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
                };
            }
        }

        if (!userData) {
            return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
        }

        return NextResponse.json({
            authenticated: true,
            user: userData,
        });
    } catch (error: any) {
        console.error('Auth check error:', error);
        return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }
}
