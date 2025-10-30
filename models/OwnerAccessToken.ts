import mongoose from 'mongoose';

export interface IOwnerAccessToken extends mongoose.Document {
    token: string;
    superAdminId: mongoose.Types.ObjectId;
    superAdminEmail: string;
    superAdminName: string;
    organizationKey: string;
    createdBy: string; // Owner email
    expiresAt: Date;
    isActive: boolean;
    usedCount: number;
    lastUsedAt?: Date;
    accessMode: 'owner' | 'superadmin' | 'emergency'; // Access level granted
    oneTimeUse: boolean; // If true, token is deactivated after first use
    maxUses?: number; // Optional: limit number of uses
    createdAt: Date;
    updatedAt: Date;
}

const OwnerAccessTokenSchema = new mongoose.Schema<IOwnerAccessToken>(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        superAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'SuperAdmin',
        },
        superAdminEmail: {
            type: String,
            required: true,
        },
        superAdminName: {
            type: String,
            required: true,
        },
        organizationKey: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        lastUsedAt: {
            type: Date,
        },
        accessMode: {
            type: String,
            enum: ['owner', 'superadmin', 'emergency'],
            default: 'emergency',
            required: true,
        },
        oneTimeUse: {
            type: Boolean,
            default: true,
        },
        maxUses: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
OwnerAccessTokenSchema.index({ token: 1, isActive: 1, expiresAt: 1 });

// Export model - COMMON DATABASE ONLY
// This model is stored in the main/common database, NOT in tenant databases
// Owner access tokens are managed globally for SuperAdmin approval workflow
const OwnerAccessToken = mongoose.models.OwnerAccessToken || mongoose.model<IOwnerAccessToken>('OwnerAccessToken', OwnerAccessTokenSchema);

export default OwnerAccessToken;
