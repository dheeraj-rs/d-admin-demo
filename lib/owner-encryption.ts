import { encrypt, decrypt } from './encryption';
import { OwnerUser } from './ownerAuth';

// Encrypt sensitive owner data
export const encryptOwnerData = (data: any): string => {
    try {
        return encrypt(JSON.stringify(data));
    } catch (error) {
        console.error('Owner data encryption error:', error);
        throw new Error('Failed to encrypt owner data');
    }
};

// Decrypt owner data
export const decryptOwnerData = (encryptedData: string): any => {
    try {
        return JSON.parse(decrypt(encryptedData));
    } catch (error) {
        console.error('Owner data decryption error:', error);
        throw new Error('Failed to decrypt owner data');
    }
};

// Create encrypted owner response (for API responses)
export const createEncryptedOwnerResponse = (ownerData: OwnerUser) => {
    // Encrypt sensitive fields
    return {
        data: encryptOwnerData({
            email: ownerData.email,
            name: ownerData.name,
        }),
        role: 'owner', // Safe to expose role
        isOwner: true, // Safe to expose this flag
    };
};
