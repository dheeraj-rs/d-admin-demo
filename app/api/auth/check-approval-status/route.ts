import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { createToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Missing registration ID' },
                { status: 400 }
            );
        }

        await connectDB();

        const superAdmin = await SuperAdmin.findById(id).select('approvalStatus approvedAt email name organizationKey');

        if (!superAdmin) {
            return NextResponse.json(
                { success: false, error: 'Registration not found' },
                { status: 404 }
            );
        }

        // If approved, generate auth token and set cookie for auto-login
        if (superAdmin.approvalStatus === 'approved') {
            const token = await createToken(superAdmin._id.toString(), {
                email: superAdmin.email,
                name: superAdmin.name,
                role: 'superadmin',
                organizationKey: superAdmin.organizationKey,
            });

            const response = NextResponse.json({
                success: true,
                approvalStatus: superAdmin.approvalStatus,
                approvedAt: superAdmin.approvedAt,
                token: token, // Send token to frontend as well
            });

            // Set auth cookie for auto-login
            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24, // 24 hours
            });

            return response;
        }

        // For pending/rejected, return status only
        return NextResponse.json({
            success: true,
            approvalStatus: superAdmin.approvalStatus,
            approvedAt: superAdmin.approvedAt,
        });
    } catch (error: any) {
        console.error('Error checking approval status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check approval status' },
            { status: 500 }
        );
    }
}
