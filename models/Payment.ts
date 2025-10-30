import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentProvider = 'stripe' | 'razorpay';

export interface IPayment extends Document {
    _id: mongoose.Types.ObjectId;

    // Account Reference
    accountId: string;
    superAdminId: string;
    databaseName: string;

    // Plan Information
    plan: 'FREE' | 'PRO' | 'MAX';
    previousPlan: 'FREE' | 'PRO' | 'MAX';

    // Payment Details
    amount: number;
    currency: string;
    provider: PaymentProvider;
    providerPaymentId: string;
    status: PaymentStatus;

    // Billing Period
    billingPeriod: 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;

    // Webhook Data
    webhookData?: any;
    webhookReceivedAt?: Date;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    processedAt?: Date;
    failedAt?: Date;
    failureReason?: string;
}

const PaymentSchema = new Schema<IPayment>(
    {
        // Account Reference
        accountId: {
            type: String,
            required: true,
            index: true,
        },
        superAdminId: {
            type: String,
            required: true,
            index: true,
        },
        databaseName: {
            type: String,
            required: true,
            index: true,
        },

        // Plan Information
        plan: {
            type: String,
            enum: ['FREE', 'PRO', 'MAX'],
            required: true,
            index: true,
        },
        previousPlan: {
            type: String,
            enum: ['FREE', 'PRO', 'MAX'],
            required: true,
        },

        // Payment Details
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        provider: {
            type: String,
            enum: ['stripe', 'razorpay'],
            required: true,
            index: true,
        },
        providerPaymentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
            default: 'pending',
            index: true,
        },

        // Billing Period
        billingPeriod: {
            type: String,
            enum: ['monthly', 'yearly'],
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },

        // Webhook Data
        webhookData: {
            type: Schema.Types.Mixed,
        },
        webhookReceivedAt: {
            type: Date,
        },

        // Metadata
        processedAt: {
            type: Date,
        },
        failedAt: {
            type: Date,
        },
        failureReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
PaymentSchema.index({ accountId: 1, status: 1 });
PaymentSchema.index({ superAdminId: 1, status: 1 });
// Removed: providerPaymentId already has unique index
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ plan: 1, status: 1 });

// This model will be used in the main database for payment tracking
const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
