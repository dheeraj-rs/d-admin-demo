import mongoose, { Schema, Document, Model } from 'mongoose';

export type PlanType = 'FREE' | 'PRO' | 'MAX';

export interface IPlanConfiguration extends Document {
    _id: mongoose.Types.ObjectId;

    // SuperAdmin Reference
    superAdminId: string;

    // Plan Type
    plan: PlanType;

    // Feature Configuration
    features: {
        // Basic Features
        dashboard: boolean;
        profile: boolean;
        settings: boolean;

        // Content Features
        elements: boolean;
        addElements: boolean;
        websiteBuilder: boolean;
        aiWebsites: boolean;

        // Advanced Features
        analytics: boolean;
        customBranding: boolean;
        apiAccess: boolean;
        webhooks: boolean;

        // Storage & Limits
        maxStorage: number; // in MB
        maxApiCalls: number;
        maxDownloads: number;
        maxPages: number;
        maxWebsites: number;

        // Page Access
        allowedPages: string[];
        restrictedPages: string[];

        // Custom Features (SuperAdmin can define)
        customFeatures: {
            name: string;
            enabled: boolean;
            description?: string;
        }[];
    };

    // Pricing
    price: {
        monthly: number;
        yearly: number;
        currency: string;
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

const CustomFeatureSchema = new Schema(
    {
        name: { type: String, required: true },
        enabled: { type: Boolean, default: false },
        description: { type: String },
    },
    { _id: false }
);

const PlanFeaturesSchema = new Schema(
    {
        // Basic Features
        dashboard: { type: Boolean, default: true },
        profile: { type: Boolean, default: true },
        settings: { type: Boolean, default: true },

        // Content Features
        elements: { type: Boolean, default: true },
        addElements: { type: Boolean, default: false },
        websiteBuilder: { type: Boolean, default: false },
        aiWebsites: { type: Boolean, default: true },

        // Advanced Features
        analytics: { type: Boolean, default: false },
        customBranding: { type: Boolean, default: false },
        apiAccess: { type: Boolean, default: false },
        webhooks: { type: Boolean, default: false },

        // Storage & Limits
        maxStorage: { type: Number, default: 100 }, // 100MB for FREE
        maxApiCalls: { type: Number, default: 100 },
        maxDownloads: { type: Number, default: 10 },
        maxPages: { type: Number, default: 5 },
        maxWebsites: { type: Number, default: 1 },

        // Page Access
        allowedPages: [{ type: String }],
        restrictedPages: [{ type: String }],

        // Custom Features
        customFeatures: [CustomFeatureSchema],
    },
    { _id: false }
);

const PriceSchema = new Schema(
    {
        monthly: { type: Number, required: true },
        yearly: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
    },
    { _id: false }
);

const PlanConfigurationSchema = new Schema<IPlanConfiguration>(
    {
        superAdminId: {
            type: String,
            required: true,
            index: true,
        },
        plan: {
            type: String,
            enum: ['FREE', 'PRO', 'MAX'],
            required: true,
            index: true,
        },
        features: {
            type: PlanFeaturesSchema,
            required: true,
        },
        price: {
            type: PriceSchema,
            required: true,
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

// Indexes
PlanConfigurationSchema.index({ superAdminId: 1, plan: 1 }, { unique: true });
PlanConfigurationSchema.index({ plan: 1, isActive: 1 });

// This model will be used in the main database for SuperAdmin plan configurations
const PlanConfiguration: Model<IPlanConfiguration> =
    mongoose.models.PlanConfiguration || mongoose.model<IPlanConfiguration>('PlanConfiguration', PlanConfigurationSchema);

export default PlanConfiguration;
