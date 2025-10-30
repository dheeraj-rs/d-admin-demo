import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdminOrAdmin, authenticate } from '../../../lib/auth-middleware';
import { getOrganizationKey, logDataAccess, createUnauthorizedResponse } from '../../../lib/data-isolation';
import { getTenantDataStoreModel } from '../../../lib/tenant-models';
import { initializeTenantDatabase } from '../../../lib/tenant-db-connect';

// GET - Fetch all data for organization
export async function GET(request: NextRequest) {
    try {
        const { authorized, user, error } = await requireSuperAdminOrAdmin(request);

        if (!authorized || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const dataType = searchParams.get('dataType');
        const category = searchParams.get('category');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        // Get organization key with validation
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific database model (use name|userId for database naming)
        const DataStore = await getTenantDataStoreModel(
            organizationKey,
            `${user.name}|${user.userId}` // Format: name|userId for shorter DB names
        );

        // Build query - NO organizationKey filter needed (separate database!)
        let query: any = {};

        if (!includeDeleted) {
            query.isDeleted = false;
        }

        if (dataType) {
            query.dataType = dataType;
        }

        if (category) {
            query.category = category;
        }

        console.log('🔒 DataStore GET - Tenant Database:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            database: `d-admin-${user.email.replace('@', '-').replace(/\./g, '-')}`,
            query,
        });

        const data = await DataStore.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data,
            count: data.length,
        });
    } catch (error: any) {
        console.error('DataStore GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}

// POST - Create new data
export async function POST(request: NextRequest) {
    try {
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { dataType, category, data, title, description, tags, isPublic } = body;

        if (!dataType || !data) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Get organization key with validation
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific database model (use name|userId for database naming)
        const DataStore = await getTenantDataStoreModel(
            organizationKey,
            `${user.name}|${user.userId}` // Format: name|userId for shorter DB names
        );

        // Initialize tenant database if this is the first time
        await initializeTenantDatabase(organizationKey, `${user.name}|${user.userId}`);

        console.log('🔒 DataStore POST - Creating data in tenant database:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            database: `d-admin-${user.email.replace('@', '-').replace(/\./g, '-')}`,
            dataType,
        });

        const newData = new DataStore({
            // superAdminKey NOT needed - data is in separate database!
            dataType,
            category,
            data,
            title,
            description,
            tags,
            isPublic: isPublic || false,
            createdBy: {
                userId: user.userId,
                userType: user.role,
                userName: user.name,
                userEmail: user.email,
            },
        });

        await newData.save();

        // Log data creation for audit
        logDataAccess(user, 'CREATE', 'DataStore', newData._id.toString(), organizationKey);

        return NextResponse.json({
            success: true,
            message: 'Data created successfully',
            data: newData,
        });
    } catch (error: any) {
        console.error('DataStore POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create data' }, { status: 500 });
    }
}

// PUT - Update existing data
export async function PUT(request: NextRequest) {
    try {
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, data, title, description, tags, category } = body;

        if (!id) {
            return NextResponse.json({ success: false, error: 'Data ID is required' }, { status: 400 });
        }

        // Get organization key with validation
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific database model (use name|userId for database naming)
        const DataStore = await getTenantDataStoreModel(
            organizationKey,
            `${user.name}|${user.userId}` // Format: name|userId for shorter DB names
        );

        const existingData = await DataStore.findById(id);

        if (!existingData) {
            return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
        }

        // No ownership validation needed - data is in separate database!

        console.log('🔒 DataStore PUT - Updating data in tenant database:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            database: `d-admin-${user.email.replace('@', '-').replace(/\./g, '-')}`,
            dataId: id,
        });

        // Create version before updating
        (existingData as any).createVersion({
            userId: user.userId as any,
            userType: user.role,
            userName: user.name,
        });

        // Update fields
        if (data) (existingData as any).data = data;
        if (title) (existingData as any).title = title;
        if (description) (existingData as any).description = description;
        if (tags) (existingData as any).tags = tags;
        if (category) (existingData as any).category = category;

        (existingData as any).updatedBy = {
            userId: user.userId as any,
            userType: user.role,
            userName: user.name,
            userEmail: user.email,
        };

        await existingData.save();

        return NextResponse.json({
            success: true,
            message: 'Data updated successfully',
            data: existingData,
        });
    } catch (error: any) {
        console.error('DataStore PUT error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 });
    }
}

// DELETE - Soft delete data
export async function DELETE(request: NextRequest) {
    try {
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Data ID is required' }, { status: 400 });
        }

        // Get organization key with validation
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific database model (use name|userId for database naming)
        const DataStore = await getTenantDataStoreModel(
            organizationKey,
            `${user.name}|${user.userId}` // Format: name|userId for shorter DB names
        );

        const existingData = await DataStore.findById(id);

        if (!existingData) {
            return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
        }

        // No ownership validation needed - data is in separate database!

        console.log('🔒 DataStore DELETE - Deleting data from tenant database:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            database: `d-admin-${user.email.replace('@', '-').replace(/\./g, '-')}`,
            dataId: id,
        });

        await (existingData as any).softDelete({
            userId: user.userId as any,
            userType: user.role,
            userName: user.name,
        });

        return NextResponse.json({
            success: true,
            message: 'Data deleted successfully',
        });
    } catch (error: any) {
        console.error('DataStore DELETE error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete data' }, { status: 500 });
    }
}
