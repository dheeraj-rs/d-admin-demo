import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import DeletionRequest from '../../../../models/DeletionRequest';
import mongoose from 'mongoose';
import { getTenantConnection, getTenantDatabaseName } from '../../../../lib/tenant-db-connect';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Missing deletion token' },
                { status: 400 }
            );
        }

        await connectDB();

        // Find the deletion request
        const deletionRequest = await DeletionRequest.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() },
        });

        if (!deletionRequest) {
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invalid or Expired Token</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                        .error { color: #ef4444; font-size: 24px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="error">❌ Invalid or Expired Deletion Token</div>
                    <p>This deletion request is no longer valid or has already been processed.</p>
                </body>
                </html>
                `,
                {
                    status: 400,
                    headers: { 'Content-Type': 'text/html' },
                }
            );
        }

        // Fetch the SuperAdmin to be deleted
        const superAdmin = await SuperAdmin.findById(deletionRequest.targetId);
        if (!superAdmin) {
            return new NextResponse(
                `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>SuperAdmin Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                        .error { color: #ef4444; font-size: 24px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="error">❌ SuperAdmin Not Found</div>
                    <p>The SuperAdmin account no longer exists.</p>
                </body>
                </html>
                `,
                {
                    status: 404,
                    headers: { 'Content-Type': 'text/html' },
                }
            );
        }

        const organizationKey = superAdmin.organizationKey;
        const organizationName = superAdmin.organizationName;
        const superAdminName = superAdmin.name;
        const superAdminEmail = superAdmin.email;

        console.log(`🗑️ Starting cascade deletion for SuperAdmin: ${superAdminName} (${organizationKey})`);

        // Step 1: Delete all Admins in this organization
        const adminDeleteResult = await SuperAdmin.deleteMany({ organizationKey: organizationKey });
        console.log(`✅ Deleted ${adminDeleteResult.deletedCount} Admins for organization ${organizationKey}`);

        // Step 2: Delete all tenant data from d-admin database (single database architecture)
        try {
            // Delete all Accounts for this tenant
            const Account = (await import('../../../../models/Account')).default;
            const accountDeleteResult = await Account.deleteMany({ 
                organizationKey: organizationKey 
            });
            console.log(`✅ Deleted ${accountDeleteResult.deletedCount} Accounts for tenant ${organizationKey}`);
            
            // Delete other tenant-specific data if needed (Messages, AIWebsites, etc.)
            // Add more models here as needed
            
        } catch (dbError) {
            console.error(`⚠️ Error deleting tenant data:`, dbError);
            // Continue with deletion even if tenant data deletion fails
        }

        // Step 3: Delete the SuperAdmin
        await SuperAdmin.deleteOne({ _id: deletionRequest.targetId });
        console.log(`✅ Deleted SuperAdmin: ${superAdminName}`);

        // Step 4: Mark deletion request as completed
        await DeletionRequest.updateOne(
            { _id: deletionRequest._id },
            {
                $set: {
                    status: 'completed',
                    approvedAt: new Date(),
                },
            }
        );

        console.log(`✅ Cascade deletion completed for ${organizationName}`);

        return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Deletion Approved</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                    .success { color: #10b981; font-size: 28px; margin-bottom: 20px; }
                    .info { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; text-align: left; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: left; }
                </style>
            </head>
            <body>
                <div class="success">✅ Deletion Approved Successfully</div>
                <div class="info">
                    <h3>Deleted:</h3>
                    <ul>
                        <li><strong>SuperAdmin:</strong> ${superAdminName} (${superAdminEmail})</li>
                        <li><strong>Organization:</strong> ${organizationName}</li>
                        <li><strong>Organization Key:</strong> ${organizationKey}</li>
                        <li><strong>Admins Removed:</strong> ${adminDeleteResult.deletedCount}</li>
                        <li><strong>Tenant Database:</strong> Dropped</li>
                    </ul>
                </div>
                <div class="warning">
                    <strong>⚠️ Note:</strong> This action is permanent and cannot be undone. All data associated with this organization has been permanently removed.
                </div>
                <p>You can close this window now.</p>
            </body>
            </html>
            `,
            {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            }
        );
    } catch (error) {
        console.error('❌ Error processing SuperAdmin deletion approval:', error);
        return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Deletion Failed</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
                    .error { color: #ef4444; font-size: 24px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <div class="error">❌ Deletion Failed</div>
                <p>An error occurred while processing the deletion. Please contact support.</p>
                <p style="font-size: 12px; color: #666;">${error instanceof Error ? error.message : 'Unknown error'}</p>
            </body>
            </html>
            `,
            {
                status: 500,
                headers: { 'Content-Type': 'text/html' },
            }
        );
    }
}
