import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import TenantAdmin from '../../../../../models/SuperAdmin';
import { authenticateRequest } from '../../../../../lib/unified-auth';

/**
 * GET /api/admin/settings/hostname
 * Get current admin hostname settings
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        
        if (!auth.authenticated || auth.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admin authentication required' },
                { status: 401 }
            );
        }

        await connectDB();

        const adminId = auth.payload?.userId;
        if (!adminId) {
            return NextResponse.json(
                { success: false, error: 'Invalid authentication' },
                { status: 401 }
            );
        }

        const admin = await TenantAdmin.findById(adminId);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Admin not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                hostname: admin.hostname || 'localhost:3000',
                organizationName: admin.organizationName,
                tenantId: admin.tenantId,
            },
        });
    } catch (error) {
        console.error('Error fetching hostname settings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch hostname settings' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/settings/hostname
 * Update admin hostname (custom domain)
 */
export async function PUT(request: NextRequest) {
    try {
        const auth = await authenticateRequest(request);
        
        if (!auth.authenticated || auth.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admin authentication required' },
                { status: 401 }
            );
        }

        const { hostname } = await request.json();

        if (!hostname || typeof hostname !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Valid hostname is required' },
                { status: 400 }
            );
        }

        // Validate hostname format
        const hostnameRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?$/i;
        const isLocalhost = hostname.toLowerCase().startsWith('localhost') || 
                           hostname.startsWith('127.0.0.1') ||
                           hostname.startsWith('192.168.');
        
        if (!isLocalhost && !hostnameRegex.test(hostname)) {
            return NextResponse.json(
                { success: false, error: 'Invalid hostname format. Example: mycompany.example.com' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if hostname is already taken by another admin
        const normalizedHostname = hostname.toLowerCase().trim();
        const adminId = auth.payload?.userId;
        if (!adminId) {
            return NextResponse.json(
                { success: false, error: 'Invalid authentication' },
                { status: 401 }
            );
        }
        
        const existingAdmin = await TenantAdmin.findOne({
            hostname: normalizedHostname,
            _id: { $ne: adminId },
        });

        if (existingAdmin) {
            return NextResponse.json(
                { success: false, error: 'This hostname is already in use by another organization' },
                { status: 409 }
            );
        }

        // Update admin hostname
        const admin = await TenantAdmin.findByIdAndUpdate(
            adminId,
            { 
                hostname: normalizedHostname,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Admin not found' },
                { status: 404 }
            );
        }

        console.log(`✅ Admin hostname updated: ${admin.organizationName} → ${normalizedHostname}`);

        return NextResponse.json({
            success: true,
            message: 'Hostname updated successfully',
            data: {
                hostname: admin.hostname,
                organizationName: admin.organizationName,
                accessUrl: isLocalhost ? `http://${normalizedHostname}` : `https://${normalizedHostname}`,
            },
        });
    } catch (error) {
        console.error('Error updating hostname:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update hostname' },
            { status: 500 }
        );
    }
}
