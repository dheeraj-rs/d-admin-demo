import { NextRequest, NextResponse } from 'next/server';
import { connectDB as dbConnect } from '../../../../../lib/mongodb';
import OwnerNotification from '../../../../../models/OwnerNotification';
import { requireOwnerAuth } from '../../../../../lib/owner-auth-middleware';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        const notification = await OwnerNotification.findByIdAndUpdate(
            id,
            { ...body, readAt: body.isRead ? new Date() : undefined },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json(
                { success: false, error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: notification,
        });
    } catch (error: any) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await dbConnect();

        const { id } = await params;
        const notification = await OwnerNotification.findByIdAndDelete(id);

        if (!notification) {
            return NextResponse.json(
                { success: false, error: 'Notification not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
