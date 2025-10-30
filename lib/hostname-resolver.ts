/**
 * ==========================================
 * HOSTNAME-BASED ADMIN RESOLVER
 * ==========================================
 * 
 * Automatically detects which admin/tenant based on the request hostname.
 * Used during account registration to determine which admin the user belongs to.
 * 
 * EXAMPLES:
 * - localhost:3000 → Default admin (first approved admin or fallback)
 * - techcorp.d-admin.com → TechCorp admin
 * - startup.example.com → Startup admin (custom domain)
 * 
 * ==========================================
 */

import { connectDB } from './mongodb';
import TenantAdmin from '../models/SuperAdmin';
import { NextRequest } from 'next/server';

export interface ResolvedAdmin {
    adminId: string;
    email: string;
    name: string;
    organizationName: string;
    organizationKey: string;
    tenantId: string;
    hostname: string;
}

/**
 * Extract hostname from Next.js request
 */
export function getHostnameFromRequest(request: NextRequest): string {
    // Try to get hostname from headers
    const host = request.headers.get('host') || '';
    
    // Remove port if present
    const hostname = host.split(':')[0].toLowerCase();
    
    return hostname;
}

/**
 * Resolve admin by hostname
 * Returns the admin that matches the hostname, or default admin for localhost
 */
export async function resolveAdminByHostname(hostname: string): Promise<ResolvedAdmin | null> {
    try {
        await connectDB();
        
        // Normalize hostname
        const normalizedHostname = hostname.toLowerCase().trim();
        
        // For localhost or empty hostname, return the default admin
        if (!normalizedHostname || 
            normalizedHostname === 'localhost' || 
            normalizedHostname.startsWith('127.0.0.1') ||
            normalizedHostname.startsWith('192.168.')) {
            
            // Get the first approved and active admin as default
            const defaultAdmin = await TenantAdmin.findOne({
                isActive: true,
                approvalStatus: 'approved',
                isBlocked: false,
            }).sort({ createdAt: 1 }); // Get the oldest (first) admin
            
            if (!defaultAdmin) {
                console.log('⚠️ No default admin found for localhost');
                return null;
            }
            
            return {
                adminId: defaultAdmin._id.toString(),
                email: defaultAdmin.email,
                name: defaultAdmin.name,
                organizationName: defaultAdmin.organizationName,
                organizationKey: defaultAdmin.organizationKey,
                tenantId: defaultAdmin.tenantId,
                hostname: defaultAdmin.hostname || 'localhost:3000',
            };
        }
        
        // Look for exact hostname match
        const admin = await TenantAdmin.findOne({
            hostname: normalizedHostname,
            isActive: true,
            approvalStatus: 'approved',
            isBlocked: false,
        });
        
        if (admin) {
            return {
                adminId: admin._id.toString(),
                email: admin.email,
                name: admin.name,
                organizationName: admin.organizationName,
                organizationKey: admin.organizationKey,
                tenantId: admin.tenantId,
                hostname: admin.hostname,
            };
        }
        
        console.log(`⚠️ No admin found for hostname: ${normalizedHostname}`);
        return null;
        
    } catch (error) {
        console.error('Error resolving admin by hostname:', error);
        return null;
    }
}

/**
 * Resolve admin from Next.js request
 * Convenience function that extracts hostname and resolves admin
 */
export async function resolveAdminFromRequest(request: NextRequest): Promise<ResolvedAdmin | null> {
    const hostname = getHostnameFromRequest(request);
    return resolveAdminByHostname(hostname);
}

/**
 * Get all available admins for selection (fallback)
 */
export async function getAvailableAdminsForSelection(): Promise<ResolvedAdmin[]> {
    try {
        await connectDB();
        
        const admins = await TenantAdmin.find({
            isActive: true,
            approvalStatus: 'approved',
            isBlocked: false,
        })
        .select('_id email name organizationName organizationKey tenantId hostname')
        .sort({ createdAt: -1 })
        .lean();
        
        return admins.map(admin => ({
            adminId: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            organizationName: admin.organizationName,
            organizationKey: admin.organizationKey,
            tenantId: admin.tenantId,
            hostname: admin.hostname || 'localhost:3000',
        }));
        
    } catch (error) {
        console.error('Error getting available admins:', error);
        return [];
    }
}
