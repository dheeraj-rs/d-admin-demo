import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
    tenantId: string; // Unique tenant identifier
    hostname: string; // Subdomain or custom domain (e.g., "company1" for company1.yourdomain.com)
    adminId: mongoose.Types.ObjectId; // Reference to the admin who owns this tenant
    adminEmail: string;
    organizationName: string;
    organizationKey: string; // Unique key for this organization
    
    // Tenant settings
    isActive: boolean;
    plan: 'free' | 'pro' | 'max';
    maxUsers: number;
    
    // Custom branding
    logo?: string;
    primaryColor?: string;
    customDomain?: string; // Optional custom domain
    
    // Metadata
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt?: Date;
}

const TenantSchema = new Schema<ITenant>(
    {
        tenantId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        hostname: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: 'TenantAdmin',
            required: true,
            index: true,
        },
        adminEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        organizationName: {
            type: String,
            required: true,
        },
        organizationKey: {
            type: String,
            required: true,
            unique: true,
            // index: true removed - unique already creates an index
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        plan: {
            type: String,
            enum: ['free', 'pro', 'max'],
            default: 'free',
        },
        maxUsers: {
            type: Number,
            default: 10, // Free plan default
        },
        logo: {
            type: String,
        },
        primaryColor: {
            type: String,
            default: '#3b82f6',
        },
        customDomain: {
            type: String,
            unique: true,
            sparse: true, // Allows null values to be non-unique
        },
        lastAccessedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for fast lookups
TenantSchema.index({ hostname: 1, isActive: 1 });
// Removed: organizationKey already has unique index
// Removed: customDomain already has unique index with sparse option

// Static method: Find tenant by hostname
TenantSchema.statics.findByHostname = async function(hostname: string) {
    return this.findOne({
        $or: [
            { hostname: hostname.toLowerCase() },
            { customDomain: hostname.toLowerCase() }
        ],
        isActive: true,
    });
};

// Static method: Find tenant by organization key
TenantSchema.statics.findByOrgKey = async function(orgKey: string) {
    return this.findOne({
        organizationKey: orgKey,
        isActive: true,
    });
};

const Tenant = mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);

export default Tenant;
