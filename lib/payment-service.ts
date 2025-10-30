import Stripe from 'stripe';
import Payment, { IPayment } from '../models/Payment';
import SuperAdmin from '../models/SuperAdmin';
import { getTenantConnection } from './tenant-db-connect';
import { AccountSchema, IAccount } from '../models/Account';
import { getPlanConfiguration } from './plan-service';

export type PlanType = 'FREE' | 'PRO' | 'MAX';
export type PaymentProvider = 'stripe' | 'razorpay';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

export interface PaymentIntentData {
    accountId: string;
    superAdminId: string;
    databaseName: string;
    plan: PlanType;
    previousPlan: PlanType;
    amount: number;
    currency: string;
    billingPeriod: 'monthly' | 'yearly';
}

/**
 * Create Stripe payment intent for plan upgrade
 */
export async function createStripePaymentIntent(data: PaymentIntentData): Promise<{
    success: boolean;
    clientSecret?: string;
    paymentIntentId?: string;
    error?: string;
}> {
    try {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(data.amount * 100), // Convert to cents
            currency: data.currency.toLowerCase(),
            metadata: {
                accountId: data.accountId,
                superAdminId: data.superAdminId,
                databaseName: data.databaseName,
                plan: data.plan,
                previousPlan: data.previousPlan,
                billingPeriod: data.billingPeriod,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Create payment record
        const payment = new Payment({
            accountId: data.accountId,
            superAdminId: data.superAdminId,
            databaseName: data.databaseName,
            plan: data.plan,
            previousPlan: data.previousPlan,
            amount: data.amount,
            currency: data.currency,
            provider: 'stripe',
            providerPaymentId: paymentIntent.id,
            status: 'pending',
            billingPeriod: data.billingPeriod,
            startDate: new Date(),
            endDate: calculateEndDate(data.billingPeriod),
        });

        await payment.save();

        return {
            success: true,
            clientSecret: paymentIntent.client_secret!,
            paymentIntentId: paymentIntent.id,
        };
    } catch (error) {
        console.error('Error creating Stripe payment intent:', error);
        return {
            success: false,
            error: 'PAYMENT_INTENT_CREATION_FAILED',
        };
    }
}

/**
 * Handle Stripe webhook for payment confirmation
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                return await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);

            case 'payment_intent.payment_failed':
                return await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);

            default:
                return { success: true };
        }
    } catch (error) {
        console.error('Error handling Stripe webhook:', error);
        return { success: false, error: 'WEBHOOK_HANDLING_FAILED' };
    }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const metadata = paymentIntent.metadata;
        const { accountId, superAdminId, databaseName, plan, previousPlan, billingPeriod } = metadata;

        // Update payment record
        await Payment.findOneAndUpdate(
            { providerPaymentId: paymentIntent.id },
            {
                status: 'completed',
                processedAt: new Date(),
                webhookData: paymentIntent,
                webhookReceivedAt: new Date(),
            }
        );

        // Update account plan
        await upgradeAccountPlan(accountId, superAdminId, databaseName, plan as PlanType, previousPlan as PlanType, billingPeriod as 'monthly' | 'yearly');

        // Update SuperAdmin revenue
        await updateSuperAdminRevenue(superAdminId, paymentIntent.amount / 100);

        console.log(`✅ Payment successful for account ${accountId}, upgraded to ${plan}`);
        return { success: true };
    } catch (error) {
        console.error('Error handling payment success:', error);
        return { success: false, error: 'PAYMENT_SUCCESS_HANDLING_FAILED' };
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await Payment.findOneAndUpdate(
            { providerPaymentId: paymentIntent.id },
            {
                status: 'failed',
                failedAt: new Date(),
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
                webhookData: paymentIntent,
                webhookReceivedAt: new Date(),
            }
        );

        console.log(`❌ Payment failed for ${paymentIntent.id}`);
        return { success: true };
    } catch (error) {
        console.error('Error handling payment failure:', error);
        return { success: false, error: 'PAYMENT_FAILURE_HANDLING_FAILED' };
    }
}

/**
 * Upgrade account plan
 */
async function upgradeAccountPlan(
    accountId: string,
    superAdminId: string,
    databaseName: string,
    newPlan: PlanType,
    previousPlan: PlanType,
    billingPeriod: 'monthly' | 'yearly'
): Promise<void> {
    try {
        const superAdmin = await SuperAdmin.findById(superAdminId);
        if (!superAdmin) return;

        const tenantConnection = await getTenantConnection(superAdminId, superAdmin.organizationName);
        const Account = tenantConnection.model<IAccount>('Account', AccountSchema);

        // Get new plan configuration
        const planConfig = await getPlanConfiguration(superAdminId, newPlan);
        if (!planConfig) return;

        // Calculate plan dates
        const now = new Date();
        const endDate = calculateEndDate(billingPeriod);

        // Update account
        await Account.findByIdAndUpdate(accountId, {
            plan: newPlan,
            planStartDate: now,
            planEndDate: endDate,
            isPlanActive: true,
            features: planConfig.features.allowedPages,
            limits: {
                maxApiCalls: planConfig.features.maxApiCalls,
                maxStorage: planConfig.features.maxStorage,
                maxDownloads: planConfig.features.maxDownloads,
                maxPages: planConfig.features.maxPages,
            },
        });

        // Update SuperAdmin usage statistics
        await updateSuperAdminUsageStats(superAdminId, previousPlan, newPlan);

        console.log(`✅ Account ${accountId} upgraded from ${previousPlan} to ${newPlan}`);
    } catch (error) {
        console.error('Error upgrading account plan:', error);
    }
}

/**
 * Update SuperAdmin usage statistics
 */
async function updateSuperAdminUsageStats(superAdminId: string, previousPlan: PlanType, newPlan: PlanType): Promise<void> {
    try {
        const superAdmin = await SuperAdmin.findById(superAdminId);
        if (!superAdmin) return;

        const updates: any = {};

        // Decrement previous plan count
        if (previousPlan !== 'FREE') {
            updates[`usage.${previousPlan.toLowerCase()}Accounts`] = -1;
        }

        // Increment new plan count
        if (newPlan !== 'FREE') {
            updates[`usage.${newPlan.toLowerCase()}Accounts`] = 1;
        }

        await SuperAdmin.findByIdAndUpdate(superAdminId, { $inc: updates });
    } catch (error) {
        console.error('Error updating SuperAdmin usage stats:', error);
    }
}

/**
 * Update SuperAdmin revenue
 */
async function updateSuperAdminRevenue(superAdminId: string, amount: number): Promise<void> {
    try {
        await SuperAdmin.findByIdAndUpdate(superAdminId, {
            $inc: {
                'usage.totalRevenue': amount,
                'usage.monthlyRevenue': amount,
            },
        });
    } catch (error) {
        console.error('Error updating SuperAdmin revenue:', error);
    }
}

/**
 * Calculate plan end date based on billing period
 */
function calculateEndDate(billingPeriod: 'monthly' | 'yearly'): Date {
    const now = new Date();
    if (billingPeriod === 'monthly') {
        return new Date(now.setMonth(now.getMonth() + 1));
    } else {
        return new Date(now.setFullYear(now.getFullYear() + 1));
    }
}

/**
 * Create Razorpay order for plan upgrade
 */
export async function createRazorpayOrder(data: PaymentIntentData): Promise<{
    success: boolean;
    orderId?: string;
    amount?: number;
    currency?: string;
    error?: string;
}> {
    try {
        // This would integrate with Razorpay API
        // For now, return a mock response
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create payment record
        const payment = new Payment({
            accountId: data.accountId,
            superAdminId: data.superAdminId,
            databaseName: data.databaseName,
            plan: data.plan,
            previousPlan: data.previousPlan,
            amount: data.amount,
            currency: data.currency,
            provider: 'razorpay',
            providerPaymentId: orderId,
            status: 'pending',
            billingPeriod: data.billingPeriod,
            startDate: new Date(),
            endDate: calculateEndDate(data.billingPeriod),
        });

        await payment.save();

        return {
            success: true,
            orderId,
            amount: data.amount,
            currency: data.currency,
        };
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return {
            success: false,
            error: 'RAZORPAY_ORDER_CREATION_FAILED',
        };
    }
}

/**
 * Handle Razorpay webhook
 */
export async function handleRazorpayWebhook(
    event: any,
    signature: string
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Verify webhook signature
        // const isValid = razorpay.webhooks.verify(event, signature);
        // if (!isValid) {
        //     return { success: false, error: 'INVALID_SIGNATURE' };
        // }

        switch (event.event) {
            case 'payment.captured':
                return await handleRazorpayPaymentSuccess(event.payload.payment.entity);

            case 'payment.failed':
                return await handleRazorpayPaymentFailure(event.payload.payment.entity);

            default:
                return { success: true };
        }
    } catch (error) {
        console.error('Error handling Razorpay webhook:', error);
        return { success: false, error: 'RAZORPAY_WEBHOOK_HANDLING_FAILED' };
    }
}

