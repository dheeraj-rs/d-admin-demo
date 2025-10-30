import { NextRequest, NextResponse } from 'next/server';
import { verifyPlanAuth, createPlanAuthToken } from '../../../../lib/plan-auth';
import { connectDB } from '../../../../lib/mongodb';
import SuperAdmin from '../../../../models/SuperAdmin';
import { getTenantConnection } from '../../../../lib/tenant-db-connect';
import { AccountSchema, IAccount } from '../../../../models/Account';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('plan_auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
        }

        const { authenticated, payload } = await verifyPlanAuth(token);

        if (!authenticated || !payload) {
            return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
        }

        // For development, return mock account data
        const mockAccount = {
            id: payload.userId,
            email: payload.email,
            name: payload.name,
            plan: payload.plan,
            features: payload.features,
            usage: {
                apiCalls: 0,
                storageUsed: 0,
                downloads: 0,
                lastActivity: new Date(),
            },
            limits: {
                maxApiCalls: 100,
                maxStorage: 100,
                maxDownloads: 10,
                maxPages: 5,
            },
            isPlanActive: payload.isPlanActive,
            planEndDate: payload.planEndDate,
        };

        return NextResponse.json({
            success: true,
            account: mockAccount,
        });
    } catch (error) {
        console.error('Plan auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { googleId, superAdminId } = await request.json();

        if (!googleId || !superAdminId) {
            return NextResponse.json({ error: 'Google ID and SuperAdmin ID are required' }, { status: 400 });
        }

        await connectDB();

        // Get SuperAdmin
        const superAdmin = await SuperAdmin.findById(superAdminId);
        if (!superAdmin || !superAdmin.isActive) {
            return NextResponse.json({ error: 'SuperAdmin not found or inactive' }, { status: 404 });
        }

        // Get tenant connection
        const tenantConnection = await getTenantConnection(superAdminId, superAdmin.organizationName);
        const Account = tenantConnection.model<IAccount>('Account', AccountSchema);

        // Find or create account
        let account = await Account.findOne({ googleId });

        if (!account) {
            return NextResponse.json({ error: 'Account not found. Please register first.' }, { status: 404 });
        }

        // Check if plan is active
        const isPlanActive = account.plan === 'FREE' || (account.planEndDate ? new Date() < account.planEndDate : false);

        // Create auth token
        const authPayload = {
            userId: account._id.toString(),
            email: account.email,
            name: account.name,
            role: 'user' as const,
            superAdminId: superAdminId,
            organizationKey: superAdmin.organizationKey,
            plan: account.plan,
            features: account.features,
            isPlanActive: Boolean(isPlanActive),
            planEndDate: account.planEndDate ? account.planEndDate.getTime() : undefined,
        };

        const token = await createPlanAuthToken(authPayload);

        // Set cookie
        const response = NextResponse.json({
            success: true,
            account: {
                id: account._id,
                email: account.email,
                name: account.name,
                plan: account.plan,
                features: account.features,
                usage: account.usage,
                limits: account.limits,
                isPlanActive: isPlanActive,
                planEndDate: account.planEndDate,
            },
        });

        response.cookies.set('plan_auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60, // 24 hours
        });

        return response;
    } catch (error) {
        console.error('Plan auth error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
