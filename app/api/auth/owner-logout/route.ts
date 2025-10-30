import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Owner logged out successfully'
        });

        // Clear owner_token cookie
        response.cookies.delete('owner_token');

        return response;
    } catch (error) {
        console.error('Owner logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
}
