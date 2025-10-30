import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

/**
 * ==========================================
 * MULTI-TENANT ARCHITECTURE - Admin Model
 * ==========================================
 *
 * TENANT-BASED STORAGE STRATEGY:
 *
 * SINGLE DATABASE (d-admin):
 *    - Stores ALL Admin accounts
 *    - Stores ALL Accounts (with tenantId)
 *    - Stores ALL Admins (with tenantId)
 *    - Stores ALL Users (with tenantId)
 *    - Stores ALL Websites (with tenantId)
 *    - Stores Owner account
 *    - Stores OwnerNotifications
 *    - Stores PlanConfigurations
 *
 * TENANT ISOLATION:
 *    - Each Admin has a unique tenantId
 *    - All data (Accounts, Admins, Users, etc.) includes tenantId field
 *    - Data is filtered by tenantId for complete isolation
 *    - Hostname is used for multi-domain support
 *
 * REGISTRATION FLOW:
 * 1. Admin registers → saved to main database (d-admin)
 * 2. organizationKey generated (e.g., ORG_LXZ8K9_4A3B2C1D)
 * 3. tenantId generated (unique UUID)
 * 4. hostname assigned (e.g., techcorp.d-admin.com)
 * 5. All accounts/users created with this tenantId
 *
 * EXAMPLE:
 * Admin "TechCorp" registers:
 *   - Admin record → d-admin (main DB)
 *   - organizationKey: "ORG_LXZ8K9_4A3B2C1D"
 *   - tenantId: "tenant_abc123xyz"
 *   - hostname: "techcorp.d-admin.com"
 *   - Their accounts → d-admin (main DB) with tenantId: "tenant_abc123xyz"
 *
 * Admin "StartupXYZ" registers:
 *   - Admin record → d-admin (main DB)
 *   - organizationKey: "ORG_MNO5P6_8E7F6G5H"
 *   - tenantId: "tenant_def456uvw"
 *   - hostname: "startupxyz.d-admin.com"
 *   - Their accounts → d-admin (main DB) with tenantId: "tenant_def456uvw"
 *
 * ISOLATION:
 * ✅ Complete data isolation between tenants via tenantId
 * ✅ Single database with tenant filtering
 * ✅ No cross-tenant data access possible
 * ✅ Scalable architecture with hostname support
 * ✅ Multi-domain support via hostname
 * ==========================================
 */

export interface IAdmin extends Document {
    _id: mongoose.Types.ObjectId;

    // Role (always 'admin' for this model)
    role: 'admin';

    organizationKey: string;
    email: string;
    googleId: string;
    name: string;
    profilePicture?: string;

    // Organization Details
    organizationName: string;
    industry?: string;
    website?: string;
    companySize?: string;
    country?: string;

    // Tenant Information
    tenantId: string; // Unique tenant identifier
    hostname: string; // Tenant hostname (e.g., techcorp.d-admin.com)

    // Approval Workflow
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: string; // Owner email who approved
    approvedAt?: Date;
    rejectedReason?: string;

    // Plan Configuration Management
    planConfigurations: {
        FREE: any; // PlanConfiguration reference
        PRO: any; // PlanConfiguration reference
        MAX: any; // PlanConfiguration reference
    };

    // Usage Tracking
    usage: {
        totalAccounts: number;
        freeAccounts: number;
        proAccounts: number;
        maxAccounts: number;
        totalRevenue: number;
        monthlyRevenue: number;
    };

    // Security
    pin?: string;
    pinSetup: boolean;
    twoFactorEnabled: boolean;

    // Metadata
    createdAt: Date;
    lastLogin?: Date;
    isActive: boolean;
    isBlocked: boolean;
    blockedReason?: string;
    blockedAt?: Date;
    blockedBy?: string; // Owner email who blocked

    // Methods
    getTenantId(): string;
    getHostname(): string;
    canCreateAccount(): boolean;
    getPlanConfiguration(plan: 'FREE' | 'PRO' | 'MAX'): any;
}

