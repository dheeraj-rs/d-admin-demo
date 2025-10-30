import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Deletion Request Model
 * Handles deletion approval workflow for SuperAdmins
 */

export interface IDeletionRequest extends Document {
    _id: mongoose.Types.ObjectId;
    token: string;
    targetCollection: string;
    targetId: mongoose.Types.ObjectId;
    organizationKey: string;
    requestedBy: string;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    expiresAt: Date;
    approvedAt?: Date;
    approvedBy?: string;
    rejectedAt?: Date;
    rejectedBy?: string;
    rejectedReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DeletionRequestSchema = new Schema<IDeletionRequest>(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        targetCollection: {
            type: String,
            required: true,
            enum: ['superadmins', 'admins', 'accounts'],
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        organizationKey: {
            type: String,
            required: true,
        },
        requestedBy: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'expired'],
            default: 'pending',
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        approvedAt: Date,
        approvedBy: String,
        rejectedAt: Date,
        rejectedBy: String,
        rejectedReason: String,
    },
    {
        timestamps: true,
    }
);

// Index for cleanup of expired requests
DeletionRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
DeletionRequestSchema.index({ status: 1, createdAt: -1 });

const DeletionRequest: Model<IDeletionRequest> =
    mongoose.models.DeletionRequest || mongoose.model<IDeletionRequest>('DeletionRequest', DeletionRequestSchema);

export default DeletionRequest;
