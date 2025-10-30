import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Owner from '../../../../models/Owner';
import bcrypt from 'bcryptjs';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

/**
 * GET - Get password settings status
 */
export async function GET(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        const owner = await Owner.findOne({ email: ownerEmail }).select('+password passwordRequired');

        if (!owner) {
            return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                passwordRequired: owner.passwordRequired !== false, // Default to true
                hasPassword: !!owner.password,
            },
        });
    } catch (error: any) {
        console.error('Error fetching password settings:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

/**
 * POST - Set or update owner password
 */
export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { success: false, error: 'New password must be at least 6 characters' },
                { status: 400 }
            );
        }

        await connectDB();

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        const owner = await Owner.findOne({ email: ownerEmail }).select('+password');

        if (!owner) {
            return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 404 });
        }

        // If owner has existing password, verify current password
        if (owner.password) {
            if (!currentPassword) {
                return NextResponse.json(
                    { success: false, error: 'Current password is required' },
                    { status: 400 }
                );
            }

            const isValid = await bcrypt.compare(currentPassword, owner.password);
            if (!isValid) {
                return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
            }
        } else {
            // First time setting password - verify with env variable
            const envPassword = process.env.OWNER_PASSWORD;
            if (envPassword && currentPassword !== envPassword) {
                return NextResponse.json(
                    { success: false, error: 'Invalid verification password' },
                    { status: 401 }
                );
            }
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        owner.password = hashedPassword;
        owner.passwordRequired = true;
        await owner.save();

        return NextResponse.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating password:', error);
        return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 });
    }
}

/**
 * PATCH - Toggle password requirement
 */
export async function PATCH(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const body = await request.json();
        const { passwordRequired, verificationPassword } = body;

        if (typeof passwordRequired !== 'boolean') {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
        }

        await connectDB();

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        const owner = await Owner.findOne({ email: ownerEmail }).select('+password');

        if (!owner) {
            return NextResponse.json({ success: false, error: 'Owner not found' }, { status: 404 });
        }

        // Verify password before toggling
        if (owner.password) {
            if (!verificationPassword) {
                return NextResponse.json(
                    { success: false, error: 'Password verification required' },
                    { status: 400 }
                );
            }

            const isValid = await bcrypt.compare(verificationPassword, owner.password);
            if (!isValid) {
                return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
            }
        } else {
            // Verify with env variable
            const envPassword = process.env.OWNER_PASSWORD;
            if (envPassword && verificationPassword !== envPassword) {
                return NextResponse.json({ success: false, error: 'Invalid verification password' }, { status: 401 });
            }
        }

        owner.passwordRequired = passwordRequired;
        await owner.save();

        return NextResponse.json({
            success: true,
            message: `Password requirement ${passwordRequired ? 'enabled' : 'disabled'}`,
            data: { passwordRequired },
        });
    } catch (error: any) {
        console.error('Error toggling password requirement:', error);
        return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
}
