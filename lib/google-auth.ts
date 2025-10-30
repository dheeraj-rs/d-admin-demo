import { OAuth2Client } from 'google-auth-library';
import { connectDB } from './mongodb';
import Account from '../models/Account';
import TenantAdmin from '../models/SuperAdmin';
import Owner from '../models/Owner';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export interface GoogleTokenPayload {
    email: string;
    name: string;
    picture?: string;
    sub: string; // Google ID
}

/**
 * Verify Google OAuth token
 */
export async function verifyGoogleToken(token: string): Promise<GoogleTokenPayload | null> {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return null;
        }

        return {
            email: payload.email,
            name: payload.name || '',
            picture: payload.picture,
            sub: payload.sub,
        };
    } catch (error) {
        console.error('Error verifying Google token:', error);
        return null;
    }
}

/**
 * Handle Google authentication for different user types
 */
export async function handleGoogleAuth(
    googlePayload: GoogleTokenPayload,
    superAdminId?: string
): Promise<{
    success: boolean;
    account?: any;
    user?: any;
    userType?: 'admin' | 'owner' | 'account';
    isNewAccount?: boolean;
    error?: string;
}> {
    try {
        await connectDB();

        const { email, name, picture, sub } = googlePayload;

        // Check Owner first (highest level)
        let owner = await Owner.findOne({ email });
        if (owner) {
            // Update last login
            owner.lastLogin = new Date();
            await owner.save();

            return {
                success: true,
                user: owner,
                account: owner,
                userType: 'owner',
            };
        }

        // Check TenantAdmin (manages tenant)
        let admin = await TenantAdmin.findOne({ email });
        if (admin) {
            // Check if admin is approved and active
            if (admin.approvalStatus !== 'approved') {
                return {
                    success: false,
                    error: `ADMIN_NOT_APPROVED`,
                    userType: 'admin',
                };
            }
            
            if (!admin.isActive || admin.isBlocked) {
                return {
                    success: false,
                    error: 'ADMIN_INACTIVE',
                    userType: 'admin',
                };
            }
            
            // Update last login
            admin.lastLogin = new Date();
            await admin.save();

            return {
                success: true,
                user: admin,
                account: admin,
                userType: 'admin',
            };
        }

        // Check if user already has an account (all accounts are in main DB now)
        let existingAccount = await Account.findOne({ email });
        
        if (existingAccount) {
            // User already has an account, login
            existingAccount.lastLogin = new Date();
            existingAccount.loginCount = (existingAccount.loginCount || 0) + 1;
            await existingAccount.save();

            return {
                success: true,
                account: existingAccount,
                user: existingAccount,
                userType: 'account',
                isNewAccount: false,
            };
        }

        // If superAdminId not provided and no existing account found, user needs to select one
        if (!superAdminId) {
            return {
                success: false,
                error: 'NO_SUPERADMIN_SELECTED',
            };
        }

        // Check if Admin exists
        const selectedAdmin = await TenantAdmin.findById(superAdminId);
        if (!selectedAdmin || !selectedAdmin.isActive) {
            return {
                success: false,
                error: 'Invalid Admin',
            };
        }

        // Create new account in main database with tenantId for isolation
        // All accounts are now in the same database, filtered by tenantId
        let isNewAccount = true;
        let account = await Account.create({
            googleId: sub,
            email,
            name,
            profilePicture: picture,
            adminId: superAdminId,
            organizationKey: selectedAdmin.organizationKey,
            tenantId: selectedAdmin.tenantId,

            plan: 'FREE',
            isPlanActive: true,
            features: ['basic'],
            usage: {
                apiCalls: 0,
                storageUsed: 0,
                downloads: 0,
            },
            limits: {
                maxApiCalls: 100,
                maxStorage: 100,
                maxDownloads: 10,
                maxPages: 5,
            },
            isActive: true,
            isVerified: true,
            loginCount: 1,
        });

        return {
            success: true,
            account,
            user: account,
            userType: 'account',
            isNewAccount,
        };
    } catch (error) {
        console.error('Error in handleGoogleAuth:', error);
        return {
            success: false,
            error: 'Authentication failed',
        };
    }
}

/**
 * Get list of available Admins for selection
 */
export async function getAvailableAdmins(): Promise<any[]> {
    try {
        await connectDB();

        const admins = await TenantAdmin.find({
            isActive: true,
            approvalStatus: 'approved',
            isBlocked: false,
        })
            .select('_id organizationName email name profilePicture tenantId hostname')
            .sort({ createdAt: -1 })
            .lean();

        return admins;
    } catch (error) {
        console.error('Error getting available Admins:', error);
        return [];
    }
}

// Backward compatibility alias
export const getAvailableSuperAdmins = getAvailableAdmins;
