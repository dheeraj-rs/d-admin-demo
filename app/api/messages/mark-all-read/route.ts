import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../../lib/data-isolation';
import { getTenantMessageModel } from '../../../../lib/tenant-models';

// POST - Mark all messages as read for current user
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
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

        // Build query based on user role and ID
        const query: any = {
            $or: [
                { recipientRole: 'all' },
                { recipientRole: user.role },
                { recipientId: user.userId }
            ],
            isRead: false
        };

        const result = await Message.updateMany(query, { isRead: true });

        return NextResponse.json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}
