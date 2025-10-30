import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Owner from '../../../../../models/Owner';
import { requireOwnerAuth } from '../../../../../lib/owner-auth-middleware';

// Generate backup key in format like "DGS546SDG" (9 characters, alphanumeric uppercase)
function generateBackupKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 9; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED - Critical: Only owner can generate backup keys
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';

        // Generate 6 backup keys in short format
        const generatedKeys = [];
        for (let i = 0; i < 6; i++) {
            generatedKeys.push({
                key: generateBackupKey(),
                generatedAt: new Date(),
                isActive: true,
            });
        }

        // Update owner with new backup keys (clear old ones and add new)
        const owner = await Owner.findOneAndUpdate(
            { email: ownerEmail },
            {
                $set: {
                    backupKeys: generatedKeys,
                },
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({
            success: true,
            data: {
                keys: generatedKeys.map((k) => k.key),
                owner,
            },
        });
    } catch (error: any) {
        console.error('Error generating backup key:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
