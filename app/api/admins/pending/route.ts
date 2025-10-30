import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { authenticate } from '../../../../lib/auth-middleware';

export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only superadmins can view pending admins
        if (authResult.user.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, error: 'Forbidden: Only superadmins can view pending admins' },
                { status: 403 }
            );
        }

        await connectDB();

        // Get superadmin's organization key
        const superAdmin = await SuperAdmin.findById(authResult.user.userId);
        if (!superAdmin) {
            return NextResponse.json(
                { success: false, error: 'SuperAdmin not found' },
                { status: 404 }
            );
        }

        // Get only pending admins for this superadmin's organization
        const pendingAdmins = await SuperAdmin.find({
            organizationKey: superAdmin.organizationKey,
            approvalStatus: 'pending',
            isActive: true,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: pendingAdmins,
        });
    } catch (error: any) {
        console.error('Error fetching pending admins:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch pending admins' },
            { status: 500 }
        );
    }
}
