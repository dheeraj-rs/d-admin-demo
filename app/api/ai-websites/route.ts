import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../lib/data-isolation';
import { getTenantAIWebsiteModel } from '../../../lib/tenant-models';
import { initializeTenantDatabase } from '../../../lib/tenant-db-connect';

export const dynamic = 'force-dynamic';

// GET - Fetch all AI websites with optional filters (ORGANIZATION-SPECIFIC)
export async function GET(request: NextRequest) {
    try {
        // CRITICAL: Authenticate user
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);

        // Get organization key with validation
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific database model (use name|userId for database naming)
        const AIWebsite = await getTenantAIWebsiteModel(
            organizationKey,
            `${user.name}|${user.userId}` // Format: name|userId for shorter DB names
        );

        // Extract query parameters
        const search = url.searchParams.get('search');
        const category = url.searchParams.get('category');
        const status = url.searchParams.get('status');

        // Build query - NO organizationKey filter needed (separate database!)
        let query: any = {};

        // Add hierarchical filtering based on user role
        if (user.role === 'owner') {
            // Owner sees ALL data across all organizations
            query = {};
        } else if (user.role === 'superadmin') {
            // SuperAdmin sees ALL data in their database
            // No filter needed - entire database belongs to them
            query = {};
        } else {
            // Account sees only their own data
            query.createdByUserId = user.userId;
        }

        // Add search filter (use $and to combine with hierarchical filter)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const hierarchicalFilter = query.$or; // Save hierarchical filter
            delete query.$or; // Remove from query

            query.$and = [
                { $or: hierarchicalFilter }, // Hierarchical filter
                {
                    $or: [{ name: { $regex: searchRegex } }, { description: { $regex: searchRegex } }],
                },
            ];
        }

        // Add category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Add status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        console.log('🔒 AI Websites GET - Organization Filter:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            query,
        });

        // Get ONLY websites for this organization (no auto-assignment)
        const websites = await AIWebsite.find(query).sort({ priority: 1, createdAt: -1 }).lean();

        return NextResponse.json({
            success: true,
            data: websites,
            count: websites.length,
        });
    } catch (error: any) {
        console.error('Error fetching AI websites:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch AI websites' }, { status: 500 });
    }
}

// POST - Create a new AI website (ORGANIZATION-SPECIFIC)
export async function POST(request: NextRequest) {
    try {
        // CRITICAL: Authenticate user
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Get organization key with validation
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific database model (use name|userId for database naming)
        const AIWebsite = await getTenantAIWebsiteModel(
            organizationKey,
            `${user.name}|${user.userId}` // Format: name|userId for shorter DB names
        );

        // Initialize tenant database if this is the first time
        await initializeTenantDatabase(organizationKey, `${user.name}|${user.userId}`);

        // Validate required fields
        if (!data.name || !data.url) {
            return NextResponse.json({ success: false, error: 'Name and URL are required' }, { status: 400 });
        }

        // Check if website with same URL already exists (in tenant database)
        const existingWebsite = await AIWebsite.findOne({
            url: data.url,
            // No organizationKey filter needed - separate database!
        });

        if (existingWebsite) {
            return NextResponse.json({ success: false, error: 'Website with this URL already exists' }, { status: 409 });
        }

        console.log('🔒 AI Websites POST - Creating website:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            websiteName: data.name,
        });

        // Determine hierarchical IDs based on user role
        let createdByUserId = user.userId;
        let createdByUserRole = user.role;
        let parentSuperAdminId = undefined;
        let parentAdminId = undefined;

        if (user.role === 'owner') {
            // Owner creates data
            createdByUserId = user.userId;
            parentSuperAdminId = user.userId; // Self-reference
        } else if (user.role === 'superadmin') {
            // SuperAdmin creates data
            createdByUserId = user.userId;
            parentSuperAdminId = user.userId; // Self-reference
        } else if (user.role === 'account') {
            // Account creates data
            createdByUserId = user.userId;
            // Accounts don't have direct parent references in AuthUser
            // This would need to be fetched from database if needed
            parentAdminId = undefined;
            parentSuperAdminId = organizationKey;
        }

        // Create website with hierarchical tracking (no organizationKey needed - separate DB!)
        const aiWebsite = new AIWebsite({
            ...data,
            // organizationKey NOT needed - data is in separate database!
            createdBy: {
                userId: user.userId,
                userEmail: user.email,
                userName: user.name,
                userRole: user.role,
            },
            // Hierarchical tracking
            createdByUserId: createdByUserId,
            createdByUserRole: createdByUserRole,
            parentSuperAdminId: parentSuperAdminId,
            parentAdminId: parentAdminId,
        });

        await aiWebsite.save();

        return NextResponse.json(
            {
                success: true,
                data: aiWebsite,
                message: 'AI website created successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error creating AI website:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create AI website' }, { status: 500 });
    }
}
