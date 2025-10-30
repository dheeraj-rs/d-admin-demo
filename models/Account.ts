import mongoose, { Schema, Document, Model } from 'mongoose';

export type PlanType = 'FREE' | 'PRO' | 'MAX';
export type AccountRoleType = 'account';

export interface IAccount extends Document {
    _id: mongoose.Types.ObjectId;
    role: AccountRoleType;
    // Google OAuth
    googleId: string;
    email: string;
    name: string;
    profilePicture?: string;

    // Tenant Association
    adminId: string; // Reference to Admin (tenant owner)
    organizationKey: string; // Organization key from Admin
    tenantId: string; // Tenant identifier for data isolation

    // Plan Information
    plan: PlanType;
    planStartDate?: Date;
    planEndDate?: Date;
    isPlanActive: boolean;

    // Features (from SuperAdmin's plan configuration)
    features: string[];

    // Usage Tracking
    usage: {
        apiCalls: number;
        storageUsed: number; // in MB
        downloads: number;
        lastActivity?: Date;
    };

    // Limits (from SuperAdmin's plan configuration)
    limits: {
        maxApiCalls: number;
        maxStorage: number; // in MB
        maxDownloads: number;
        maxPages: number;
    };

    // Account Status
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: Date;
    loginCount: number;

    // Metadata
    createdAt: Date;
    updatedAt: Date;

    // Methods
    canAccessFeature(feature: string): boolean;
    hasReachedLimit(limitType: 'apiCalls' | 'storage' | 'downloads' | 'pages' | 'projects'): boolean;
    isPlanExpired(): boolean;
    getRemainingUsage(limitType: 'apiCalls' | 'storage' | 'downloads' | 'pages' | 'projects'): number;
    upgradePlan(newPlan: PlanType): void;
    downgradePlan(newPlan: PlanType): void;
}

const AccountUsageSchema = new Schema(
    {
        apiCalls: { type: Number, default: 0 },
        storageUsed: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        lastActivity: { type: Date },
    },
    { _id: false }
);

const AccountLimitsSchema = new Schema(
    {
        maxApiCalls: { type: Number, default: 100 },
        maxStorage: { type: Number, default: 100 },
        maxDownloads: { type: Number, default: 10 },
        maxPages: { type: Number, default: 5 },
    },
    { _id: false }
);

const AccountSchema = new Schema<IAccount>(
    {
        // Role
        role: {
            type: String,
            default: 'account',
            immutable: true,
            enum: ['account'],
        },

        // Google OAuth
        googleId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        profilePicture: {
            type: String,
        },

        // Tenant Association
        adminId: {
            type: String,
            required: true,
            index: true,
        },
        organizationKey: {
            type: String,
            required: true,
            index: true,
        },
        tenantId: {
            type: String,
            required: true,
            index: true,
        },

        // Plan Information
        plan: {
            type: String,
            enum: ['FREE', 'PRO', 'MAX'],
            default: 'FREE',
            index: true,
        },
        planStartDate: {
            type: Date,
        },
        planEndDate: {
            type: Date,
        },
        isPlanActive: {
            type: Boolean,
            default: true,
        },

        // Features
        features: [
            {
                type: String,
            },
        ],

        // Usage Tracking
        usage: {
            type: AccountUsageSchema,
            default: () => ({}),
        },

        // Limits
        limits: {
            type: AccountLimitsSchema,
            default: () => ({}),
        },

        // Account Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
        loginCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Instance Methods
AccountSchema.methods.canAccessFeature = function (feature: string): boolean {
    // Check if feature is in the account's features array
    if (this.features.includes(feature)) return true;

    // Check plan-based features
    const planFeatures: Record<string, string[]> = {
        FREE: ['basic_elements', 'basic_templates'],
        PRO: ['basic_elements', 'basic_templates', 'advanced_elements', 'ai_generation', 'analytics'],
        MAX: ['basic_elements', 'basic_templates', 'advanced_elements', 'ai_generation', 'analytics', 'custom_domain', 'priority_support', 'api_access'],
    };

    return planFeatures[this.plan]?.includes(feature) || false;
};

AccountSchema.methods.hasReachedLimit = function (limitType: 'apiCalls' | 'storage' | 'downloads' | 'pages' | 'projects'): boolean {
    const usage = this.usage[limitType] || 0;
    const limitKey = `max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`;
    const limit = this.limits[limitKey] || 0;
    return usage >= limit;
};

AccountSchema.methods.isPlanExpired = function (): boolean {
    if (this.plan === 'FREE') return false;
    if (!this.planEndDate) return false;
    return new Date() > this.planEndDate;
};

AccountSchema.methods.getRemainingUsage = function (limitType: 'apiCalls' | 'storage' | 'downloads' | 'pages' | 'projects'): number {
    const usage = this.usage[limitType] || 0;
    const limitKey = `max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}`;
    const limit = this.limits[limitKey] || 0;
    return Math.max(0, limit - usage);
};

AccountSchema.methods.upgradePlan = function (newPlan: PlanType): void {
    const planHierarchy: Record<PlanType, number> = { FREE: 1, PRO: 2, MAX: 3 };
    const currentPlan = this.plan as PlanType;
    if (planHierarchy[newPlan] > planHierarchy[currentPlan]) {
        this.plan = newPlan;
        this.planStartDate = new Date();
        this.isPlanActive = true;
    }
};

AccountSchema.methods.downgradePlan = function (newPlan: PlanType): void {
    const planHierarchy: Record<PlanType, number> = { FREE: 1, PRO: 2, MAX: 3 };
    const currentPlan = this.plan as PlanType;
    if (planHierarchy[newPlan] < planHierarchy[currentPlan]) {
        this.plan = newPlan;
        this.planStartDate = new Date();
        this.isPlanActive = true;
    }
};

// Compound Indexes (single field indexes already defined in schema with index: true)
// googleId, email, tenantId, adminId, organizationKey, plan already have single indexes
AccountSchema.index({ tenantId: 1, plan: 1 });
AccountSchema.index({ tenantId: 1, email: 1 });
AccountSchema.index({ adminId: 1, plan: 1 });
// Removed: organizationKey already has index in schema
AccountSchema.index({ plan: 1, isActive: 1 });
AccountSchema.index({ role: 1 });

// Export the schema for use in the main database
// All accounts are stored in the main database with tenantId for isolation
const Account: mongoose.Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);

export { AccountSchema };
export default Account;
