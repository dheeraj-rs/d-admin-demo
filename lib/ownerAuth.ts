import { createToken, verifyAuth } from './auth';

export interface OwnerUser {
    email: string;
    role: 'owner';
    name: string;
    isOwner: true;
}

// Check if user is owner by email
export const isOwnerEmail = (email: string): boolean => {
    const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
    return email.toLowerCase() === ownerEmail.toLowerCase();
};

// Validate owner backup key (checks env keys only - used before login)
export const validateOwnerBackupKey = (key: string): boolean => {
    const ownerKeys = process.env.OWNER_BACKUP_KEYS?.split(',') || [];
    return ownerKeys.includes(key.trim());
};

// Check if database has any backup keys
export const hasDatabaseBackupKeys = async (): Promise<boolean> => {
    try {
        const { connectDB } = require('./mongodb');
        const Owner = require('../models/Owner').default;

        await connectDB();

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        // Explicitly select backupKeys field as it's hidden by default (select: false)
        const owner = await Owner.findOne({ email: ownerEmail }).select('+backupKeys');

        const hasKeys = owner && owner.backupKeys && owner.backupKeys.length > 0;
        console.log('📋 Database backup keys check:', {
            hasOwner: !!owner,
            backupKeysCount: owner?.backupKeys?.length || 0,
            hasKeys,
        });

        return hasKeys;
    } catch (error) {
        console.error('Error checking database backup keys:', error);
        return false;
    }
};

// Validate backup key against database keys and remove after use
export const validateAndRemoveDatabaseBackupKey = async (key: string): Promise<boolean> => {
    try {
        const { connectDB } = require('./mongodb');
        const Owner = require('../models/Owner').default;

        await connectDB();

        const ownerEmail = process.env.OWNER_EMAIL || 'drjsde@gmail.com';
        // Use lean() to get plain JavaScript objects (no Mongoose document)
        const owner = await Owner.findOne({ email: ownerEmail }).select('+backupKeys').lean();

        if (!owner || !owner.backupKeys || owner.backupKeys.length === 0) {
            console.log('❌ No database backup keys found for validation');
            return false;
        }

        console.log('🔍 Validating backup key...');
        console.log('   Entered key:', key);
        console.log('   Total database keys:', owner.backupKeys.length);
        console.log('   Raw backupKeys array:', JSON.stringify(owner.backupKeys, null, 2));

        // Debug: Show all keys in database
        owner.backupKeys.forEach((k: any, index: number) => {
            console.log(`   DB Key ${index + 1}: "${k.key}" (Active: ${k.isActive})`);
        });

        // Check if key exists and is active
        const trimmedKey = key.trim();
        console.log('   Trimmed entered key:', `"${trimmedKey}"`);

        const keyIndex = owner.backupKeys.findIndex((k: any) => {
            const matches = k.key === trimmedKey && k.isActive;
            console.log(`   Comparing with "${k.key}": key match=${k.key === trimmedKey}, active=${k.isActive}, result=${matches}`);
            return matches;
        });

        console.log('   Key index found:', keyIndex);

        if (keyIndex !== -1) {
            // Remove the used key from the database
            await Owner.findOneAndUpdate({ email: ownerEmail }, { $pull: { backupKeys: { key: trimmedKey } } });

            console.log(`✅ Backup key ${trimmedKey.substring(0, 4)}*** successfully validated and deleted after use`);
            return true;
        }

        console.log('❌ Backup key not found in database or inactive');
        return false;
    } catch (error) {
        console.error('Error validating database backup key:', error);
        return false;
    }
};

// Store owner session - NO localStorage, only mark as authenticated
export const setOwnerSession = (user: OwnerUser) => {
    // No localStorage storage - authentication is via httpOnly cookie only
    console.log('Owner authenticated via token');
};

// Get owner session - check cookie existence
export const getOwnerSession = (): OwnerUser | null => {
    if (typeof window === 'undefined') return null;

    // Check if owner_token cookie exists (can't read httpOnly, just check auth state)
    const cookies = document.cookie.split(';');
    const hasOwnerToken = cookies.some((cookie) => cookie.trim().startsWith('owner_token='));

    if (hasOwnerToken) {
        // Return minimal data - real data is in token on server
        return {
            email: 'owner',
            name: 'Owner',
            role: 'owner',
            isOwner: true,
        };
    }

    return null;
};

// Check if current user is owner (by cookie)
export const isOwnerAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;

    const cookies = document.cookie.split(';');
    return cookies.some((cookie) => cookie.trim().startsWith('owner_token='));
};

// Clear owner session
export const clearOwnerSession = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
        // Clear httpOnly cookie via API
        const response = await fetch('/api/auth/owner-logout', {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            console.log('✅ Owner session cleared successfully');
            return true;
        }

        console.error('❌ Logout API failed:', response.status);
        return false;
    } catch (err) {
        console.error('❌ Logout error:', err);
        return false;
    }
};

// Validate owner JWT token
export const validateOwnerToken = async (token: string): Promise<boolean> => {
    try {
        const result = await verifyAuth(token);
        if (!result.authenticated || !result.payload) {
            return false;
        }

        // Check if token has owner permissions
        const payload = result.payload as any;
        return payload.permissions?.isOwner === true;
    } catch (error) {
        console.error('Owner token validation error:', error);
        return false;
    }
};

// Create owner JWT token
export const createOwnerToken = async (email: string, name: string) => {
    return await createToken(email, {
        email,
        name,
        role: 'superadmin',
        permissions: { isOwner: true },
    } as any);
};
