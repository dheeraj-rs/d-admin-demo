import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Account from '../../../../models/Account';
import { getTenantIdFromHeaders, requireTenantContext } from '../../../../lib/tenant-middleware';
import { jwtVerify } from 'jose';

/**
 * GET /api/tenant/accounts
 * Get all accounts for the authenticated admin's tenant
 * 
 * TENANT ISOLATION:
 * - Automatically filters by tenantId from admin's token
 * - Only returns accounts belonging to the admin's tenant
 * - Complete data isolation between tenants
 */
export async function GET(request: NextRequest) {
    try {
        // Get admin token from cookie
        const token = request.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify JWT and extract admin data
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(token, secret);
        
        const adminData = payload as any;
        
        // Validate admin has tenantId
        if (!adminData.tenantId) {
            return NextResponse.json(
                { success: false, error: 'Invalid admin token - missing tenant information' },
                { status: 403 }
            );
        }

        await connectDB();

        // CRITICAL: Filter by tenantId for complete isolation
        const accounts = await Account.find({
            tenantId: adminData.tenantId,
        })
        .select('-__v')
        .sort({ createdAt: -1 })
        .lean();

        // Group accounts by plan
        const accountsByPlan = {
            FREE: accounts.filter(acc => acc.plan === 'FREE'),
            PRO: accounts.filter(acc => acc.plan === 'PRO'),
            MAX: accounts.filter(acc => acc.plan === 'MAX'),
        };

        return NextResponse.json({
            success: true,
            data: {
                total: accounts.length,
                accounts,
                accountsByPlan: {
                    FREE: accountsByPlan.FREE.length,
                    PRO: accountsByPlan.PRO.length,
                    MAX: accountsByPlan.MAX.length,
                },
                tenantId: adminData.tenantId,
                organizationName: adminData.organizationName,
            },
        });
    } catch (error: any) {
        console.error('❌ Error fetching tenant accounts:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch accounts' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tenant/accounts
 * Create a new account for the authenticated admin's tenant
 * 
 * TENANT ISOLATION:
 * - Automatically assigns tenantId from admin's token
 * - Account is created within admin's tenant
 * - Cannot create accounts for other tenants
 */
export async function POST(request: NextRequest) {
    try {
        // Get admin token from cookie
        const token = request.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Verify JWT and extract admin data
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(token, secret);
        
        const adminData = payload as any;
        
        // Validate admin has tenantId
        if (!adminData.tenantId) {
            return NextResponse.json(
                { success: false, error: 'Invalid admin token - missing tenant information' },
                { status: 403 }
            );
        }

        const { googleId, email, name, plan, profilePicture } = await request.json();

        // Validate required fields
        if (!googleId || !email || !name || !plan) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if account already exists in this tenant
        const existingAccount = await Account.findOne({
            tenantId: adminData.tenantId,
            email: email.toLowerCase(),
        });

        if (existingAccount) {
            return NextResponse.json(
                { success: false, error: 'Account already exists in your organization' },
                { status: 409 }
            );
        }

        // CRITICAL: Create account with tenantId for isolation
        const account = await Account.create({
            googleId,
            email: email.toLowerCase(),
            name,
            profilePicture,
            role: 'account',
            plan: plan.toUpperCase(),
            isPlanActive: true,
            planStartDate: new Date(),
            
            // Tenant association - CRITICAL for isolation
            tenantId: adminData.tenantId,
            adminId: adminData.id,
            organizationKey: adminData.organizationKey,
            
            // Default values
            features: [],
            usage: {
                apiCalls: 0,
                storageUsed: 0,
                downloads: 0,
            },
            limits: {
                maxApiCalls: plan === 'FREE' ? 1000 : plan === 'PRO' ? 10000 : 100000,
                maxStorage: plan === 'FREE' ? 100 : plan === 'PRO' ? 1000 : 10000,
                maxDownloads: plan === 'FREE' ? 10 : plan === 'PRO' ? 100 : 1000,
                maxPages: plan === 'FREE' ? 5 : plan === 'PRO' ? 50 : 500,
            },
            isActive: true,
            isApproved: true,
        });

        console.log(`✅ Account created in tenant ${adminData.tenantId}: ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
            data: {
                accountId: account._id,
                email: account.email,
                name: account.name,
                plan: account.plan,
                tenantId: account.tenantId,
            },
        });
    } catch (error: any) {
        console.error('❌ Error creating tenant account:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create account' },
            { status: 500 }
        );
    }
}
