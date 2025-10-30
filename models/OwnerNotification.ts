import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOwnerNotification extends Document {
    _id: mongoose.Types.ObjectId;
    type: 'invite_sent' | 'registration' | 'approval_request' | 'message' | 'status_change' | 'system';
    title: string;
    message: string;
    relatedUser?: {
        id: string;
        name: string;
        email: string;
        role: 'superadmin' | 'admin' | 'user';
    };
    metadata?: {
        organizationName?: string;
        organizationKey?: string;
        action?: string;
        status?: string;
        [key: string]: any;
    };
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    actionRequired: boolean;
    actionUrl?: string;
    createdAt: Date;
    readAt?: Date;
}

const OwnerNotificationSchema = new Schema<IOwnerNotification>(
    {
        type: {
            type: String,
            enum: ['invite_sent', 'registration', 'approval_request', 'message', 'status_change', 'system'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        relatedUser: {
            id: { type: String },
            name: { type: String },
            email: { type: String },
            role: { 
                type: String,
                enum: ['superadmin', 'admin', 'user'],
            },
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        actionRequired: {
            type: Boolean,
            default: false,
        },
        actionUrl: {
            type: String,
            trim: true,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
OwnerNotificationSchema.index({ isRead: 1, createdAt: -1 });
OwnerNotificationSchema.index({ type: 1, createdAt: -1 });
OwnerNotificationSchema.index({ priority: 1, createdAt: -1 });

const OwnerNotification: Model<IOwnerNotification> = 
    mongoose.models.OwnerNotification || 
    mongoose.model<IOwnerNotification>('OwnerNotification', OwnerNotificationSchema);

export default OwnerNotification;
