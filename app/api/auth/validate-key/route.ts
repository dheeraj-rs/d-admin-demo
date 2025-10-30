import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import UsedAccessKey from '../../../../models/UsedAccessKey';

/**
 * Validate access key without using it
 * This allows step-by-step registration
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { accessKey } = body;

        // Validate access key is provided
        if (!accessKey || accessKey.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'Access key is required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get valid access keys from environment
        const validKeysString = process.env.SUPERADMIN_ACCESS_KEYS || '';
        const validKeys = validKeysString.split(',').map(key => key.trim()).filter(key => key !== '');

        if (validKeys.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No access keys configured. Contact administrator.' },
                { status: 500 }
            );
        }

        // Check if provided key is in the valid keys list
        if (!validKeys.includes(accessKey)) {
            return NextResponse.json(
                { success: false, error: 'Invalid access key' },
                { status: 403 }
            );
        }

        // Check if key has already been used
        const isKeyUsed = await UsedAccessKey.isKeyUsed(accessKey);
        if (isKeyUsed) {
            return NextResponse.json(
                { success: false, error: 'This access key has already been used and cannot be reused' },
                { status: 403 }
            );
        }

        // Key is valid and available
        return NextResponse.json({
            success: true,
            message: 'Access key is valid',
        });
    } catch (error: any) {
        console.error('Key validation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to validate access key' },
            { status: 500 }
        );
    }
}
