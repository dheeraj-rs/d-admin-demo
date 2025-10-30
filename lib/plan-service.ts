import { connectDB } from './mongodb';
import SuperAdmin from '../models/SuperAdmin';
import PlanConfiguration, { IPlanConfiguration } from '../models/PlanConfiguration';
import { getTenantConnection } from './tenant-db-connect';
import { AccountSchema, IAccount } from '../models/Account';

export type PlanType = 'FREE' | 'PRO' | 'MAX';

export interface PlanFeatures {
    dashboard: boolean;
    profile: boolean;
    settings: boolean;
    elements: boolean;
    addElements: boolean;
    websiteBuilder: boolean;
    aiWebsites: boolean;
    analytics: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    maxStorage: number;
    maxApiCalls: number;
    maxDownloads: number;
    maxPages: number;
    maxWebsites: number;
    allowedPages: string[];
    restrictedPages: string[];
    customFeatures: {
        name: string;
        enabled: boolean;
        description?: string;
    }[];
}

/**
 * Initialize default plan configurations for a SuperAdmin
 */
export async function initializePlanConfigurations(superAdminId: string): Promise<boolean> {
    try {
        await connectDB();

        // Check if configurations already exist
        const existingConfigs = await PlanConfiguration.find({ superAdminId });
        if (existingConfigs.length > 0) {
            return true; // Already initialized
        }

        // Create FREE plan configuration
        const freeConfig = new PlanConfiguration({
            superAdminId,
            plan: 'FREE',
            features: {
                dashboard: true,
                profile: true,
                settings: true,
                elements: true,
                addElements: false,
                websiteBuilder: false,
                aiWebsites: true,
                analytics: false,
                customBranding: false,
                apiAccess: false,
                webhooks: false,
                maxStorage: 100, // 100MB
                maxApiCalls: 100,
                maxDownloads: 10,
                maxPages: 5,
                maxWebsites: 1,
                allowedPages: ['/', '/elements', '/ai-websites', '/webconfig', '/websites', '/knowledge', '/webconfig/portfolio'],
                restrictedPages: ['/website-builder', '/analytics', '/api', '/webhooks'],
                customFeatures: [],
            },
            price: {
                monthly: 0,
                yearly: 0,
                currency: 'USD',
            },
        });

        // Create PRO plan configuration
        const proConfig = new PlanConfiguration({
            superAdminId,
            plan: 'PRO',
            features: {
                dashboard: true,
                profile: true,
                settings: true,
                elements: true,
                addElements: true,
                websiteBuilder: true,
                aiWebsites: true,
                analytics: true,
                customBranding: false,
                apiAccess: true,
                webhooks: false,
                maxStorage: 1000, // 1GB
                maxApiCalls: 1000,
                maxDownloads: 100,
                maxPages: 50,
                maxWebsites: 5,
                allowedPages: [
                    '/',
                    '/elements',
                    '/add-elements',
                    '/website-builder',
                    '/ai-websites',
                    '/webconfig',
                    '/websites',
                    '/knowledge',
                    '/webconfig/portfolio',
                    '/analytics',
                ],
                restrictedPages: ['/api', '/webhooks'],
                customFeatures: [],
            },
            price: {
                monthly: 29,
                yearly: 290, // 2 months free
                currency: 'USD',
            },
        });

        // Create MAX plan configuration
        const maxConfig = new PlanConfiguration({
            superAdminId,
            plan: 'MAX',
            features: {
                dashboard: true,
                profile: true,
                settings: true,
                elements: true,
                addElements: true,
                websiteBuilder: true,
                aiWebsites: true,
                analytics: true,
                customBranding: true,
                apiAccess: true,
                webhooks: true,
                maxStorage: 10000, // 10GB
                maxApiCalls: 10000,
                maxDownloads: 1000,
                maxPages: 500,
                maxWebsites: 50,
                allowedPages: ['*'], // All pages
                restrictedPages: [],
                customFeatures: [
                    {
                        name: 'Priority Support',
                        enabled: true,
                        description: '24/7 priority support',
                    },
                    {
                        name: 'Custom Integrations',
                        enabled: true,
                        description: 'Custom API integrations',
                    },
                ],
            },
            price: {
                monthly: 99,
                yearly: 990, // 2 months free
                currency: 'USD',
            },
        });

        // Save all configurations
        await Promise.all([freeConfig.save(), proConfig.save(), maxConfig.save()]);

        // Update SuperAdmin with plan configuration references
        await SuperAdmin.findByIdAndUpdate(superAdminId, {
            planConfigurations: {
                FREE: freeConfig._id,
                PRO: proConfig._id,
                MAX: maxConfig._id,
            },
        });

        console.log(`✅ Plan configurations initialized for SuperAdmin: ${superAdminId}`);
        return true;
    } catch (error) {
        console.error('Error initializing plan configurations:', error);
        return false;
    }
}

/**
 * Get plan configuration for a specific plan
 */
export async function getPlanConfiguration(superAdminId: string, plan: PlanType): Promise<IPlanConfiguration | null> {
    try {
        await connectDB();
        return await PlanConfiguration.findOne({
            superAdminId,
            plan,
            isActive: true,
        });
    } catch (error) {
        console.error('Error getting plan configuration:', error);
        return null;
    }
}

/**
 * Check if account can access a feature
 */
export async function canAccessFeature(accountId: string, superAdminId: string, feature: string): Promise<boolean> {
    try {
        await connectDB();

        const superAdmin = await SuperAdmin.findById(superAdminId);
        if (!superAdmin) return false;

        const tenantConnection = await getTenantConnection(superAdminId, superAdmin.organizationName);
        const Account = tenantConnection.model<IAccount>('Account', AccountSchema);

        const account = await Account.findById(accountId);
        if (!account || !account.isActive) return false;

        // Check if plan is active
        if (account.isPlanExpired()) return false;

        // Check if feature is in allowed features
        return account.canAccessFeature(feature);
    } catch (error) {
        console.error('Error checking feature access:', error);
        return false;
    }
}

/**
 * Check if account has reached usage limit
 */
export async function hasReachedLimit(accountId: string, superAdminId: string, limitType: 'apiCalls' | 'storage' | 'downloads' | 'pages'): Promise<boolean> {
    try {
        await connectDB();

        const superAdmin = await SuperAdmin.findById(superAdminId);
        if (!superAdmin) return true;

        const tenantConnection = await getTenantConnection(superAdminId, superAdmin.organizationName);
        const Account = tenantConnection.model<IAccount>('Account', AccountSchema);

        const account = await Account.findById(accountId);
        if (!account || !account.isActive) return true;

        return account.hasReachedLimit(limitType);
    } catch (error) {
        console.error('Error checking usage limit:', error);
        return true;
    }
}

/**
 * Increment usage for an account
 */
export async function incrementUsage(
    accountId: string,
    superAdminId: string,
    usageType: 'apiCalls' | 'storage' | 'downloads',
    amount: number = 1
): Promise<boolean> {
    try {
        await connectDB();

        const superAdmin = await SuperAdmin.findById(superAdminId);
        if (!superAdmin) return false;

        const tenantConnection = await getTenantConnection(superAdminId, superAdmin.organizationName);
        const Account = tenantConnection.model<IAccount>('Account', AccountSchema);

        const updateField = `usage.${usageType}`;
        await Account.findByIdAndUpdate(accountId, {
            $inc: { [updateField]: amount },
            'usage.lastActivity': new Date(),
        });

        return true;
    } catch (error) {
        console.error('Error incrementing usage:', error);
        return false;
    }
}
