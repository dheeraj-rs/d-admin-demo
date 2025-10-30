import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { authenticate } from '../../../../lib/auth-middleware';
import { getTenantMessageModel } from '../../../../lib/tenant-models';
import { initializeTenantDatabase } from '../../../../lib/tenant-db-connect';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only superadmins can approve admins
        if (authResult.user.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, error: 'Forbidden: Only superadmins can approve admins' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { adminId } = body;

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

        console.log('✅ Approving admin:', { 
            adminId: admin._id, 
            email: admin.email,
            currentStatus: admin.approvalStatus 
        });

        // Update admin status
        admin.approvalStatus = 'approved';
        admin.isActive = true;  // Ensure admin is active
        admin.approvedBy = authResult.user.userId;
        admin.approvedAt = new Date();

        await admin.save();
        
        console.log('✅ Admin approved successfully:', { 
            adminId: admin._id, 
            email: admin.email,
            newStatus: admin.approvalStatus,
            isActive: admin.isActive
        });

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

        // Create success message notification for the admin in tenant database
        await Message.create({
            title: 'Admin Account Approved! 🎉',
            description: `Your admin account has been approved by the SuperAdmin. You can now access the dashboard with your assigned permissions.`,
            icon: 'pi-check-circle',
            recipientId: admin._id.toString(),
            recipientRole: 'admin',
            type: 'success',
            category: 'admin-permission',
            link: '/admin',
        });

        return NextResponse.json({
            success: true,
            message: 'Admin approved successfully',
            data: admin,
        });
    } catch (error: any) {
        console.error('Error approving admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to approve admin' },
            { status: 500 }
        );
    }
}
