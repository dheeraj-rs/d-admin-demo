import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import TenantAdmin from '../../../../models/SuperAdmin';
import Account from '../../../../models/Account';
import { requireOwnerAuth } from '../../../../lib/owner-auth-middleware';

export async function GET(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED - Only owner can list all accounts and admins
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        // Fetch all tenant admins (previously called superadmins)
        const tenantAdmins = await TenantAdmin.find({}).lean();

        // Fetch all accounts (plan-based users) from the main database
        // All accounts are now in the same database with tenantId for isolation
        const allAccounts = await Account.find({}).lean();

        return NextResponse.json({
            success: true,
            data: {
                // Accounts (plan-based users: FREE/PRO/MAX)
                accounts: allAccounts.map((acc: any) => ({
                    _id: acc._id.toString(),
                    email: acc.email,
                    name: acc.name,
                    role: acc.role || 'account',
                    plan: acc.plan,
                    tenantId: acc.tenantId,
                    organizationKey: acc.organizationKey,
                    adminId: acc.adminId,
                    isActive: acc.isActive,
                    isPlanActive: acc.isPlanActive,
                    profilePicture: acc.profilePicture,
                    createdAt: acc.createdAt,
                })),
                // Tenant Admins (previously called superadmins)
                admins: tenantAdmins.map((admin: any) => ({
                    _id: admin._id.toString(),
                    email: admin.email,
                    name: admin.name,
                    role: 'admin',
                    organizationName: admin.organizationName,
                    organizationKey: admin.organizationKey,
                    tenantId: admin.tenantId,
                    hostname: admin.hostname,
                    approvalStatus: admin.approvalStatus,
                    isActive: admin.isActive ?? true,
                    isBlocked: admin.isBlocked ?? false,
                    profilePicture: admin.profilePicture,
                    createdAt: admin.createdAt,
                })),
                // Legacy fields for backward compatibility
                users: allAccounts.map((acc: any) => ({
                    _id: acc._id.toString(),
                    email: acc.email,
                    name: acc.name,
                    role: 'account',
                    organizationKey: acc.organizationKey,
                    isActive: acc.isActive,
                    profilePicture: acc.profilePicture,
                    createdAt: acc.createdAt,
                })),
                superadmins: tenantAdmins.map((admin: any) => ({
                    _id: admin._id.toString(),
                    email: admin.email,
                    name: admin.name,
                    organizationName: admin.organizationName,
                    organizationKey: admin.organizationKey,
                    isApproved: admin.approvalStatus === 'approved',
                    isActive: admin.isActive ?? true,
                    profilePicture: admin.profilePicture,
                    createdAt: admin.createdAt,
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
