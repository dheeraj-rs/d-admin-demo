import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import OwnerNotification from '../../../../../models/OwnerNotification';
import { requireOwnerAuth } from '../../../../../lib/owner-auth-middleware';

export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        await OwnerNotification.updateMany(
            { isRead: false },
            { isRead: true, readAt: new Date() }
        );

        return NextResponse.json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error: any) {
        console.error('Error marking all as read:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
