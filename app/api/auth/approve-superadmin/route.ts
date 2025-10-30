import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { decryptEmail, sendSuperAdminApprovedEmail, sendSuperAdminRejectedEmail } from '../../../../lib/email-service';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const encryptedEmail = searchParams.get('email');
        const action = searchParams.get('action'); // 'approve' or 'reject'
        const reason = searchParams.get('reason');

        if (!id || !encryptedEmail || !action) {
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

        // Decrypt and verify email
        let ownerEmail: string;
        try {
            ownerEmail = decryptEmail(encryptedEmail);
        } catch (error) {
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid Link</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #ef4444; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="error">❌ Invalid or expired approval link</div>
                </body>
                </html>
                `,
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        // Verify owner email matches
        if (ownerEmail !== process.env.EMAIL_USER) {
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Unauthorized</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #ef4444; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="error">❌ Unauthorized access</div>
                </body>
                </html>
                `,
                { status: 403, headers: { 'Content-Type': 'text/html' } }
            );
        }

        await connectDB();

        // Only use d-admin database - no migration from old databases
        const superAdmin = await SuperAdmin.findById(id);

        if (!superAdmin) {
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
                    <div class="error">❌ SuperAdmin not found</div>
                    <div class="info">This approval link may be expired or the SuperAdmin record may have been removed. Please contact support or re-register.</div>
                </body>
                </html>
                `,
                { status: 404, headers: { 'Content-Type': 'text/html' } }
            );
        }

        if (superAdmin.approvalStatus !== 'pending') {
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
                    <div class="info">ℹ️ This request has already been ${superAdmin.approvalStatus}</div>
                </body>
                </html>
                `,
                { status: 400, headers: { 'Content-Type': 'text/html' } }
            );
        }

        if (action === 'approve') {
            // Approve SuperAdmin
            superAdmin.approvalStatus = 'approved';
            superAdmin.approvedBy = ownerEmail;
            superAdmin.approvedAt = new Date();
            await superAdmin.save();

            console.log('✅ SuperAdmin approved:', {
                id: superAdmin._id,
                email: superAdmin.email,
                name: superAdmin.name,
                organizationName: superAdmin.organizationName,
            });

            // Send approval confirmation email with login link
            console.log('📧 Sending login link email to SuperAdmin:', superAdmin.email);

            const emailSent = await sendSuperAdminApprovedEmail(superAdmin.email, superAdmin.name, superAdmin.organizationName);

            if (emailSent) {
                console.log('✅ Login link email sent successfully to:', superAdmin.email);
            } else {
                console.error('❌ Failed to send login link email to:', superAdmin.email);
            }

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
                        .info-box {
                            background: #f0fdf4;
                            padding: 20px;
                            border-radius: 6px;
                            margin: 20px 0;
                            border-left: 4px solid #10b981;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="success">✅</div>
                        <h1>SuperAdmin Approved!</h1>
                        <p>The SuperAdmin account has been successfully approved.</p>
                        <div class="info-box">
                            <p><strong>Name:</strong> ${superAdmin.name}</p>
                            <p><strong>Email:</strong> ${superAdmin.email}</p>
                            <p><strong>Organization:</strong> ${superAdmin.organizationName}</p>
                        </div>
                        <p>A confirmation email has been sent to the user.</p>
                    </div>
                </body>
                </html>
                `,
                { status: 200, headers: { 'Content-Type': 'text/html' } }
            );
        } else if (action === 'reject') {
            // Reject SuperAdmin
            superAdmin.approvalStatus = 'rejected';
            superAdmin.rejectedReason = reason || 'No reason provided';
            await superAdmin.save();

            console.log('❌ SuperAdmin rejected:', {
                id: superAdmin._id,
                email: superAdmin.email,
                name: superAdmin.name,
                organizationName: superAdmin.organizationName,
                status: superAdmin.approvalStatus,
            });

            // Send rejection email
            console.log('📧 Sending rejection email to SuperAdmin:', superAdmin.email);

            const emailSent = await sendSuperAdminRejectedEmail(superAdmin.email, superAdmin.name, superAdmin.rejectedReason);

            if (emailSent) {
                console.log('✅ Rejection email sent successfully to:', superAdmin.email);
            } else {
                console.error('❌ Failed to send rejection email to:', superAdmin.email);
            }

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
                        <h1>Registration Rejected</h1>
                        <p>The SuperAdmin registration has been rejected.</p>
                        <p>A notification email has been sent to the user.</p>
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
        console.error('Approval error:', error);
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
