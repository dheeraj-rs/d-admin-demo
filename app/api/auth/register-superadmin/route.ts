import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import SuperAdminInvite from '../../../../models/AdminInvite';
import { sendSuperAdminApprovalEmail } from '../../../../lib/email-service';
import { createToken } from '../../../../lib/auth';
import { createOwnerNotification } from '../../../../lib/notification-helper';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { googleId, email, name, profilePicture, organizationName, industry, website, companySize, country, inviteToken } = body;

        // Validate required fields
        if (!googleId || !email || !name || !organizationName) {
            console.error('Missing required fields:', { googleId, email, name, organizationName });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields',
                    missing: {
                        googleId: !googleId,
                        email: !email,
                        name: !name,
                        organizationName: !organizationName,
                    },
                },
                { status: 400 }
            );
        }

        console.log('✅ All required fields present:', { googleId, email, name, organizationName });

        // Validate organizationName specifically for database generation
        if (!organizationName || organizationName.trim() === '') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Organization name is required',
                    missing: { organizationName: true }
                }, 
                { status: 400 }
            );
        }

        // Validate invite token is provided
        if (!inviteToken || inviteToken.trim() === '') {
            return NextResponse.json({ success: false, error: 'Invite token is required' }, { status: 400 });
        }

        await connectDB();

        // Validate invite token - SECURITY CRITICAL
        const invite = await SuperAdminInvite.isValidInvite(inviteToken);
        if (!invite) {
            console.error('❌ Invalid or expired invite token');
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid or expired invitation link. Please request a new invitation from the owner.' 
            }, { status: 403 });
        }

        // SECURITY: Verify email matches the invited email
        const normalizedEmail = email.toLowerCase().trim();
        const invitedEmail = invite.email.toLowerCase().trim();
        
        if (normalizedEmail !== invitedEmail) {
            console.error('❌ Email mismatch:', { provided: normalizedEmail, invited: invitedEmail });
            return NextResponse.json({ 
                success: false, 
                error: `Email mismatch! This invitation is for ${invite.email} only. You cannot use ${email}.` 
            }, { status: 403 });
        }

        console.log('✅ Invite token validated successfully for:', invitedEmail);

        // Check if SuperAdmin already exists
        const existingSuperAdmin = await SuperAdmin.findOne({
            $or: [{ email }, { googleId }],
        });

        if (existingSuperAdmin) {
            if (existingSuperAdmin.approvalStatus === 'pending') {
                return NextResponse.json(
                    {
                        success: false,
                        needsApproval: true,
                        error: 'Your registration is pending approval',
                    },
                    { status: 403 }
                );
            }

            if (existingSuperAdmin.approvalStatus === 'rejected') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Your registration was rejected. Please contact support.',
                    },
                    { status: 403 }
                );
            }

            // Already approved - return success
            const token = await createToken(existingSuperAdmin._id.toString(), {
                email: existingSuperAdmin.email,
                name: existingSuperAdmin.name,
                role: 'superadmin',
                organizationKey: existingSuperAdmin.organizationKey,
            });

            const response = NextResponse.json({
                success: true,
                user: {
                    id: existingSuperAdmin._id,
                    email: existingSuperAdmin.email,
                    name: existingSuperAdmin.name,
                    role: 'superadmin',
                    organizationKey: existingSuperAdmin.organizationKey,
                    approvalStatus: existingSuperAdmin.approvalStatus,
                },
                needsPinSetup: !existingSuperAdmin.pinSetup,
            });

            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
            });

            return response;
        }

        /**
         * ==========================================
         * MULTI-TENANT DATABASE CREATION
         * ==========================================
         * 
         * 1. SuperAdmin saved to MAIN DATABASE (d-admin)
         * 2. Auto-generated fields:
         *    - organizationKey: Unique organization identifier
         *    - databaseName: Tenant database name (e.g., d-admin-techcorp-1d2c)
         * 
         * 3. Tenant database (d-admin-techcorp-1d2c) will be created:
         *    - Automatically on first use (when first Account/Admin is created)
         *    - Or manually via initializeTenantDatabase() after approval
         * 
         * 4. All this SuperAdmin's data will be stored in their tenant DB:
         *    - Accounts (users with plans)
         *    - Admins
         *    - Users
         *    - Websites
         *    - Elements
         *    - All tenant-specific collections
         * 
         * 5. SuperAdmin record stays in MAIN DB for authentication
         * ==========================================
         */
        
        console.log('📝 Creating SuperAdmin with data:', {
            googleId,
            email,
            name,
            organizationName,
            industry,
            website,
            companySize,
            country
        });

        const newSuperAdmin = new SuperAdmin({
            googleId,
            email,
            name,
            profilePicture,
            organizationName,
            industry,
            website,
            companySize,
            country,
            approvalStatus: 'pending',
        });

        await newSuperAdmin.save();

        console.log('✅ SuperAdmin created successfully:', {
            id: newSuperAdmin._id,
            organizationKey: newSuperAdmin.organizationKey,
            tenantId: newSuperAdmin.tenantId,
            hostname: newSuperAdmin.hostname,
            email: newSuperAdmin.email,
            organizationName: newSuperAdmin.organizationName
        });
        
        console.log('📊 Multi-tenant setup:', {
            mainDB: 'd-admin (contains SuperAdmin record)',
            tenantId: newSuperAdmin.tenantId,
            hostname: newSuperAdmin.hostname,
            isolation: 'Complete data isolation per SuperAdmin via tenantId'
        });

        // Mark invite as accepted (one-time use only)
        await invite.markAsAccepted(newSuperAdmin._id.toString());
        console.log('✅ Invite marked as accepted and consumed');

        // Send approval email to owner (secure - not exposed to frontend)
        const ownerEmail = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

        if (!ownerEmail) {
            console.error('❌ OWNER_EMAIL not configured in environment variables');
            return NextResponse.json({ success: false, error: 'Email service not configured. Contact administrator.' }, { status: 500 });
        }

        console.log('📧 Sending approval email to owner:', ownerEmail);

        const emailSent = await sendSuperAdminApprovalEmail(ownerEmail, {
            name,
            email,
            organizationName,
            organizationKey: newSuperAdmin.organizationKey,
            id: newSuperAdmin._id.toString(),
        });

        if (!emailSent) {
            console.error('❌ Failed to send approval email to owner');
            // Registration is saved but email failed
            return NextResponse.json({
                success: true,
                needsApproval: true,
                emailSent: false,
                message: 'Registration saved but email failed to send. Please contact administrator.',
                user: {
                    id: newSuperAdmin._id,
                    email: newSuperAdmin.email,
                    name: newSuperAdmin.name,
                    organizationKey: newSuperAdmin.organizationKey,
                },
            });
        }

        console.log('✅ Approval email sent successfully to owner');

        // Create notification for owner dashboard
        try {
            const notificationResult = await createOwnerNotification({
                type: 'approval_request',
                title: 'New SuperAdmin Registration',
                message: `${name} from "${organizationName}" has registered and is waiting for approval.`,
                relatedUser: {
                    id: newSuperAdmin._id.toString(),
                    name: name,
                    email: email,
                    role: 'superadmin',
                },
                metadata: {
                    organizationName,
                    organizationKey: newSuperAdmin.organizationKey,
                    industry,
                    website,
                    companySize,
                    country,
                    inviteId: invite._id?.toString() || 'unknown',
                    inviteAcceptedAt: new Date().toISOString(),
                    registeredAt: new Date().toISOString(),
                },
                priority: 'high',
                actionRequired: true,
                actionUrl: '/owner-dashboard',
            });

            if (notificationResult) {
                console.log('✅ Owner dashboard notification created successfully:', notificationResult._id);
            } else {
                console.error('⚠️ Notification creation returned null');
            }
        } catch (notificationError) {
            console.error('❌ Failed to create owner notification:', notificationError);
            // Don't fail the whole request if notification fails
        }

        return NextResponse.json({
            success: true,
            needsApproval: true,
            emailSent: true,
            message: 'Registration successful! Approval request sent to owner.',
            user: {
                id: newSuperAdmin._id,
                email: newSuperAdmin.email,
                name: newSuperAdmin.name,
                organizationKey: newSuperAdmin.organizationKey,
                organizationName: newSuperAdmin.organizationName,
                tenantId: newSuperAdmin.tenantId,
                hostname: newSuperAdmin.hostname,
                approvalStatus: 'pending',
            },
        });
    } catch (error: any) {
        console.error('SuperAdmin registration error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);

        // Return detailed error message
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Registration failed. Please try again.',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
