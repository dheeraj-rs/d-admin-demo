import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '../../../../lib/auth-middleware';
import { connectDB } from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request: NextRequest) {
    try {
        console.log('💳 Payment intent request received');

        const authResult = await authenticate(request);
        console.log('🔍 Auth result:', {
            authenticated: authResult.authenticated,
            user: authResult.user
                ? {
                      userId: authResult.user.userId,
                      email: authResult.user.email,
                      role: authResult.user.role,
                  }
                : null,
            error: authResult.error,
        });

        if (!authResult.authenticated || !authResult.user) {
            console.error('❌ Authentication failed:', authResult.error);
            return NextResponse.json({ success: false, error: 'Unauthorized - Please login to continue' }, { status: 401 });
        }

        console.log('✅ User authenticated:', authResult.user.email, '- Role:', authResult.user.role);

        const body = await request.json();
        const { plan, billingPeriod, provider = 'stripe' } = body;

        console.log('📦 Payment request:', { plan, billingPeriod, provider });

        // Calculate amount based on plan
        const planPrices: Record<string, { monthly: number; yearly: number }> = {
            PRO: { monthly: 29, yearly: 290 }, // yearly = 10 months price
            MAX: { monthly: 99, yearly: 990 },
        };

        if (!plan || plan === 'FREE') {
            return NextResponse.json({ success: false, error: 'Invalid plan selected' }, { status: 400 });
        }

        const prices = planPrices[plan];
        if (!prices) {
            return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 400 });
        }

        const amount = billingPeriod === 'yearly' ? prices.yearly : prices.monthly;
        console.log('💰 Calculated amount:', amount, 'USD');

        // TODO: Integrate with Stripe SDK
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: Math.round(amount * 100),
        //     currency: 'usd',
        //     metadata: {
        //         userId: authResult.user.userId,
        //         email: authResult.user.email,
        //         plan,
        //         billingPeriod,
        //     },
        // });

        // For now, update user's plan directly (mock payment success)
        console.log('📝 Updating user plan in database...');

        try {
            await connectDB();

            // Calculate plan end date
            const planEndDate = new Date();
            if (billingPeriod === 'yearly') {
                planEndDate.setFullYear(planEndDate.getFullYear() + 1);
            } else {
                planEndDate.setMonth(planEndDate.getMonth() + 1);
            }

            // Map plan to tier (User model uses different enum values)
            const planToTierMap: Record<string, 'free' | 'premium' | 'enterprise'> = {
                FREE: 'free',
                PRO: 'premium',
                MAX: 'enterprise',
            };
            const tier = planToTierMap[plan] || 'free';

            console.log('📊 Plan mapping:', { plan, tier, billingPeriod });

            // Update user's plan and tier
            const updatedUser = await User.findByIdAndUpdate(
                authResult.user.userId,
                {
                    $set: {
                        plan: plan, // FREE, PRO, MAX
                        tier: tier, // free, premium, enterprise (matches User model enum)
                        isPlanActive: true,
                        planEndDate: planEndDate,
                        billingPeriod: billingPeriod,
                        lastPaymentDate: new Date(),
                        lastPaymentAmount: amount,
                    }
                },
                { new: true, runValidators: true }
            );

            if (updatedUser) {
                console.log('✅ Plan updated successfully:', {
                    userId: authResult.user.userId,
                    email: authResult.user.email,
                    newPlan: plan,
                    billingPeriod: billingPeriod,
                    planEndDate: planEndDate.toISOString(),
                });

                // Regenerate auth token with updated plan
                try {
                    const { createPlanAuthToken } = await import('../../../../lib/plan-auth');
                    const newAuthPayload = {
                        userId: updatedUser._id.toString(),
                        email: updatedUser.email,
                        name: updatedUser.name,
                        role: 'user' as const,
                        superAdminId: (updatedUser as any).superAdminId || authResult.user.userId,
                        organizationKey: (updatedUser as any).organizationKey || '',
                        plan: plan, // Updated plan (FREE, PRO, MAX)
                        features: (updatedUser as any).features || [],
                        isPlanActive: true,
                        planEndDate: planEndDate.getTime(), // Convert to timestamp
                    };

                    const newToken = await createPlanAuthToken(newAuthPayload);
                    console.log('✅ New auth token generated with updated plan:', { plan, tier });

                    // Update the response to set new token
                    const response = NextResponse.json({
                        success: true,
                        message: 'Payment successful! Your plan has been upgraded.',
                        clientSecret: 'mock_client_secret_' + Date.now(),
                        amount,
                        plan,
                        billingPeriod,
                        planEndDate: planEndDate.toISOString(),
                    });

                    // Set updated cookies
                    response.cookies.set('plan_auth_token', newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 24 * 60 * 60,
                        path: '/',
                    });

                    response.cookies.set('user_token', newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 24 * 60 * 60,
                        path: '/',
                    });

                    console.log('✅ Auth cookies updated with new plan');
                    return response;
                } catch (tokenError) {
                    console.error('⚠️ Failed to regenerate token:', tokenError);
                    // Continue with original response
                }
            }
        } catch (dbError) {
            console.error('⚠️ Failed to update plan in database:', dbError);
            // Continue anyway for mock payment
        }

        console.log('✅ Payment intent created successfully (mock)');

        return NextResponse.json({
            success: true,
            message: 'Payment successful! Your plan has been upgraded.',
            clientSecret: 'mock_client_secret_' + Date.now(),
            amount,
            plan,
            billingPeriod,
            planEndDate: new Date(Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json({ success: false, error: 'Failed to create payment intent' }, { status: 500 });
    }
}
