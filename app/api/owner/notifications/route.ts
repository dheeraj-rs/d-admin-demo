import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import OwnerNotification from '../../../../models/OwnerNotification';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

export async function GET(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        const notifications = await OwnerNotification.find().sort({ createdAt: -1 }).limit(100);

        return NextResponse.json({
            success: true,
            data: notifications,
        });
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        const body = await request.json();
        const notification = await OwnerNotification.create(body);

        return NextResponse.json({
            success: true,
            data: notification,
        });
    } catch (error: any) {
        console.error('Error creating notification:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
