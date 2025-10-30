import { NextRequest, NextResponse } from 'next/server';
import { getPlanContext } from './plan-auth';
import PlanConfiguration from '../models/PlanConfiguration';
import { connectDB } from './mongodb';

// Re-export getPlanContext for convenience
export { getPlanContext };

/**
 * Middleware to enforce plan-based permissions in API routes
 * Checks if the account's plan allows access to the requested feature
 */
export async function enforcePlanPermission(
    request: NextRequest,
    requiredFeature: string
): Promise<{
    authorized: boolean;
    context?: Awaited<ReturnType<typeof getPlanContext>>;
    error?: string;
}> {
    try {
        const context = await getPlanContext(request);
        
        if (!context) {
            return { authorized: false, error: 'Authentication required' };
        }

        // Check if plan is active
        if (!context.isPlanActive) {
            return { authorized: false, error: 'Plan is not active' };
        }

        // Check if feature is allowed
        // FREE plan gets all features by default when no explicit feature list is configured
        const isFreeWithDefaultAccess = context.plan === 'FREE' && (context.features.length === 0 || context.features.includes('*'));
        const hasExplicitFeature = context.features.includes(requiredFeature) || context.features.includes('*');
        
        if (!isFreeWithDefaultAccess && !hasExplicitFeature) {
            return { authorized: false, error: 'Feature not available in your plan' };
        }

        return { authorized: true, context };
    } catch (error) {
        console.error('Plan permission enforcement error:', error);
        return { authorized: false, error: 'Permission check failed' };
    }
}

/**
 * Check if account has reached usage limits
 */
export async function checkUsageLimit(
    accountId: string,
    superAdminId: string,
    limitType: 'apiCalls' | 'storage' | 'downloads' | 'pages'
): Promise<{
    withinLimit: boolean;
    remaining: number;
    limit: number;
}> {
    try {
        await connectDB();
        
        // Get account from main database
        const Account = (await import('../models/Account')).default;
        
        const account = await Account.findById(accountId);
        if (!account) {
            return { withinLimit: false, remaining: 0, limit: 0 };
        }

        type UsageKey = 'apiCalls' | 'storageUsed' | 'downloads';
        type LimitKey = 'maxApiCalls' | 'maxStorage' | 'maxDownloads' | 'maxPages';
        
        const usageMap: Record<typeof limitType, UsageKey> = {
            apiCalls: 'apiCalls',
            storage: 'storageUsed',
            downloads: 'downloads',
            pages: 'apiCalls', // Pages don't have direct usage tracking
        };
        
        const limitMap: Record<typeof limitType, LimitKey> = {
            apiCalls: 'maxApiCalls',
            storage: 'maxStorage',
            downloads: 'maxDownloads',
            pages: 'maxPages',
        };

        const usageKey = usageMap[limitType];
        const limitKey = limitMap[limitType];
        const usage = (account.usage[usageKey] as number) || 0;
        const limit = (account.limits[limitKey] as number) || 0;
        const remaining = Math.max(0, limit - usage);

        return {
            withinLimit: usage < limit,
            remaining,
            limit,
        };
    } catch (error) {
        console.error('Usage limit check error:', error);
        return { withinLimit: false, remaining: 0, limit: 0 };
    }
}

/**
 * Increment usage for an account
 */
export async function incrementUsage(
    accountId: string,
    superAdminId: string,
    limitType: 'apiCalls' | 'storage' | 'downloads',
    amount: number = 1
): Promise<boolean> {
    try {
        await connectDB();
        
        // Get account from main database
        const Account = (await import('../models/Account')).default;
        
        await Account.findByIdAndUpdate(accountId, {
            $inc: { [`usage.${limitType}`]: amount },
            $set: { 'usage.lastActivity': new Date() },
        });

        return true;
    } catch (error) {
        console.error('Usage increment error:', error);
        return false;
    }
}

/**
 * Get plan configuration for a SuperAdmin
 */
export async function getSuperAdminPlanConfig(
    superAdminId: string,
    plan: 'FREE' | 'PRO' | 'MAX'
): Promise<any> {
    try {
        await connectDB();
        
        const planConfig = await PlanConfiguration.findOne({
            superAdminId,
            plan,
            isActive: true,
        });

        return planConfig;
    } catch (error) {
        console.error('Get plan config error:', error);
        return null;
    }
}

/**
 * Middleware wrapper for API routes requiring plan permission
 */
export function withPlanPermission(
    handler: (request: NextRequest, context: NonNullable<Awaited<ReturnType<typeof getPlanContext>>>) => Promise<Response>,
    requiredFeature: string
) {
    return async (request: NextRequest): Promise<Response> => {
        const result = await enforcePlanPermission(request, requiredFeature);
        
        if (!result.authorized) {
            return NextResponse.json(
                { error: result.error || 'Unauthorized' },
                { status: result.error === 'Authentication required' ? 401 : 403 }
            );
        }

        return handler(request, result.context!);
    };
}

/**
 * Get account usage summary
 */
export async function getAccountUsageSummary(
    context: NonNullable<Awaited<ReturnType<typeof getPlanContext>>>
): Promise<{
    apiCalls: { current: number; limit: number };
    storage: { current: number; limit: number };
    downloads: { current: number; limit: number };
    pages: { current: number; limit: number };
}> {
    try {
        await connectDB();
        
        // Get account from main database
        const Account = (await import('../models/Account')).default;
        
        const account = await Account.findById(context.accountId);
        if (!account) {
            throw new Error('Account not found');
        }

        return {
            apiCalls: {
                current: account.usage?.apiCalls || 0,
                limit: account.limits?.maxApiCalls || 0,
            },
            storage: {
                current: account.usage?.storageUsed || 0,
                limit: account.limits?.maxStorage || 0,
            },
            downloads: {
                current: account.usage?.downloads || 0,
                limit: account.limits?.maxDownloads || 0,
            },
            pages: {
                current: 0, // Pages usage is not tracked in the usage object
                limit: account.limits?.maxPages || 0,
            },
        };
    } catch (error) {
        console.error('Get account usage summary error:', error);
        throw error;
    }
}
