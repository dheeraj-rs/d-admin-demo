import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOwner extends Document {
    _id: mongoose.Types.ObjectId;
    role: 'owner';
    googleId: string;
    email: string;
    name: string;
    password?: string;
    passwordRequired: boolean;
    twoFactorEnabled: boolean;
    backupKeys: {
        key: string;
        generatedAt: Date;
        isActive: boolean;
        lastUsed?: Date;
    }[];
    config?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    isActive: boolean;

    // Methods
    canApproveOrganization(): boolean;
    hasGlobalAccess(): boolean;
}

const OwnerSchema = new Schema<IOwner>(
    {
        role: {
            type: String,
            default: 'owner',
            immutable: true,
            enum: ['owner'],
        },
        googleId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            select: false, // Don't include by default in queries
        },
        passwordRequired: {
            type: Boolean,
            default: true,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        backupKeys: [
            {
                key: {
                    type: String,
                    required: true,
                    // Removed select: false - we need to read keys for validation
                },
                generatedAt: {
                    type: Date,
                    default: Date.now,
                },
                isActive: {
                    type: Boolean,
                    default: true,
                },
                lastUsed: {
                    type: Date,
                },
            },
        ],
        config: {
            type: Schema.Types.Mixed,
            default: {},
        },
        lastLogin: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Instance Methods
OwnerSchema.methods.canApproveOrganization = function (): boolean {
    return true;
};

OwnerSchema.methods.hasGlobalAccess = function (): boolean {
    return true;
};

// Static Methods
OwnerSchema.statics.findActiveOwner = function () {
    return this.findOne();
};

// Indexes are already defined in schema fields with index: true
// No need to add duplicate indexes here

// Export model - MAIN DATABASE ONLY
const Owner: Model<IOwner> = mongoose.models.Owner || mongoose.model<IOwner>('Owner', OwnerSchema);

export default Owner;
