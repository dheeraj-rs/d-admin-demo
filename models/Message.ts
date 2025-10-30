import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    title: string;
    description: string;
    icon: string;
    timestamp: Date;
    isRead: boolean;
    recipientId?: string; // Optional: specific admin/user ID
    recipientRole?: 'admin' | 'owner' | 'all'; // Who can see this message
    type: 'info' | 'warning' | 'success' | 'error';
    category?: 'system' | 'admin-permission' | 'admin-request' | 'approval-request' | 'general';
    link?: string; // Optional: link to related page
    createdBy?: string; // Admin who created the message
}

const MessageSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        icon: {
            type: String,
            default: 'pi-bell'
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        isRead: {
            type: Boolean,
            default: false
        },
        recipientId: {
            type: String,
            trim: true
        },
        recipientRole: {
            type: String,
            enum: ['admin', 'owner', 'all'],
            default: 'all'
        },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'error'],
            default: 'info'
        },
        category: {
            type: String,
            enum: ['system', 'admin-permission', 'admin-request', 'approval-request', 'general'],
            default: 'general'
        },
        link: {
            type: String,
            trim: true
        },
        createdBy: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ recipientId: 1, isRead: 1 });
MessageSchema.index({ recipientRole: 1, isRead: 1 });

// Export schema for tenant-specific model creation
// DO NOT create a global model - this should only exist in tenant databases
export { MessageSchema };

// For backward compatibility and type exports only
// This model should NOT be used directly - use getTenantMessageModel() instead
const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
