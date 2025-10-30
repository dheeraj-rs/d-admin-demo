import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import AdminInvite from '../../../../models/AdminInvite';
import { authenticate } from '../../../../lib/auth-middleware';

// DELETE - Cancel/delete an invite
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (authResult.user.role !== 'superadmin') {
            return NextResponse.json(
                { success: false, error: 'Forbidden: Only superadmins can delete invites' },
                { status: 403 }
            );
        }

        await connectDB();

        const { id } = await params;

        // Find and delete invite (only if it belongs to this superadmin)
        const invite = await AdminInvite.findOneAndDelete({
            _id: id,
            superAdminId: authResult.user.userId,
        });

        if (!invite) {
            return NextResponse.json(
                { success: false, error: 'Invite not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Invite deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting invite:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete invite' },
            { status: 500 }
        );
    }
}
