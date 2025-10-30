import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdminInvite from '../../../../models/AdminInvite';

/**
 * API endpoint to validate SuperAdmin invite tokens
 * This ensures only valid, non-expired tokens can be used for registration
 */
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token || typeof token !== 'string') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Invalid token format' 
                },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if invite token is valid
        const invite = await SuperAdminInvite.isValidInvite(token);

        if (!invite) {
            // Check if token exists but is expired or already used
            const existingInvite = await SuperAdminInvite.findOne({ token: token });
            
            if (existingInvite) {
                if (existingInvite.status === 'accepted') {
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: 'This invitation has already been used',
                            code: 'INVITE_ALREADY_USED'
                        },
                        { status: 403 }
                    );
                } else if (existingInvite.status === 'expired' || existingInvite.expiresAt < new Date()) {
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: 'This invitation has expired. Please contact the owner for a new invitation.',
                            code: 'INVITE_EXPIRED'
                        },
                        { status: 403 }
                    );
                } else if (existingInvite.status === 'cancelled') {
                    return NextResponse.json(
                        { 
                            success: false, 
                            error: 'This invitation has been cancelled',
                            code: 'INVITE_CANCELLED'
                        },
                        { status: 403 }
                    );
                }
            }

            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Invalid or expired invitation link',
                    code: 'INVITE_INVALID'
                },
                { status: 404 }
            );
        }

        // Return invite details (excluding sensitive data)
        return NextResponse.json({
            success: true,
            invite: {
                invitedEmail: invite.email, // Field is called 'email' in the model
                expiresAt: invite.expiresAt,
                createdAt: invite.createdAt,
            },
        });
    } catch (error: any) {
        console.error('❌ Error validating invite token:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Internal server error',
                code: 'SERVER_ERROR'
            },
            { status: 500 }
        );
    }
}
