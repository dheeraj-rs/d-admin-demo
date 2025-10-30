import mongoose, { Schema, Document } from 'mongoose';

export interface IAIWebsite extends Document {
    name: string;
    url: string;
    description: string;
    category:
        | 'chatting'
        | 'website-building'
        | 'video-editing'
        | 'photo-editing'
        | 'image-generation'
        | 'music-generation'
        | 'text-generation'
        | 'code-assistant'
        | 'design'
        | 'data-analysis'
        | 'productivity'
        | 'other';
    status: 'free' | 'paid' | 'freemium';
    featured?: boolean;
    priority: number;
    imageUrl?: string;
    iconUrl?: string;
    organizationKey?: string; // CRITICAL: Links website to Super Admin's organization
    createdBy?: {
        userId: string;
        userEmail: string;
        userName: string;
        userRole: 'superadmin' | 'admin' | 'user';
    };
    // Hierarchical tracking
    createdByUserId?: string; // ID of the user who created this (SuperAdmin/Admin/User)
    createdByUserRole?: 'superadmin' | 'admin' | 'user'; // Role of creator
    parentSuperAdminId?: string; // ID of the Super Admin (if created by Admin/User)
    parentAdminId?: string; // ID of the Admin (if created by User)
    createdAt: Date;
    updatedAt: Date;
}

const AIWebsiteSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Website name is required'],
            trim: true,
        },
        url: {
            type: String,
            required: [true, 'URL is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'chatting',
                'website-building',
                'video-editing',
                'photo-editing',
                'image-generation',
                'music-generation',
                'text-generation',
                'code-assistant',
                'design',
                'data-analysis',
                'productivity',
                'other',
            ],
            default: 'other',
        },
        status: {
            type: String,
            required: [true, 'Status is required'],
            enum: ['free', 'paid', 'freemium'],
            default: 'free',
        },
        featured: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: Number,
            default: 1,
        },
        imageUrl: {
            type: String,
            trim: true,
            default: '',
        },
        iconUrl: {
            type: String,
            trim: true,
            default: '',
        },
        organizationKey: {
            type: String,
            required: false, // Optional for backward compatibility
            index: true, // Index for faster queries
        },
        createdBy: {
            userId: String,
            userEmail: String,
            userName: String,
            userRole: String,
        },
        // Hierarchical tracking fields
        createdByUserId: {
            type: String,
            index: true, // Index for faster queries
        },
        createdByUserRole: {
            type: String,
            enum: ['superadmin', 'admin', 'user'],
        },
        parentSuperAdminId: {
            type: String,
            index: true, // Index for faster queries
        },
        parentAdminId: {
            type: String,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Export schema for tenant-specific model creation
// DO NOT create a global model - this should only exist in tenant databases
export { AIWebsiteSchema };

// For backward compatibility and type exports only
// This model should NOT be used directly - use getTenantAIWebsiteModel() instead
const AIWebsite = mongoose.models.AIWebsite || mongoose.model<IAIWebsite>('AIWebsite', AIWebsiteSchema);

export default AIWebsite;
