import { NextRequest, NextResponse } from 'next/server';
import { getPlanContext, getAccountUsageSummary } from '../../../../lib/plan-middleware';

export async function GET(request: NextRequest) {
    try {
        const context = await getPlanContext(request);
        if (!context) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const usageSummary = await getAccountUsageSummary(context);

        return NextResponse.json({
            success: true,
            usage: usageSummary,
        });
    } catch (error) {
        console.error('Error getting account usage:', error);
        return NextResponse.json({ error: 'Failed to get usage information' }, { status: 500 });
    }
}
