import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Owner from '../../../../models/Owner';
import bcrypt from 'bcryptjs';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

/**
 * POST - Verify owner password for critical operations
 */
export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ success: false, error: 'Password is required' }, { status: 400 });
        }

        await connectDB();

        // Get owner from database
        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        const owner = await Owner.findOne({ email: ownerEmail }).select('+password +passwordRequired');

        if (!owner) {
            return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 404 });
        }

        // Check if password is required
        if (owner.passwordRequired === false) {
            return NextResponse.json({
                success: true,
                message: 'Password not required',
            });
        }

        // If owner has password in DB, verify against it
        if (owner.password) {
            const isValid = await bcrypt.compare(password, owner.password);

            if (!isValid) {
                return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
            }
        } else {
            // No password in DB, check against env variable
            const envPassword = process.env.OWNER_PASSWORD;

            if (!envPassword) {
                return NextResponse.json({ success: false, error: 'No password configured. Please set a password first.' }, { status: 400 });
            }

            if (password !== envPassword) {
                return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Password verified successfully',
        });
    } catch (error: any) {
        console.error('Error verifying owner password:', error);
        return NextResponse.json({ success: false, error: 'Failed to verify password' }, { status: 500 });
    }
}
