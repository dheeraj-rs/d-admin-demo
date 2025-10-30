import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../../lib/data-isolation';
import { getTenantAIWebsiteModel } from '../../../../lib/tenant-models';

export const dynamic = 'force-dynamic';

// GET - Fetch a single AI website by ID (ORGANIZATION-SPECIFIC)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // CRITICAL: Authenticate user
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get organization key
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific model
        const AIWebsite = await getTenantAIWebsiteModel(organizationKey);

        // Find website (no organizationKey filter needed - separate database!)
        const website = await AIWebsite.findById(id).lean();

        if (!website) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Website not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: website,
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch AI website' }, { status: 500 });
    }
}

// PUT - Update an AI website (ORGANIZATION-SPECIFIC)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // CRITICAL: Authenticate user
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await request.json();

        // Get organization key
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific model
        const AIWebsite = await getTenantAIWebsiteModel(organizationKey);

        // Validate required fields
        if (!data.name || !data.url) {
            return NextResponse.json({ success: false, error: 'Name and URL are required' }, { status: 400 });
        }

        // Find existing website (no organizationKey filter needed - separate database!)
        const existingWebsite = await AIWebsite.findById(id);

        if (!existingWebsite) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Website not found',
                },
                { status: 404 }
            );
        }

        // Check if another website with same URL exists (excluding current website)
        const duplicateWebsite = await AIWebsite.findOne({
            url: data.url,
            _id: { $ne: id },
        });

        if (duplicateWebsite) {
            return NextResponse.json({ success: false, error: 'Another website with this URL already exists in your organization' }, { status: 409 });
        }

        console.log('🔒 AI Websites PUT - Updating website:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            websiteId: id,
        });

        const updatedWebsite = await AIWebsite.findByIdAndUpdate(id, data, { new: true, runValidators: true });

        return NextResponse.json({
            success: true,
            data: updatedWebsite,
            message: 'Website updated successfully',
        });
    } catch (error: any) {
        console.error('Error updating AI website:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to update AI website' }, { status: 500 });
    }
}

// DELETE - Delete an AI website (ORGANIZATION-SPECIFIC)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // CRITICAL: Authenticate user
        const { authenticated, user, error } = await authenticate(request);

        if (!authenticated || !user) {
            return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get organization key
        const organizationKey = getOrganizationKey(user);

        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific model
        const AIWebsite = await getTenantAIWebsiteModel(organizationKey);

        // Find existing website (no organizationKey filter needed - separate database!)
        const existingWebsite = await AIWebsite.findById(id);

        if (!existingWebsite) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Website not found',
                },
                { status: 404 }
            );
        }

        console.log('🔒 AI Websites DELETE - Deleting website:', {
            userEmail: user.email,
            userRole: user.role,
            organizationKey,
            websiteId: id,
        });

        const deletedWebsite = await AIWebsite.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Website deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting AI website:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to delete AI website' }, { status: 500 });
    }
}