const AdminSchema = new Schema<IAdmin>(
    {
        // Role
        role: {
            type: String,
            default: 'admin',
            immutable: true,
            enum: ['admin'],
        },

        // Unique, immutable organization key (auto-generated)
        organizationKey: {
            type: String,
            unique: true,
            immutable: true,
        },

        // Google OAuth
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        googleId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        profilePicture: {
            type: String,
        },

        // Organization Details
        organizationName: {
            type: String,
            required: true,
            trim: true,
        },
        industry: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        companySize: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        },
        country: {
            type: String,
            trim: true,
        },

        // Tenant Information
        tenantId: {
            type: String,
            unique: true,
            index: true,
            immutable: true,
        },
        hostname: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
            lowercase: true,
            trim: true,
            default: 'localhost:3000',
        },

        // Approval Workflow
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        approvedBy: {
            type: String,
            trim: true,
        },
        approvedAt: {
            type: Date,
        },
        rejectedReason: {
            type: String,
            trim: true,
        },

        // Plan Configuration Management
        planConfigurations: {
            FREE: {
                type: Schema.Types.ObjectId,
                ref: 'PlanConfiguration',
            },
            PRO: {
                type: Schema.Types.ObjectId,
                ref: 'PlanConfiguration',
            },
            MAX: {
                type: Schema.Types.ObjectId,
                ref: 'PlanConfiguration',
            },
        },

        // Usage Tracking
        usage: {
            totalAccounts: {
                type: Number,
                default: 0,
            },
            freeAccounts: {
                type: Number,
                default: 0,
            },
            proAccounts: {
                type: Number,
                default: 0,
            },
            maxAccounts: {
                type: Number,
                default: 0,
            },
            totalRevenue: {
                type: Number,
                default: 0,
            },
            monthlyRevenue: {
                type: Number,
                default: 0,
            },
        },

        // Security
        pin: {
            type: String,
            select: false,
        },
        pinSetup: {
            type: Boolean,
            default: false,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },

        // Metadata
        lastLogin: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        blockedReason: {
            type: String,
            trim: true,
        },
        blockedAt: {
            type: Date,
        },
        blockedBy: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate organizationKey, tenantId, and hostname
AdminSchema.pre('save', function (next) {
    if (this.isNew) {
        try {
            // Validate organizationName is present
            if (!this.organizationName || this.organizationName.trim() === '') {
                throw new Error('organizationName is required to generate tenant information');
            }

            // Generate unique organization key if not exists
            if (!this.organizationKey) {
                const timestamp = Date.now().toString(36);
                const random = crypto.randomBytes(4).toString('hex');
                this.organizationKey = `ORG_${timestamp}_${random}`.toUpperCase();
                console.log('✅ Generated organizationKey:', this.organizationKey);
            }

            // Generate tenantId if not exists
            if (!this.tenantId) {
                const timestamp = Date.now().toString(36);
                const random = crypto.randomBytes(8).toString('hex');
                this.tenantId = `tenant_${timestamp}_${random}`;
                console.log('✅ Generated tenantId:', this.tenantId);
            }

            // Generate hostname if not exists
            if (!this.hostname) {
                // Clean organization name for hostname
                const cleanName = this.organizationName
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-') // Replace multiple dashes with single dash
                    .replace(/^-|-$/g, '') // Remove leading/trailing dashes
                    .substring(0, 50); // Limit length

                // Use last 4 chars of tenantId for uniqueness
                const last4 = this.tenantId.slice(-4).toLowerCase();
                this.hostname = `${cleanName}-${last4}.d-admin.com`;
                console.log('✅ Generated hostname:', this.hostname);
            }

            next();
        } catch (error: any) {
            console.error('❌ Pre-save hook error:', error.message);
            next(error);
        }
    } else {
        next();
    }
});

// Instance Methods
AdminSchema.methods.getTenantId = function (): string {
    return this.tenantId;
};

AdminSchema.methods.getHostname = function (): string {
    return this.hostname;
};

AdminSchema.methods.canCreateAccount = function (): boolean {
    // Admin can create unlimited accounts
    return this.isActive && !this.isBlocked;
};

AdminSchema.methods.getPlanConfiguration = function (plan: 'FREE' | 'PRO' | 'MAX'): any {
    return this.planConfigurations[plan];
};

// Static Methods
AdminSchema.statics.findByOrganizationKey = function (organizationKey: string) {
    return this.findOne({ organizationKey, isActive: true });
};

AdminSchema.statics.findPendingApprovals = function () {
    return this.find({ approvalStatus: 'pending', isActive: true }).sort({ createdAt: -1 });
};

// Compound Indexes (single field indexes already defined in schema with unique: true or index: true)
// organizationKey, email, tenantId, hostname already have single indexes via unique/index properties
AdminSchema.index({ email: 1, isActive: 1 });
// Removed: organizationKey already has unique index
AdminSchema.index({ tenantId: 1, isActive: 1 });
// Removed: hostname already has unique index  
AdminSchema.index({ approvalStatus: 1, createdAt: -1 });

// Export model - MAIN DATABASE
// This model is stored in the main database (d-admin)
// Used for authentication and tenant management
// Collection name: 'superadmins' in MongoDB
const SuperAdmin: Model<IAdmin> = mongoose.models.SuperAdmin || mongoose.model<IAdmin>('SuperAdmin', AdminSchema);

export default SuperAdmin;
