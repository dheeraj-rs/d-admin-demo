import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import PlanPermissions, { IPagePermission } from '../../../models/PlanPermissions';
import { requireOwnerAuth } from '../../../lib/owner-auth-middleware';
import { seedPermissionsIfNeeded } from '../../../lib/seed-permissions';

/**
 * GET - Fetch current plan permissions
 * OWNER ONLY - Critical security: Only owner can view plan permissions
 */
export async function GET(request: NextRequest) {
    try {
        // OWNER AUTHENTICATION REQUIRED - Verify owner token
        const authError = await requireOwnerAuth(request);
        if (authError) return authError;

        await connectDB();

        // Get the latest global permissions
        let permissions = await PlanPermissions.findOne({ isGlobal: true }).sort({ version: -1 }).lean();

        // If no permissions exist, seed default permissions
        if (!permissions) {
            console.log('🌱 No permissions found, seeding defaults...');
            await seedPermissionsIfNeeded();
            // Fetch the newly seeded permissions
            permissions = await PlanPermissions.findOne({ isGlobal: true }).lean();
        }

        return NextResponse.json({
            success: true,
            data: permissions,
        });
    } catch (error: any) {
        console.error('Error fetching plan permissions:', error);
        return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }
}

/**
 * POST - Update plan permissions
 * OWNER ONLY - Critical security: Only owner can modify plan permissions
 */
export async function POST(request: NextRequest) {
    try {
        console.log('📝 POST /api/plan-permissions - Starting...');
        
        // OWNER AUTHENTICATION REQUIRED - Verify owner token with JWT validation
        const authError = await requireOwnerAuth(request);
        if (authError) {
            console.log('❌ Owner authentication failed');
            return authError;
        }
        
        console.log('✅ Owner authenticated successfully');

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        console.log('👤 Owner email:', ownerEmail);

        const body = await request.json();
        const { permissions } = body;
        console.log('📦 Received permissions count:', permissions?.length);

        if (!permissions || !Array.isArray(permissions)) {
            console.log('❌ Invalid permissions data');
            return NextResponse.json({ error: 'Invalid permissions data' }, { status: 400 });
        }

        // Validate permissions structure
        const isValid = validatePermissions(permissions);
        console.log('✅ Permissions valid:', isValid);
        
        if (!isValid) {
            console.log('❌ Invalid permissions structure');
            return NextResponse.json({ error: 'Invalid permissions structure' }, { status: 400 });
        }

        console.log('🔌 Connecting to database...');
        await connectDB();

        // Get current permissions
        console.log('🔍 Searching for existing permissions...');
        let currentPermissions = await PlanPermissions.findOne({ isGlobal: true }).sort({ version: -1 });
        console.log('📄 Found existing permissions:', !!currentPermissions);

        if (currentPermissions) {
            console.log('🔄 Updating existing permissions...');
            // Create change summary
            const changes = generateChangeSummary(currentPermissions.permissions, permissions);
            console.log('📝 Changes:', changes);

            // Update existing permissions
            currentPermissions.permissions = permissions;
            currentPermissions.lastModifiedBy = ownerEmail;
            currentPermissions.lastModifiedAt = new Date();
            currentPermissions.version += 1;

            // Add to history
            currentPermissions.changeHistory.push({
                modifiedBy: ownerEmail,
                modifiedAt: new Date(),
                changes,
                version: currentPermissions.version,
            });

            console.log('💾 Saving updated permissions...');
            await currentPermissions.save();
            console.log('✅ Permissions saved successfully!');
        } else {
            console.log('🆕 Creating new permissions document...');
            // Create new permissions document
            currentPermissions = await PlanPermissions.create({
                isGlobal: true,
                permissions,
                version: 1,
                lastModifiedBy: ownerEmail,
                lastModifiedAt: new Date(),
                changeHistory: [
                    {
                        modifiedBy: ownerEmail,
                        modifiedAt: new Date(),
                        changes: 'Initial permissions setup',
                        version: 1,
                    },
                ],
            });
            console.log('✅ New permissions created successfully!');
        }

        console.log('🎉 Returning success response');
        return NextResponse.json({
            success: true,
            message: 'Permissions updated successfully',
            data: currentPermissions,
        });
    } catch (error: any) {
        console.error('❌ Error updating plan permissions:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return NextResponse.json({ 
            error: 'Failed to update permissions',
            details: error.message 
        }, { status: 500 });
    }
}

/**
 * Validate permissions structure
 */
function validatePermissions(permissions: any[]): boolean {
    return permissions.every((perm) => {
        return (
            typeof perm.pagePath === 'string' &&
            typeof perm.pageName === 'string' &&
            typeof perm.category === 'string' &&
            perm.free &&
            typeof perm.free.read === 'boolean' &&
            typeof perm.free.write === 'boolean' &&
            typeof perm.free.delete === 'boolean' &&
            perm.pro &&
            typeof perm.pro.read === 'boolean' &&
            typeof perm.pro.write === 'boolean' &&
            typeof perm.pro.delete === 'boolean' &&
            perm.max &&
            typeof perm.max.read === 'boolean' &&
            typeof perm.max.write === 'boolean' &&
            typeof perm.max.delete === 'boolean'
        );
    });
}

/**
 * Generate change summary
 */
function generateChangeSummary(oldPermissions: IPagePermission[], newPermissions: IPagePermission[]): string {
    const changes: string[] = [];

    newPermissions.forEach((newPerm) => {
        const oldPerm = oldPermissions.find((p) => p.pagePath === newPerm.pagePath);

        if (!oldPerm) {
            changes.push(`Added: ${newPerm.pageName}`);
            return;
        }

        // Check for changes in each plan
        ['free', 'pro', 'max'].forEach((plan) => {
            ['read', 'write', 'delete'].forEach((action) => {
                const oldValue = (oldPerm as any)[plan][action];
                const newValue = (newPerm as any)[plan][action];

                if (oldValue !== newValue) {
                    changes.push(
                        `${newPerm.pageName} - ${plan.toUpperCase()} ${action}: ${oldValue ? 'enabled' : 'disabled'} → ${newValue ? 'enabled' : 'disabled'}`
                    );
                }
            });
        });
    });

    return changes.length > 0 ? changes.join('; ') : 'No changes';
}
