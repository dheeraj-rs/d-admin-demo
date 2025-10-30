import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminInvite extends Document {
    email: string;
    token: string;
    organizationName?: string;
    invitedBy: string; // Owner email
    status: 'pending' | 'accepted' | 'expired' | 'cancelled';
    expiresAt: Date;
    createdAt: Date;
    acceptedAt?: Date;
    markAsAccepted(superAdminId: string): Promise<IAdminInvite>;
}

// Instance methods interface
interface IAdminInviteMethods {
    markAsAccepted(superAdminId: string): Promise<IAdminInvite>;
}

// Static methods interface
interface IAdminInviteModel extends Model<IAdminInvite, {}, IAdminInviteMethods> {
    findPendingByEmail(email: string): Promise<IAdminInvite | null>;
    findByToken(token: string): Promise<IAdminInvite | null>;
    isValidInvite(token: string): Promise<IAdminInvite | null>;
}

const AdminInviteSchema = new Schema<IAdminInvite>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        organizationName: {
            type: String,
            required: false,
        },
        invitedBy: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'expired', 'cancelled'],
            default: 'pending',
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        acceptedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for email and status lookups
AdminInviteSchema.index({ email: 1, status: 1 });

// Static method: Find pending invite by email
AdminInviteSchema.statics.findPendingByEmail = async function(email: string) {
    return this.findOne({
        email: email.toLowerCase().trim(),
        status: 'pending',
        expiresAt: { $gt: new Date() },
    });
};

// Static method: Find invite by token
AdminInviteSchema.statics.findByToken = async function(token: string) {
    return this.findOne({
        token,
        status: 'pending',
        expiresAt: { $gt: new Date() },
    });
};

// Static method: Check if invite is valid (alias for findByToken)
AdminInviteSchema.statics.isValidInvite = async function(token: string) {
    return this.findOne({
        token,
        status: 'pending',
        expiresAt: { $gt: new Date() },
    });
};

// Instance method: Mark invite as accepted
AdminInviteSchema.methods.markAsAccepted = async function(superAdminId: string) {
    this.status = 'accepted';
    this.acceptedAt = new Date();
    return await this.save();
};

const AdminInvite = (mongoose.models.AdminInvite as IAdminInviteModel) || 
    mongoose.model<IAdminInvite, IAdminInviteModel>('AdminInvite', AdminInviteSchema);

export default AdminInvite;
