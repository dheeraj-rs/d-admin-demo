import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import AdminInvite from '../../../models/AdminInvite';
import { authenticate } from '../../../lib/auth-middleware';
import { sendAdminInviteEmail } from '../../../lib/email-service';
import crypto from 'crypto';

// GET - List all invites for the superadmin
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (authResult.user.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, error: 'Forbidden: Only superadmins can view invites' },
                { status: 403 }
            );
        }

        await connectDB();

        const invites = await AdminInvite.find({
            superAdminId: authResult.user.userId,
        })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            data: invites,
        });
    } catch (error: any) {
        console.error('Error fetching invites:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch invites' },
            { status: 500 }
        );
    }
}

// POST - Create new admin invite
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (authResult.user.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, error: 'Forbidden: Only superadmins can create invites' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { email, expiryDays = 7 } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if there's already a pending invite for this email from this superadmin
        const existingInvite = await AdminInvite.findOne({
            superAdminId: authResult.user.userId,
            invitedEmail: email.toLowerCase(),
            status: 'pending',
            expiresAt: { $gt: new Date() },
        });

        if (existingInvite) {
            return NextResponse.json(
                { success: false, error: 'An active invite already exists for this email' },
                { status: 400 }
            );
        }

        // Generate unique invite token
        const inviteToken = crypto.randomBytes(32).toString('hex');

        // Generate admin access key for this invite
        const adminAccessKey = `ADM-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        // Create invite
        const invite = await AdminInvite.create({
            superAdminId: authResult.user.userId,
            superAdminEmail: authResult.user.email,
            superAdminName: authResult.user.name,
            invitedEmail: email.toLowerCase(),
            inviteToken,
            adminAccessKey,
            status: 'pending',
            expiresAt,
        });

        // Generate invite URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const inviteUrl = `${appUrl}/register-admin?token=${inviteToken}`;

        // Send email with invite URL and admin access key
        console.log('📧 Sending admin invite email to:', email);
        const emailSent = await sendAdminInviteEmail(email, {
            inviteUrl,
            adminAccessKey,
            superAdminName: authResult.user.name,
            expiresAt,
        });

        if (!emailSent) {
            console.warn('⚠️ Email failed to send, but invite was created');
        }

        return NextResponse.json({
            success: true,
            message: emailSent 
                ? 'Invite created and email sent successfully!' 
                : 'Invite created but email failed to send. Share the details manually.',
            emailSent,
            data: {
                invite,
                inviteUrl,
                adminAccessKey,
            },
        });
    } catch (error: any) {
        console.error('Error creating invite:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create invite' },
            { status: 500 }
        );
    }
}
