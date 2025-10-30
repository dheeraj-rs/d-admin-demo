import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import TenantAdmin from '../../../../models/SuperAdmin';
import { createTenantForAdmin } from '../../../../lib/tenant-setup-helper';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * POST /api/auth/register-admin
 * Register a new admin with tenant setup
 * Creates admin account + tenant record + hostname
 */
export async function POST(request: NextRequest) {
    try {
        const { email, password, name, organizationName } = await request.json();

        // Validate required fields
        if (!email || !password || !name || !organizationName) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if admin already exists
        const existingAdmin = await TenantAdmin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return NextResponse.json(
                { success: false, error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Generate organization key
        const orgKey = `ORG_${crypto.randomBytes(3).toString('hex').toUpperCase()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate tenant ID
        const tenantId = `tenant_${crypto.randomBytes(12).toString('hex')}`;

        // Create admin account
        const admin = await TenantAdmin.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            organizationName,
            organizationKey: orgKey,
            tenantId,
            role: 'superadmin',
            isActive: true,
            isApproved: true,
        });

        // Create tenant record with hostname
        const tenantSetup = await createTenantForAdmin({
            adminId: admin._id.toString(),
            adminEmail: admin.email,
            organizationName,
            organizationKey: orgKey,
            plan: 'free', // Default to free plan
        });

        console.log(`✅ Admin registered: ${email}`);
        console.log(`✅ Tenant created: ${tenantSetup.tenantId}`);
        console.log(`✅ Hostname: ${tenantSetup.fullHostname}`);

        return NextResponse.json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                adminId: admin._id,
                email: admin.email,
                name: admin.name,
                organizationName: admin.organizationName,
                organizationKey: orgKey,
                tenantId: tenantSetup.tenantId,
                hostname: tenantSetup.hostname,
                fullHostname: tenantSetup.fullHostname,
                accessUrl: `https://${tenantSetup.fullHostname}`,
            },
        });
    } catch (error: any) {
        console.error('❌ Error in admin registration:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Registration failed' },
            { status: 500 }
        );
    }
}
