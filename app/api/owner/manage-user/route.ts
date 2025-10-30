import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import SuperAdmin from '../../../../models/SuperAdmin';
import mongoose from 'mongoose';
import { addLogoutEvent } from '../../../../lib/logout-events';
import DeletionRequest from '../../../../models/DeletionRequest';
import crypto from 'crypto';
import { sendSuperAdminDeletionApprovalEmail } from '../../../../lib/email-service';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

export async function POST(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED - Only owner can manage users
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        const body = await request.json();
        const { userId, action, collection, reason } = body;
        // action: 'approve', 'reject', 'restrict', 'delete', 'activate', 'block', 'unblock'
        // collection: 'users', 'superadmins', 'admins'
        // reason: optional reason for blocking

        if (!userId || !action || !collection) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get the appropriate model
        let Model: any;
        if (collection === 'users') {
            Model = User;
        } else if (collection === 'superadmins') {
            Model = SuperAdmin;
        } else if (collection === 'admins') {
            Model = SuperAdmin;
        } else {
            return NextResponse.json(
                { error: 'Invalid collection' },
                { status: 400 }
            );
        }

        let result: any;

        switch (action) {
            case 'approve':
                result = await Model.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { $set: { approvalStatus: 'approved', isActive: true } }
                );
                break;

            case 'reject':
                result = await Model.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { $set: { approvalStatus: 'rejected', isActive: false } }
                );
                break;

            case 'inactive':
                result = await Model.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { $set: { approvalStatus: 'rejected', isActive: false } }
                );
                break;

            case 'restrict':
                result = await Model.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { $set: { approvalStatus: 'approved', isActive: false } }
                );
                break;

            case 'activate':
                result = await Model.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { $set: { approvalStatus: 'approved', isActive: true } }
                );
                break;

            case 'delete':
                if (collection === 'superadmins') {
                    const ownerEmail = process.env.OWNER_EMAIL || 'owner@example.com';
                    const superAdmin = await SuperAdmin.findById(new mongoose.Types.ObjectId(userId)).lean();
                    if (!superAdmin) {
                        return NextResponse.json(
                            { error: 'SuperAdmin not found' },
                            { status: 404 }
                        );
                    }

                    // Create a pending deletion request
                    const token = crypto.randomBytes(32).toString('hex');
                    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days

                    await DeletionRequest.create({
                        token,
                        targetCollection: 'superadmins',
                        targetId: new mongoose.Types.ObjectId(userId),
                        organizationKey: superAdmin.organizationKey,
                        requestedBy: ownerEmail,
                        status: 'pending',
                        expiresAt,
                    });

                    // Send approval email to owner
                    await sendSuperAdminDeletionApprovalEmail(ownerEmail, {
                        id: userId,
                        name: superAdmin.name,
                        email: superAdmin.email,
                        organizationName: superAdmin.organizationName,
                        organizationKey: superAdmin.organizationKey,
                        token,
                    });

                    return NextResponse.json({
                        success: true,
                        message: `Deletion approval email sent to ${ownerEmail}. Please check your email to approve the permanent deletion.`,
                        requiresApproval: true,
                    });
                } else {
                    result = await Model.deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
                }
                break;

            case 'block':
                result = await Model.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { 
                        $set: { 
                            isBlocked: true,
                            blockedReason: reason || 'Blocked by administrator',
                            blockedAt: new Date(),
                            blockedBy: 'owner' // You can pass owner email from request
                        } 
                    }
                );
                break;

            case 'unblock':
                result = await Model.updateOne(
                    { _id: new mongoose.Types.ObjectId(userId) },
                    { 
                        $set: { isBlocked: false },
                        $unset: { blockedReason: '', blockedAt: '', blockedBy: '' }
                    }
                );
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        if (result.modifiedCount === 0 && result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'User not found or no changes made' },
                { status: 404 }
            );
        }

        // Get the user's email and add logout event
        let userEmail = null;
        if (action === 'inactive' || action === 'restrict' || action === 'block') {
            const user = await Model.findById(new mongoose.Types.ObjectId(userId)).lean();
            if (user) {
                userEmail = user.email;
                const userType = collection === 'superadmins' ? 'superadmin' : collection === 'admins' ? 'admin' : 'user';
                
                // Add logout event to force immediate logout
                addLogoutEvent(userEmail, userType);
                
                const actionType = action === 'block' ? 'BLOCKED' : 'DEACTIVATED';
                console.log(`🚨 Logout event added for ${userEmail} (${userType}) - ${actionType}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `User ${action}ed successfully`,
            deactivatedUser: (action === 'inactive' || action === 'restrict') ? {
                email: userEmail,
                userType: collection === 'superadmins' ? 'superadmin' : collection === 'admins' ? 'admin' : 'user'
            } : null
        });
    } catch (error) {
        console.error('Error managing user:', error);
        return NextResponse.json(
            { error: 'Failed to manage user' },
            { status: 500 }
        );
    }
}
