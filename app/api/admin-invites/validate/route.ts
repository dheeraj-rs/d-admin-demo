import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import AdminInvite from '../../../../models/AdminInvite';

// GET - Validate invite token
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Invite token is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const invite = await AdminInvite.findOne({
            token: token,
            status: 'pending',
            expiresAt: { $gt: new Date() },
        }).lean();

        if (!invite) {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired invite' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                invitedEmail: invite.email,
                superAdminName: invite.invitedBy,
                organizationName: invite.organizationName,
                expiresAt: invite.expiresAt,
            },
        });
    } catch (error: any) {
        console.error('Error validating invite:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to validate invite' },
            { status: 500 }
        );
    }
}
