import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import crypto from 'crypto';
import AdminInvite, { IAdminInvite } from '../../../../models/AdminInvite';
import { sendSuperAdminInviteEmail } from '../../../../lib/email-service';
import { createOwnerNotification } from '../../../../lib/notification-helper';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED - Only owner can invite admins
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const { email } = await request.json();

        // Validate email
        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        await connectDB();

        const normalizedEmail = email.toLowerCase().trim();

        // Check if there's already a pending invite for this email
        const existingInvite = await AdminInvite.findPendingByEmail(normalizedEmail);
        if (existingInvite) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'An active invitation already exists for this email. Please wait for it to expire or be used.',
                    expiresAt: existingInvite.expiresAt
                },
                { status: 409 }
            );
        }

        // Generate secure invite token (cryptographically secure)
        const inviteToken = crypto.randomBytes(32).toString('hex');

        // Set expiration (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Get owner email from environment or request
        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';

        // Create invite record
        const invite = await AdminInvite.create({
            email: normalizedEmail,
            token: inviteToken,
            invitedBy: ownerEmail,
            status: 'pending',
            expiresAt,
        });

        console.log('✅ Created invite record:', (invite as any)._id);

        // Send invite email with secure token
        console.log('📧 Sending Admin invite to:', normalizedEmail);
        const emailSent = await sendSuperAdminInviteEmail(normalizedEmail, inviteToken, expiresAt);

        if (emailSent) {
            // Create notification
            await createOwnerNotification({
                type: 'invite_sent',
                title: 'Admin Invitation Sent',
                message: `Invitation email sent to ${email}. Waiting for registration.`,
                relatedUser: {
                    id: '',
                    name: '',
                    email: email.toLowerCase().trim(),
                    role: 'admin',
                },
                metadata: {
                    invitedEmail: normalizedEmail,
                    inviteId: String((invite as any)._id),
                    expiresAt: expiresAt.toISOString(),
                    sentAt: new Date().toISOString(),
                },
                priority: 'medium',
                actionRequired: false,
            });

            return NextResponse.json({
                success: true,
                message: `Secure invitation email sent successfully to ${email}`,
                data: { 
                    email: normalizedEmail,
                    expiresAt: expiresAt.toISOString(),
                    inviteId: String((invite as any)._id)
                }
            });
        } else {
            // Email failed but invite was created - mark it as cancelled
            await AdminInvite.findByIdAndUpdate((invite as any)._id, { status: 'cancelled' });
            
            return NextResponse.json(
                { success: false, error: 'Failed to send invitation email. Please check email service configuration.' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('❌ Error in invite-admin API:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
