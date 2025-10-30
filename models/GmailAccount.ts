import mongoose, { Schema, Document } from 'mongoose';

export interface INoteItem {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGmailAccount extends Document {
    email: string;
    password: string;
    name: string;
    category: 'personal' | 'gaming' | 'backup' | 'testing' | 'professional' | 'pro-mails';
    notes: INoteItem[];
    createdAt: Date;
    updatedAt: Date;
}

const GmailAccountSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['personal', 'gaming', 'backup', 'testing', 'professional', 'pro-mails'],
            default: 'personal',
        },
        notes: {
            type: Schema.Types.Mixed,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Export schema for tenant-specific model creation
// DO NOT create a global model - this should only exist in tenant databases
export { GmailAccountSchema };

// For backward compatibility and type exports only
// This model should NOT be used directly - use getTenantGmailAccountModel() instead
const GmailAccount = mongoose.models.GmailAccount || mongoose.model<IGmailAccount>('GmailAccount', GmailAccountSchema);

export default GmailAccount;
