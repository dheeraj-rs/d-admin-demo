import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get all SuperAdmin requests, sorted by most recent first
        const requests = await SuperAdmin.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .select('name email organizationName approvalStatus createdAt approvedAt approvedBy')
            .lean();

        return NextResponse.json({
            success: true,
            requests: requests,
            count: requests.length,
        });
    } catch (error: any) {
        console.error('Error fetching requests:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch requests',
            },
            { status: 500 }
        );
    }
}
