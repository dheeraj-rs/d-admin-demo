import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth-middleware';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';

/**
 * Test endpoint to check current user's plan status
 * GET /api/test/check-plan
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticate(request);

        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Not authenticated',
                },
                { status: 401 }
            );
        }

        await connectDB();
        const user = await User.findById(authResult.user.userId).select('-pin');

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                userId: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive,
                // User model is legacy - these fields don't exist
                plan: 'FREE',
                tier: 'free',
            },
        });
    } catch (error: any) {
        console.error('Error checking plan:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to check plan',
            },
            { status: 500 }
        );
    }
}
