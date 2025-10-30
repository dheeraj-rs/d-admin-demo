import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * LEGACY MODEL - Use Account.ts instead
 * This is a stub for backward compatibility
 */

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, default: 'user' },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
