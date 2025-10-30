import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * ==========================================
 * PLAN PERMISSIONS MODEL
 * ==========================================
 * 
 * Stores page-level permissions for each plan tier (FREE/PRO/MAX)
 * Controls read, write, and delete access to application pages
 * Ensures high security with granular permission control
 * ==========================================
 */

export interface IPagePermission {
    pagePath: string;
    pageName: string;
    category: string;
    free: {
        read: boolean;
        write: boolean;
        delete: boolean;
    };
    pro: {
        read: boolean;
        write: boolean;
        delete: boolean;
    };
    max: {
        read: boolean;
        write: boolean;
        delete: boolean;
    };
}

export interface IPlanPermissions extends Document {
    _id: mongoose.Types.ObjectId;
    
    // Tenant Association
    tenantId?: string; // Optional: For tenant-specific permissions
    adminId?: string; // Optional: For admin-specific overrides
    
    // Global or Tenant-specific
    isGlobal: boolean; // If true, applies to all tenants
    
    // Permissions Array
    permissions: IPagePermission[];
    
    // Metadata
    version: number; // Version control for permissions
    lastModifiedBy: string; // Admin/Owner who last modified
    lastModifiedAt: Date;
    
    // Audit Trail
    changeHistory: Array<{
        modifiedBy: string;
        modifiedAt: Date;
        changes: string;
        version: number;
    }>;
    
    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const PlanPermissionsSchema = new Schema<IPlanPermissions>(
    {
        // Tenant Association
        tenantId: {
            type: String,
            index: true,
            sparse: true,
        },
        adminId: {
            type: String,
            index: true,
            sparse: true,
        },
        
        // Global Flag
        isGlobal: {
            type: Boolean,
            default: true,
            index: true,
        },
        
        // Permissions Array
        permissions: [
            {
                pagePath: {
                    type: String,
                    required: true,
                },
                pageName: {
                    type: String,
                    required: true,
                },
                category: {
                    type: String,
                    required: true,
                },
                free: {
                    read: { type: Boolean, default: true },
                    write: { type: Boolean, default: true },
                    delete: { type: Boolean, default: true },
                },
                pro: {
                    read: { type: Boolean, default: false },
                    write: { type: Boolean, default: false },
                    delete: { type: Boolean, default: false },
                },
                max: {
                    read: { type: Boolean, default: false },
                    write: { type: Boolean, default: false },
                    delete: { type: Boolean, default: false },
                },
            },
        ],
        
        // Metadata
        version: {
            type: Number,
            default: 1,
        },
        lastModifiedBy: {
            type: String,
            required: true,
        },
        lastModifiedAt: {
            type: Date,
            default: Date.now,
        },
        
        // Audit Trail
        changeHistory: [
            {
                modifiedBy: String,
                modifiedAt: { type: Date, default: Date.now },
                changes: String,
                version: Number,
            },
        ],
    },
    {
        timestamps: true,
        collection: 'planpermissions',
    }
);

// Indexes for efficient queries
PlanPermissionsSchema.index({ isGlobal: 1, version: -1 });
PlanPermissionsSchema.index({ tenantId: 1, version: -1 });
PlanPermissionsSchema.index({ 'permissions.pagePath': 1 });

// Pre-save middleware for version control
PlanPermissionsSchema.pre('save', function (next) {
    if (this.isModified('permissions')) {
        this.version += 1;
        this.lastModifiedAt = new Date();
    }
    next();
});

// Static method to get active permissions
PlanPermissionsSchema.statics.getActivePermissions = async function (
    tenantId?: string
): Promise<IPlanPermissions | null> {
    // First try to get tenant-specific permissions
    if (tenantId) {
        const tenantPermissions = await this.findOne({ tenantId, isGlobal: false })
            .sort({ version: -1 })
            .lean();
        if (tenantPermissions) {
            return tenantPermissions;
        }
    }
    
    // Fall back to global permissions
    return this.findOne({ isGlobal: true })
        .sort({ version: -1 })
        .lean();
};

// Static method to check permission
PlanPermissionsSchema.statics.checkPermission = async function (
    pagePath: string,
    plan: 'FREE' | 'PRO' | 'MAX',
    action: 'read' | 'write' | 'delete',
    tenantId?: string
): Promise<boolean> {
    // Get active permissions using the correct method
    let permissions;
    if (tenantId) {
        permissions = await this.findOne({ tenantId, isGlobal: false })
            .sort({ version: -1 })
            .lean();
    }
    if (!permissions) {
        permissions = await this.findOne({ isGlobal: true })
            .sort({ version: -1 })
            .lean();
    }
    
    if (!permissions) {
        // Default: allow FREE plan full access when no permissions configured
        return plan === 'FREE';
    }
    
    const pagePermission = permissions.permissions.find((p: IPagePermission) => p.pagePath === pagePath);
    
    if (!pagePermission) {
        // Default: allow FREE plan when page not found in permissions
        return plan === 'FREE';
    }
    
    const planKey = plan.toLowerCase() as 'free' | 'pro' | 'max';
    return pagePermission[planKey][action] || false;
};

// Instance method to add change to history
PlanPermissionsSchema.methods.addToHistory = function (modifiedBy: string, changes: string) {
    this.changeHistory.push({
        modifiedBy,
        modifiedAt: new Date(),
        changes,
        version: this.version,
    });
};

// Export model
const PlanPermissions: Model<IPlanPermissions> =
    mongoose.models.PlanPermissions || mongoose.model<IPlanPermissions>('PlanPermissions', PlanPermissionsSchema);

export default PlanPermissions;
