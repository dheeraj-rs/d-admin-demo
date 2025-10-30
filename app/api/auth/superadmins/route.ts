import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSuperAdmins } from '../../../../lib/google-auth';

export async function GET(request: NextRequest) {
    try {
        const superAdmins = await getAvailableSuperAdmins();

        return NextResponse.json({
            success: true,
            superAdmins,
        });
    } catch (error) {
        console.error('Error getting SuperAdmins:', error);
        return NextResponse.json({ error: 'Failed to get SuperAdmins' }, { status: 500 });
    }
}