/**
 * Handle Razorpay payment success
 */
async function handleRazorpayPaymentSuccess(payment: any): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Find payment record
        const paymentRecord = await Payment.findOne({
            providerPaymentId: payment.order_id,
            provider: 'razorpay',
        });

        if (!paymentRecord) {
            return { success: false, error: 'PAYMENT_RECORD_NOT_FOUND' };
        }

        // Update payment record
        await Payment.findByIdAndUpdate(paymentRecord._id, {
            status: 'completed',
            processedAt: new Date(),
            webhookData: payment,
            webhookReceivedAt: new Date(),
        });

        // Update account plan
        await upgradeAccountPlan(
            paymentRecord.accountId,
            paymentRecord.superAdminId,
            paymentRecord.databaseName,
            paymentRecord.plan,
            paymentRecord.previousPlan,
            paymentRecord.billingPeriod
        );

        // Update SuperAdmin revenue
        await updateSuperAdminRevenue(paymentRecord.superAdminId, payment.amount / 100);

        console.log(`✅ Razorpay payment successful for account ${paymentRecord.accountId}`);
        return { success: true };
    } catch (error) {
        console.error('Error handling Razorpay payment success:', error);
        return { success: false, error: 'RAZORPAY_PAYMENT_SUCCESS_HANDLING_FAILED' };
    }
}

/**
 * Handle Razorpay payment failure
 */
async function handleRazorpayPaymentFailure(payment: any): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        await Payment.findOneAndUpdate(
            { providerPaymentId: payment.order_id, provider: 'razorpay' },
            {
                status: 'failed',
                failedAt: new Date(),
                failureReason: payment.error_description || 'Payment failed',
                webhookData: payment,
                webhookReceivedAt: new Date(),
            }
        );

        console.log(`❌ Razorpay payment failed for ${payment.order_id}`);
        return { success: true };
    } catch (error) {
        console.error('Error handling Razorpay payment failure:', error);
        return { success: false, error: 'RAZORPAY_PAYMENT_FAILURE_HANDLING_FAILED' };
    }
}

/**
 * Get payment history for an account
 */
export async function getPaymentHistory(accountId: string, superAdminId: string): Promise<IPayment[]> {
    try {
        return await Payment.find({
            accountId,
            superAdminId,
        }).sort({ createdAt: -1 });
    } catch (error) {
        console.error('Error getting payment history:', error);
        return [];
    }
}
