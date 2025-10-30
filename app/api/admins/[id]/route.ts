import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';

import { authenticate } from '../../../../lib/auth-middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only superadmins can view admin details
        if (authResult.user.role !== 'superadmin') {
            return NextResponse.json({ success: false, error: 'Forbidden: Only superadmins can view admin details' }, { status: 403 });
        }

        await connectDB();

        const { id } = await params;

        // Get superadmin's organization key
        const superAdmin = await SuperAdmin.findById(authResult.user.userId);
        if (!superAdmin) {
            return NextResponse.json({ success: false, error: 'SuperAdmin not found' }, { status: 404 });
        }

        // Only allow viewing admins from their own organization
        const admin = await SuperAdmin.findOne({
            _id: id,
            organizationKey: superAdmin.organizationKey,
        }).lean();

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: admin,
        });
    } catch (error: any) {
        console.error('Error fetching admin:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch admin' }, { status: 500 });
    }
}
