import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { requireSuperAdmin } from '../../../../lib/auth-middleware';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        // Verify SuperAdmin authentication
        const { authorized, user, error } = await requireSuperAdmin(request);

        if (!authorized || !user) {
            return NextResponse.json(
                { success: false, error: error || 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { adminId, action, reason } = body;

        if (!adminId || !action) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        const admin = await SuperAdmin.findById(adminId);

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Admin not found' },
                { status: 404 }
            );
        }

        // Verify admin belongs to this SuperAdmin's organization
        if (admin.organizationKey !== user.organizationKey) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized to approve this admin' },
                { status: 403 }
            );
        }

        if (admin.approvalStatus !== 'pending') {
            return NextResponse.json(
                { success: false, error: 'Admin has already been processed' },
                { status: 400 }
            );
        }

        if (action === 'approve') {
            // Check if SuperAdmin is active and not blocked
            const superAdmin = await SuperAdmin.findById(user.userId);
            if (!superAdmin || !superAdmin.isActive || superAdmin.isBlocked) {
                return NextResponse.json(
                    { success: false, error: 'Cannot approve admin at this time' },
                    { status: 403 }
                );
            }

            admin.approvalStatus = 'approved';
            admin.approvedBy = user.userId as any;
            admin.approvedAt = new Date();
            await admin.save();

            return NextResponse.json({
                success: true,
                message: 'Admin approved successfully',
                admin: {
                    id: admin._id,
                    email: admin.email,
                    name: admin.name,
                    approvalStatus: admin.approvalStatus,
                },
            });
        } else if (action === 'reject') {
            admin.approvalStatus = 'rejected';
            admin.rejectedReason = reason || 'No reason provided';
            await admin.save();

            return NextResponse.json({
                success: true,
                message: 'Admin rejected successfully',
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Admin approval error:', error);
        return NextResponse.json(
            { success: false, error: 'Approval failed. Please try again.' },
            { status: 500 }
        );
    }
}

// GET endpoint for email link approval
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const action = searchParams.get('action');

        if (!id || !action) {
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Request</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #ef4444; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="error">❌ Invalid approval request</div>
                </body>
                </html>
                `,
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        await connectDB();

        let admin = await SuperAdmin.findById(id);

        // Only use d-admin database - no migration from old databases

        if (!admin) {
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #ef4444; font-size: 24px; }
                        .info { color: #666; font-size: 16px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="error">❌ Admin not found</div>
                    <div class="info">This approval link may be expired or the admin record may have been removed. Please contact support or re-register.</div>
                </body>
                </html>
                `,
                { status: 404, headers: { 'Content-Type': 'text/html' } }
            );
        }

        if (admin.approvalStatus !== 'pending') {
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Already Processed</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .info { color: #3b82f6; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="info">ℹ️ This request has already been ${admin.approvalStatus}</div>
                </body>
                </html>
                `,
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        if (action === 'approve') {
            // Only use d-admin database - no migration from old databases
            const superAdmin = await SuperAdmin.findOne({ organizationKey: admin.organizationKey });
            
            if (!superAdmin || !superAdmin.isActive || superAdmin.isBlocked) {
                return new NextResponse(
                    `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Cannot Approve</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .error { color: #ef4444; font-size: 24px; }
                        </style>
                    </head>
                    <body>
                        <div class="error">❌ Cannot approve admin at this time</div>
                    </body>
                    </html>
                    `,
                    { status: 403, headers: { 'Content-Type': 'text/html' } }
                );
            }

            admin.approvalStatus = 'approved';
            admin.approvedBy = superAdmin._id.toString();
            admin.approvedAt = new Date();
            await admin.save();

            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Approved Successfully</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            min-height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background: white;
                            padding: 40px;
                            border-radius: 10px;
                            max-width: 600px;
                            margin: 0 auto;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .success { color: #10b981; font-size: 64px; margin-bottom: 20px; }
                        h1 { color: #333; margin: 20px 0; }
                        p { color: #666; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success">✅</div>
                        <h1>Admin Approved!</h1>
                        <p>The admin account has been successfully approved.</p>
                        <p><strong>Name:</strong> ${admin.name}</p>
                        <p><strong>Email:</strong> ${admin.email}</p>
                    </div>
                </body>
                </html>
                `,
                { status: 200, headers: { 'Content-Type': 'text/html' } }
            );
        } else if (action === 'reject') {
            admin.approvalStatus = 'rejected';
            admin.rejectedReason = 'Rejected by SuperAdmin';
            await admin.save();

            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Rejected</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                            min-height: 100vh;
                            margin: 0;
                        }
                        .container {
                            background: white;
                            padding: 40px;
                            border-radius: 10px;
                            max-width: 600px;
                            margin: 0 auto;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .reject { color: #ef4444; font-size: 64px; margin-bottom: 20px; }
                        h1 { color: #333; margin: 20px 0; }
                        p { color: #666; line-height: 1.6; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="reject">❌</div>
                        <h1>Admin Rejected</h1>
                        <p>The admin registration has been rejected.</p>
                    </div>
                </body>
                </html>
                `,
                { status: 200, headers: { 'Content-Type': 'text/html' } }
            );
        }

        return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invalid Action</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #ef4444; font-size: 24px; }
                </style>
            </head>
            <body>
                <div class="error">❌ Invalid action</div>
            </body>
            </html>
            `,
            { status: 400, headers: { 'Content-Type': 'text/html' } }
        );
    } catch (error: any) {
        console.error('Admin approval error:', error);
        return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .error { color: #ef4444; font-size: 24px; }
                </style>
            </head>
            <body>
                <div class="error">❌ An error occurred while processing the request</div>
            </body>
            </html>
            `,
            { status: 500, headers: { 'Content-Type': 'text/html' } }
        );
    }
}
