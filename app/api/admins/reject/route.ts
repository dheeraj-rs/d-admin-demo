import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { authenticate } from '../../../../lib/auth-middleware';
import { getTenantMessageModel } from '../../../../lib/tenant-models';
import { initializeTenantDatabase } from '../../../../lib/tenant-db-connect';

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only superadmins can reject admins
        if (authResult.user.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, error: 'Forbidden: Only superadmins can reject admins' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { adminId, reason } = body;

        if (!adminId) {
            return NextResponse.json({ success: false, error: 'Admin ID is required' }, { status: 400 });
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

        // Find the pending admin (only from this superadmin's organization)
        const admin = await SuperAdmin.findOne({
            _id: adminId,
            organizationKey: superAdmin.organizationKey,
        });
        
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
        }

        if (admin.approvalStatus !== 'pending') {
            return NextResponse.json(
                { success: false, error: 'Admin is not in pending status' },
                { status: 400 }
            );
        }

        // Update admin status
        admin.approvalStatus = 'rejected';
        admin.rejectedReason = reason || 'No reason provided';
        await admin.save();

        // Get tenant-specific Message model for this superadmin's database
        // IMPORTANT: Use authResult.user.userId (from JWT) for consistent database naming
        const Message = await getTenantMessageModel(
            superAdmin.organizationKey,
            `${authResult.user.name}|${authResult.user.userId}`
        );

        // Initialize tenant database if needed
        await initializeTenantDatabase(
            superAdmin.organizationKey,
            `${authResult.user.name}|${authResult.user.userId}`
        );

        // Create notification for the rejected admin in tenant database
        await Message.create({
            title: 'Admin Registration Rejected',
            description: `Your admin registration request has been rejected. Reason: ${reason || 'No reason provided'}. Please contact your SuperAdmin for more information.`,
            icon: 'pi-times-circle',
            recipientId: admin._id.toString(),
            recipientRole: 'admin',
            type: 'error',
            category: 'admin-permission',
        });

        return NextResponse.json({
            success: true,
            message: 'Admin rejected successfully',
        });
    } catch (error: any) {
        console.error('Error rejecting admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to reject admin' },
            { status: 500 }
        );
    }
}
