import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../lib/auth-middleware';
import { getOrganizationKey } from '../../../lib/data-isolation';
import { getTenantMessageModel, initializeTenantDatabase } from '../../../lib/tenant-models';

// GET all messages for the current user
export async function GET(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;

        // Get organization key
        const organizationKey = getOrganizationKey(user);
        
        // Only owner and superadmin need organization key
        // Regular users can access messages without organization isolation
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

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        // Build query based on user role and ID
        // Map 'superadmin' role to 'owner' for message filtering
        const messageRole = user.role === 'superadmin' ? 'owner' : user.role;
        
        const query: any = {
            $or: [
                { recipientRole: 'all' },
                { recipientRole: messageRole },
                { recipientId: user.userId }
            ],
        };

        if (unreadOnly) {
            query.isRead = false;
        }

        console.log('📬 Fetching messages for user (tenant DB):', { 
            userId: user.userId, 
            role: user.role, 
            messageRole,
            tenantKey,
            query 
        });

        // Get messages from tenant database (automatically isolated by organization)
        const messages = await Message.find(query).sort({ timestamp: -1 }).limit(limit).lean();
        
        console.log('📬 Found messages:', messages.length);

        return NextResponse.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST - Create a new message (admin/owner only)
export async function POST(request: NextRequest) {
    try {
        const authResult = await authenticate(request);
        if (!authResult.authenticated || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const user = authResult.user;

        // Only superadmins can create messages
        if (user.role !== 'superadmin') {
            return NextResponse.json({ success: false, error: 'Forbidden: Only superadmins can create messages' }, { status: 403 });
        }

        // Get organization key
        const organizationKey = getOrganizationKey(user);
        if (!organizationKey) {
            return NextResponse.json({ success: false, error: 'Invalid user role or missing organization key' }, { status: 403 });
        }

        // Get tenant-specific Message model
        const Message = await getTenantMessageModel(
            organizationKey,
            `${user.name}|${user.userId}`
        );

        // Initialize tenant database if this is the first time
        await initializeTenantDatabase(organizationKey, `${user.name}|${user.userId}`);

        const body = await request.json();
        const { title, description, icon, recipientId, recipientRole, type, category, link } = body;

        if (!title || !description) {
            return NextResponse.json({ success: false, error: 'Title and description are required' }, { status: 400 });
        }

        const message = await Message.create({
            title,
            description,
            icon: icon || 'pi-bell',
            recipientId,
            recipientRole: recipientRole || 'all',
            type: type || 'info',
            category: category || 'general',
            link,
            createdBy: user.userId,
        });

        return NextResponse.json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ success: false, error: 'Failed to create message' }, { status: 500 });
    }
}
