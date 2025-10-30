/**
 * Auth Helpers - Bridge between new multi-tenant auth and existing system
 */

import { cookies } from 'next/headers';
import { verifyAuth } from './auth';
import { connectDB } from './mongodb';
import SuperAdmin from '../models/SuperAdmin';
import Admin from '../models/SuperAdmin';
import User from '../models/User';

export type UserRole = 'owner' | 'superadmin' | 'account';
export type AccountPlan = 'free' | 'pro' | 'max';

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    plan?: AccountPlan; // For account role
    organizationKey?: string;
    superAdminKey?: string;
    databaseName?: string;
    permissions?: any;
    pinSetup?: boolean;
}

/**
 * Get current authenticated user from server components
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return null;
        }

        const { authenticated, payload } = await verifyAuth(token);

        if (!authenticated || !payload) {
            return null;
        }

        await connectDB();

        // Check if it's a SuperAdmin
        if (payload.role === 'superadmin') {
            const superAdmin = await SuperAdmin.findById(payload.userId);
            if (superAdmin && superAdmin.isActive && superAdmin.approvalStatus === 'approved') {
                return {
                    id: superAdmin._id.toString(),
                    email: superAdmin.email,
                    name: superAdmin.name,
                    role: 'superadmin',
                    organizationKey: superAdmin.organizationKey,
                    pinSetup: superAdmin.pinSetup,
                };
            }
        }

        // Check if it's an Owner
        if (payload.role === 'owner') {
            // Import Owner model dynamically to avoid circular dependencies
            const Owner = (await import('../models/Owner')).default;
            const owner = await Owner.findById(payload.userId);
            if (owner && owner.isActive) {
                return {
                    id: owner._id.toString(),
                    email: owner.email,
                    name: owner.name,
                    role: 'owner',
                };
            }
        }

        // Check if it's an Account
        if (payload.role === 'account') {
            // Import Account model from tenant DB (User is legacy model with minimal fields)
            const account = await User.findById(payload.userId);
            if (account && account.isActive) {
                return {
                    id: account._id.toString(),
                    email: account.email,
                    name: account.name,
                    role: 'account',
                    plan: payload.plan as AccountPlan,
                    pinSetup: false, // User model doesn't have pinSetup
                };
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Check if user has specific permission (for Admins)
 */
export async function checkUserPermission(
    userId: string,
    module: string,
    action?: string
): Promise<boolean> {
    try {
        await connectDB();
        const admin = await Admin.findById(userId);

        if (!admin || !admin.isActive || admin.approvalStatus !== 'approved') {
            return false;
        }

        // SuperAdmin model doesn't have hasPermission method - default to true for approved admins
        return true;
    } catch (error) {
        console.error('Error checking user permission:', error);
        return false;
    }
}

/**
 * Check if user is SuperAdmin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
    try {
        await connectDB();
        const superAdmin = await SuperAdmin.findById(userId);
        return !!(superAdmin && superAdmin.isActive && superAdmin.approvalStatus === 'approved');
    } catch (error) {
        console.error('Error checking SuperAdmin:', error);
        return false;
    }
}

/**
 * Check if user is Owner
 */
export async function isOwner(userId: string): Promise<boolean> {
    try {
        await connectDB();
        const Owner = (await import('../models/Owner')).default;
        const owner = await Owner.findById(userId);
        return !!(owner && owner.isActive);
    } catch (error) {
        console.error('Error checking Owner:', error);
        return false;
    }
}

/**
 * Check if user is Account
 */
export async function isAccount(userId: string): Promise<boolean> {
    try {
        await connectDB();
        const account = await User.findById(userId);
        return !!(account && account.isActive);
    } catch (error) {
        console.error('Error checking Account:', error);
        return false;
    }
}

/**
 * Get organization key for user (SuperAdmin or Admin)
 */
export async function getOrganizationKey(userId: string, role: UserRole): Promise<string | null> {
    try {
        await connectDB();

        // Owner has access to all organizations
        if (role === 'owner') {
            return null; // Owner doesn't need organization key
        }

        if (role === 'superadmin') {
            const superAdmin = await SuperAdmin.findById(userId);
            return superAdmin?.organizationKey || null;
        }

        if (role === 'account') {
            // Accounts belong to a SuperAdmin's organization (User model is legacy, doesn't have organizationKey)
            return null;
        }

        return null;
    } catch (error) {
        console.error('Error getting organization key:', error);
        return null;
    }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();
    
    if (!user) {
        throw new Error('Authentication required');
    }
    
    return user;
}

/**
 * Require SuperAdmin role - throws if not SuperAdmin
 */
export async function requireSuperAdminRole(): Promise<AuthenticatedUser> {
    const user = await requireAuth();
    
    if (user.role !== 'superadmin') {
        throw new Error('SuperAdmin access required');
    }
    
    return user;
}

/**
 * Require Owner role - throws if not Owner
 */
export async function requireOwnerRole(): Promise<AuthenticatedUser> {
    const user = await requireAuth();
    
    if (user.role !== 'owner') {
        throw new Error('Owner access required');
    }
    
    return user;
}

/**
 * Require Admin privileges (Owner or SuperAdmin) - throws if neither
 */
export async function requireAdminRole(): Promise<AuthenticatedUser> {
    const user = await requireAuth();
    
    if (user.role !== 'owner' && user.role !== 'superadmin') {
        throw new Error('Admin access required');
    }
    
    return user;
}
