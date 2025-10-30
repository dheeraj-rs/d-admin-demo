import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../../lib/data-isolation';
import { getTenantMessageModel } from '../../../../lib/tenant-models';

// PUT - Update a message (mark as read, or edit if admin)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;

        // Get organization key
        const organizationKey = getOrganizationKey(user);
        
        // Only owner and superadmin need organization key
        if ((user.role === 'owner' || user.role === 'superadmin') && !organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // For regular users without organization key, use a default tenant
        const tenantKey = organizationKey || 'default';

        // Get tenant-specific Message model
        const Message = await getTenantMessageModel(
            tenantKey,
            `${user.name}|${user.userId}`
        );

        const { id } = await params;
        const body = await request.json();
        const { isRead, title, description, icon, recipientId, recipientRole, type, category, link } = body;

        // If only marking as read, allow any authenticated user
        if (isRead !== undefined && Object.keys(body).length === 1) {
            const message = await Message.findByIdAndUpdate(id, { isRead }, { new: true });

            if (!message) {
                return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: message,
            });
        }

        // For other updates, require superadmin role
        if (user.role !== 'superadmin') {
            return NextResponse.json({ success: false, error: 'Forbidden: Only superadmins can edit messages' }, { status: 403 });
        }

        const updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (icon) updateData.icon = icon;
        if (recipientId !== undefined) updateData.recipientId = recipientId;
        if (recipientRole) updateData.recipientRole = recipientRole;
        if (type) updateData.type = type;
        if (category) updateData.category = category;
        if (link !== undefined) updateData.link = link;

        const message = await Message.findByIdAndUpdate(id, updateData, { new: true });

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 });
    }
}

// DELETE - Delete a message (admin/superadmin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;

        if (user.role !== 'superadmin') {
            return NextResponse.json({ success: false, error: 'Forbidden: Only superadmins can delete messages' }, { status: 403 });
        }

        // Get organization key
        const organizationKey = getOrganizationKey(user);
        
        // Superadmin must have organization key
        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific Message model
        const Message = await getTenantMessageModel(
            organizationKey,
            `${user.name}|${user.userId}`
        );

        const { id } = await params;

        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete message' }, { status: 500 });
    }
}
