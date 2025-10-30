import { connectDB } from './mongodb';
import PlanPermissions from '../models/PlanPermissions';

/**
 * Default permissions for all pages in the application
 * These are used when no permissions exist in the database
 */
export const getDefaultPermissions = () => [
    // Dashboard & Main Pages
    {
        pagePath: '/dashboard',
        pageName: 'Dashboard',
        category: 'Main',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/profile',
        pageName: 'Profile',
        category: 'Main',
        free: { read: true, write: true, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/settings',
        pageName: 'Settings',
        category: 'Main',
        free: { read: true, write: true, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // AI Websites
    {
        pagePath: '/ai-websites',
        pageName: 'AI Websites List',
        category: 'AI Websites',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/ai-websites/create',
        pageName: 'Create AI Website',
        category: 'AI Websites',
        free: { read: false, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/ai-websites/edit',
        pageName: 'Edit AI Website',
        category: 'AI Websites',
        free: { read: false, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Data Store
    {
        pagePath: '/datastore',
        pageName: 'Data Store',
        category: 'Data',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/datastore/create',
        pageName: 'Create Data Entry',
        category: 'Data',
        free: { read: false, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Gmail Accounts
    {
        pagePath: '/gmail-accounts',
        pageName: 'Gmail Accounts',
        category: 'Email',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Messages
    {
        pagePath: '/messages',
        pageName: 'Messages',
        category: 'Communication',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Analytics
    {
        pagePath: '/analytics',
        pageName: 'Analytics Dashboard',
        category: 'Analytics',
        free: { read: false, write: false, delete: false },
        pro: { read: true, write: false, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Payment & Billing
    {
        pagePath: '/billing',
        pageName: 'Billing',
        category: 'Payment',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/upgrade',
        pageName: 'Upgrade Plan',
        category: 'Payment',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: false, delete: false },
        max: { read: true, write: false, delete: false },
    },

    // Admin Features
    {
        pagePath: '/admin/users',
        pageName: 'User Management',
        category: 'Admin',
        free: { read: false, write: false, delete: false },
        pro: { read: false, write: false, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Templates
    {
        pagePath: '/templates',
        pageName: 'Templates Library',
        category: 'Templates',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // API & Integrations
    {
        pagePath: '/api-keys',
        pageName: 'API Keys',
        category: 'API',
        free: { read: false, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/webhooks',
        pageName: 'Webhooks',
        category: 'API',
        free: { read: false, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Content Management
    {
        pagePath: '/content',
        pageName: 'Content Manager',
        category: 'Content',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
    {
        pagePath: '/media',
        pageName: 'Media Library',
        category: 'Content',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Team & Collaboration
    {
        pagePath: '/team',
        pageName: 'Team Members',
        category: 'Team',
        free: { read: false, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },

    // Security
    {
        pagePath: '/security',
        pageName: 'Security Settings',
        category: 'Security',
        free: { read: true, write: false, delete: false },
        pro: { read: true, write: true, delete: false },
        max: { read: true, write: true, delete: true },
    },
];

/**
 * Seed default permissions into the database if none exist
 * This ensures the application always has permissions configured
 */
export async function seedPermissionsIfNeeded() {
    try {
        await connectDB();

        // Check if permissions already exist
        const existingPermissions = await PlanPermissions.findOne({ isGlobal: true });

        if (existingPermissions) {
            console.log('✅ Permissions already exist in database');
            return existingPermissions;
        }

        console.log('🌱 Seeding default permissions into database...');

        // Create default permissions
        const defaultPermissions = await PlanPermissions.create({
            isGlobal: true,
            permissions: getDefaultPermissions(),
            version: 1,
            lastModifiedBy: 'system',
            lastModifiedAt: new Date(),
            changeHistory: [
                {
                    modifiedBy: 'system',
                    modifiedAt: new Date(),
                    changes: 'Initial permissions setup (auto-seeded)',
                    version: 1,
                },
            ],
        });

        console.log('✅ Default permissions seeded successfully!');
        return defaultPermissions;
    } catch (error) {
        console.error('❌ Error seeding permissions:', error);
        throw error;
    }
}
