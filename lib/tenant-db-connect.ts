import mongoose from 'mongoose';
import { connectDB } from './mongodb';

/**
 * Tenant Helper Utilities
 *
 * Provides utilities for tenant-based data isolation in a single database.
 * All data is stored in the main database with tenantId for isolation.
 */

/**
 * Create a tenant filter object for queries
 * @param tenantId - Tenant identifier
 * @returns Filter object with tenantId
 */
export function createTenantFilter(tenantId: string) {
    return { tenantId };
}

/**
 * Validate that a query includes tenant filtering
 * @param filter - Query filter object
 * @throws Error if tenantId is not in filter
 */
export function validateTenantFilter(filter: any) {
    if (!filter.tenantId) {
        throw new Error('Security Error: All queries must include tenantId for data isolation');
    }
}

/**
 * Execute a query with tenant isolation
 * @param model - Mongoose model
 * @param tenantId - Tenant identifier
 * @param additionalFilter - Additional query filters
 * @returns Query with tenant filter applied
 */
export async function queryWithTenantFilter<T>(
    model: mongoose.Model<T>,
    tenantId: string,
    additionalFilter: any = {}
) {
    await connectDB();
    const filter = { ...additionalFilter, tenantId };
    return model.find(filter);
}

/**
 * Create a document with tenant isolation
 * @param model - Mongoose model
 * @param tenantId - Tenant identifier
 * @param data - Document data
 * @returns Created document
 */
export async function createWithTenantId<T>(
    model: mongoose.Model<T>,
    tenantId: string,
    data: any
) {
    await connectDB();
    return model.create({ ...data, tenantId });
}

/**
 * Update a document with tenant isolation check
 * @param model - Mongoose model
 * @param tenantId - Tenant identifier
 * @param documentId - Document ID to update
 * @param updateData - Update data
 * @returns Updated document
 */
export async function updateWithTenantCheck<T>(
    model: mongoose.Model<T>,
    tenantId: string,
    documentId: string,
    updateData: any
) {
    await connectDB();
    const document = await model.findOneAndUpdate(
        { _id: documentId, tenantId },
        updateData,
        { new: true }
    );
    
    if (!document) {
        throw new Error('Document not found or access denied');
    }
    
    return document;
}

/**
 * Delete a document with tenant isolation check
 * @param model - Mongoose model
 * @param tenantId - Tenant identifier
 * @param documentId - Document ID to delete
 * @returns Deleted document
 */
export async function deleteWithTenantCheck<T>(
    model: mongoose.Model<T>,
    tenantId: string,
    documentId: string
) {
    await connectDB();
    const document = await model.findOneAndDelete({ _id: documentId, tenantId });
    
    if (!document) {
        throw new Error('Document not found or access denied');
    }
    
    return document;
}

/**
 * Get or create a tenant-specific database connection
 * @param tenantId - Tenant identifier (SuperAdmin ID)
 * @param organizationName - Organization name for the tenant
 * @returns Mongoose connection for the tenant
 */
export async function getTenantConnection(
    tenantId: string,
    organizationName: string
): Promise<mongoose.Connection> {
    await connectDB();
    
    // Use the main connection for now (single database with tenantId filtering)
    // In a true multi-tenant setup, this would create separate connections per tenant
    return mongoose.connection;
}

/**
 * Get tenant database name
 * @param tenantId - Tenant identifier
 * @param organizationName - Organization name
 * @returns Database name for the tenant
 */
export function getTenantDatabaseName(
    tenantId: string,
    organizationName: string
): string {
    // Sanitize organization name for database naming
    const sanitizedName = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `tenant_${sanitizedName}_${tenantId.substring(0, 8)}`;
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

const tenantDbConnect = {
    createTenantFilter,
    validateTenantFilter,
    queryWithTenantFilter,
    createWithTenantId,
    updateWithTenantCheck,
    deleteWithTenantCheck,
    getTenantConnection,
    getTenantDatabaseName,
    initializeTenantDatabase
};

export default tenantDbConnect;
