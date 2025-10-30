import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    return NextResponse.json({ success: false, error: 'API key generation is no longer supported in the simplified Owner schema' }, { status: 410 });
}
