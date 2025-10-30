import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Owner from '../../../../models/Owner';
import { getOwnerSession } from '../../../../lib/ownerAuth';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

export async function GET(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        // Get owner email from session or headers
        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';

        let owner = await Owner.findOne({ email: ownerEmail });

        if (!owner) {
            // Create default owner if doesn't exist
            owner = await Owner.create({
                email: ownerEmail,
                name: 'Owner',
                googleId: ownerEmail,
                backupKeys: [],
                config: {},
            });
        }

        // Return relevant data
        const data = {
            email: owner.email,
            name: owner.name,
            twoFactorEnabled: owner.twoFactorEnabled,
            backupKeys: owner.backupKeys,
            config: owner.config || {},
            lastLogin: owner.lastLogin,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt,
        };

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        const body = await request.json();

        const owner = await Owner.findOneAndUpdate({ email: ownerEmail }, body, { new: true, upsert: true });

        return NextResponse.json({
            success: true,
            data: owner,
        });
    } catch (error: any) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
    }
}
