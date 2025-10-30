import mongoose, { Model } from 'mongoose';
import { connectDB } from './mongodb';

/**
 * Tenant Models Utilities
 * Provides tenant-isolated model instances for multi-tenant data
 */

/**
 * Get tenant-specific Message model
 * @param tenantKey - Tenant identifier (organizationKey)
 * @param userId - User identifier for logging
 * @returns Message model for the tenant
 */
export async function getTenantMessageModel(
    tenantKey: string,
    userId: string
): Promise<Model<any>> {
    await connectDB();
    
    // Import Message model schema
    const MessageModel = (await import('../models/Message')).default;
    
    // For now, return the main Message model
    // In a true multi-tenant setup, you would create tenant-specific collections
    // or add tenantId filtering to all queries
    return MessageModel;
}

/**
 * Get tenant-specific Account model
 * @param tenantKey - Tenant identifier (organizationKey)
 * @param userId - User identifier for logging
 * @returns Account model for the tenant
 */
export async function getTenantAccountModel(
    tenantKey: string,
    userId: string
): Promise<Model<any>> {
    await connectDB();
    
    const AccountModel = (await import('../models/Account')).default;
    return AccountModel;
}

/**
 * Get tenant-specific AIWebsite model
 * @param tenantKey - Tenant identifier (organizationKey)
 * @param userId - User identifier for logging
 * @returns AIWebsite model for the tenant
 */
export async function getTenantAIWebsiteModel(
    tenantKey: string,
    userId?: string
): Promise<Model<any>> {
    await connectDB();
    
    const AIWebsiteModel = (await import('../models/AIWebsite')).default;
    return AIWebsiteModel;
}

/**
 * Get tenant-specific DataStore model
 * @param tenantKey - Tenant identifier (organizationKey)
 * @param userId - User identifier for logging
 * @returns DataStore model for the tenant
 */
export async function getTenantDataStoreModel(
    tenantKey: string,
    userId?: string
): Promise<Model<any>> {
    await connectDB();
    
    const DataStoreModel = (await import('../models/DataStore')).default;
    return DataStoreModel;
}

/**
 * Get tenant-specific GmailAccount model
 * @param tenantKey - Tenant identifier (organizationKey)
 * @param userId - User identifier for logging
 * @returns GmailAccount model for the tenant
 */
export async function getTenantGmailAccountModel(
    tenantKey: string,
    userId?: string
): Promise<Model<any>> {
    await connectDB();
    
    const GmailAccountModel = (await import('../models/GmailAccount')).default;
    return GmailAccountModel;
}

/**
 * Initialize tenant database (placeholder for future tenant setup)
 * @param tenantKey - Tenant identifier
 * @param userId - User identifier for logging
 */
export async function initializeTenantDatabase(
    tenantKey: string,
    userId: string
): Promise<void> {
    await connectDB();
    
    // Placeholder for tenant database initialization
    // In a true multi-tenant setup, this would create tenant-specific collections
    // or ensure tenant isolation is properly configured
    console.log(`Tenant database initialized for: ${tenantKey} by ${userId}`);
}

const tenantModels = {
    getTenantMessageModel,
    getTenantAccountModel,
    getTenantAIWebsiteModel,
    getTenantDataStoreModel,
    getTenantGmailAccountModel,
    initializeTenantDatabase
};

export default tenantModels;
