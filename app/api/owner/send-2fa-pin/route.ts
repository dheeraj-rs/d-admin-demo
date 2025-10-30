import { NextRequest, NextResponse } from 'next/server';
import { connectDB as dbConnect } from '../../../../lib/mongodb';
import Owner from '../../../../models/Owner';
import { sendOwner2FAPinEmail } from '../../../../lib/email-service';

// Generate 6-digit PIN
function generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // SECURITY: Always use OWNER_EMAIL from env - ignore any email from request body
        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        console.log('🔐 Sending 2FA PIN to owner email:', ownerEmail);

        // Get owner
        const owner = await Owner.findOne({ email: ownerEmail });

        if (!owner) {
            console.error('❌ Owner not found in database');
            return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 404 });
        }

        // Generate PIN
        const pin = generatePin();
        const pinExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        console.log('✅ Generated 6-digit PIN, valid for 10 minutes');

        // Store PIN temporarily in config
        owner.config = {
            ...owner.config,
            twoFactorPin: pin,
            twoFactorPinExpiry: pinExpiry,
        };
        await owner.save();
        console.log('✅ PIN stored in database');

        // Send email with PIN using the centralized email service
        console.log('📧 Sending 2FA PIN email to:', ownerEmail);
        const emailSent = await sendOwner2FAPinEmail(ownerEmail, pin, pinExpiry);

        if (!emailSent) {
            console.error('❌ Failed to send 2FA PIN email');
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to send verification email. Please check email configuration in .env file.',
                },
                { status: 500 }
            );
        }

        console.log('✅ 2FA PIN email sent successfully to:', ownerEmail);

        return NextResponse.json({
            success: true,
            message: `PIN sent successfully to ${ownerEmail}`,
            expiresAt: pinExpiry,
        });
    } catch (error: any) {
        console.error('❌ Error sending 2FA PIN:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to send PIN. Please check server logs for details.',
            },
            { status: 500 }
        );
    }
}
