import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import OwnerAccessToken from '../../../../models/OwnerAccessToken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED - Only owner can generate access tokens
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const body = await request.json();
        const { 
            superAdminId, 
            ownerEmail, 
            accessMode = 'emergency', // 'owner', 'superadmin', or 'emergency'
            oneTimeUse = true, // Default to one-time use
            maxUses = 1, // Default to single use
            expiryDays = 7 // Default to 7 days
        } = body;

        if (!superAdminId || !ownerEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify super admin exists
        const superAdmin = await SuperAdmin.findById(new mongoose.Types.ObjectId(superAdminId));
        
        if (!superAdmin) {
            return NextResponse.json(
                { error: 'Super Admin not found' },
                { status: 404 }
            );
        }

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Set expiration based on expiryDays parameter
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        // Create access token record
        const accessToken = await OwnerAccessToken.create({
            token,
            superAdminId: superAdmin._id,
            superAdminEmail: superAdmin.email,
            superAdminName: superAdmin.name || 'Unknown',
            organizationKey: superAdmin.organizationKey,
            createdBy: ownerEmail,
            expiresAt,
            isActive: true,
            usedCount: 0,
            accessMode,
            oneTimeUse,
            maxUses,
        });

        // Generate the access URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const accessUrl = `${baseUrl}/owner-access?token=${token}`;

        return NextResponse.json({
            success: true,
            data: {
                token,
                accessUrl,
                expiresAt: expiresAt.toISOString(),
                superAdminName: superAdmin.name,
                superAdminEmail: superAdmin.email,
                accessMode,
                oneTimeUse,
                maxUses,
            },
        });
    } catch (error) {
        console.error('Error generating access token:', error);
        return NextResponse.json(
            { error: 'Failed to generate access token' },
            { status: 500 }
        );
    }
}

// GET endpoint to list all active tokens for a super admin
export async function GET(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        const superAdminId = searchParams.get('superAdminId');

        if (!superAdminId) {
            return NextResponse.json(
                { error: 'Super Admin ID required' },
                { status: 400 }
            );
        }

        await connectDB();

        const tokens = await OwnerAccessToken.find({
            superAdminId: new mongoose.Types.ObjectId(superAdminId),
            isActive: true,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: tokens.map(t => ({
                _id: t._id.toString(),
                token: t.token,
                expiresAt: t.expiresAt,
                usedCount: t.usedCount,
                lastUsedAt: t.lastUsedAt,
                createdAt: t.createdAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching access tokens:', error);
        return NextResponse.json(
            { error: 'Failed to fetch access tokens' },
            { status: 500 }
        );
    }
}

// DELETE endpoint to revoke a token
export async function DELETE(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        const tokenId = searchParams.get('tokenId');

        if (!tokenId) {
            return NextResponse.json(
                { error: 'Token ID required' },
                { status: 400 }
            );
        }

        await connectDB();

        await OwnerAccessToken.updateOne(
            { _id: new mongoose.Types.ObjectId(tokenId) },
            { $set: { isActive: false } }
        );

        return NextResponse.json({
            success: true,
            message: 'Access token revoked successfully',
        });
    } catch (error) {
        console.error('Error revoking access token:', error);
        return NextResponse.json(
            { error: 'Failed to revoke access token' },
            { status: 500 }
        );
    }
}
