import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import UsedAccessKey from '../../../../models/UsedAccessKey';

/**
 * Admin endpoint to check which access keys are available/used
 * This helps track key usage and manage SuperAdmin registrations
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get all valid keys from environment
        const validKeysString = process.env.SUPERADMIN_ACCESS_KEYS || '';
        const allKeys = validKeysString.split(',').map(key => key.trim()).filter(key => key !== '');

        if (allKeys.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No access keys configured',
            }, { status: 500 });
        }

        // Get all used keys from database
        const usedKeysData = await UsedAccessKey.find({}).select('accessKey usedBy usedAt');

        const usedKeys = usedKeysData.map(item => item.accessKey);
        const availableKeys = allKeys.filter(key => !usedKeys.includes(key));

        // Create detailed usage information
        const keyUsageDetails = usedKeysData.map(item => ({
            key: item.accessKey,
            usedBy: {
                name: item.usedBy.name,
                email: item.usedBy.email,
                organizationName: item.usedBy.organizationName,
            },
            usedAt: item.usedAt,
        }));

        return NextResponse.json({
            success: true,
            summary: {
                totalKeys: allKeys.length,
                usedKeys: usedKeys.length,
                availableKeys: availableKeys.length,
            },
            availableKeys: availableKeys.map(key => ({
                key,
                status: 'available',
            })),
            usedKeys: keyUsageDetails,
        });
    } catch (error: any) {
        console.error('Check keys error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check keys' },
            { status: 500 }
        );
    }
}
