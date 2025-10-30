import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { sendSuperAdminApprovalEmail } from '../../../../lib/email-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { testEmail } = body;

        const ownerEmail = testEmail || 'drjsde@gmail.com';

        await connectDB();

        // Create a test SuperAdmin registration
        const testSuperAdmin = new SuperAdmin({
            googleId: 'test-google-id-' + Date.now(),
            email: 'test-user-' + Date.now() + '@example.com',
            name: 'Test User ' + new Date().toLocaleTimeString(),
            profilePicture: 'https://via.placeholder.com/150',
            organizationName: 'Test Organization',
            approvalStatus: 'pending',
        });

        await testSuperAdmin.save();

        console.log('📧 Sending test approval email to:', ownerEmail);

        // Send approval email
        const emailSent = await sendSuperAdminApprovalEmail(ownerEmail, {
            name: testSuperAdmin.name,
            email: testSuperAdmin.email,
            organizationName: testSuperAdmin.organizationName,
            organizationKey: testSuperAdmin.organizationKey,
            id: testSuperAdmin._id.toString(),
        });

        if (emailSent) {
            console.log('✅ Test approval email sent successfully');
            return NextResponse.json({
                success: true,
                message: 'Test approval email sent successfully',
                emailSent: true,
                testRequest: {
                    id: testSuperAdmin._id,
                    name: testSuperAdmin.name,
                    email: testSuperAdmin.email,
                    organizationName: testSuperAdmin.organizationName,
                },
            });
        } else {
            console.error('❌ Failed to send test approval email');
            return NextResponse.json({
                success: false,
                error: 'Failed to send email. Check server logs for details.',
                emailSent: false,
            });
        }
    } catch (error: any) {
        console.error('Test approval email error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to send test email',
            },
            { status: 500 }
        );
    }
}
