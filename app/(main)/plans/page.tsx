'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Zap } from 'lucide-react';

export default function PlansPage() {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: 'Free',
            price: { monthly: 0, yearly: 0 },
            description: 'Perfect for trying out D-Admin',
            features: [
                'Limited dashboard access',
                'Basic AI tools',
                '1 website project',
                'Community support',
                'Basic analytics'
            ],
            cta: 'Current Plan',
            highlighted: false,
            disabled: true
        },
        {
            name: 'Pro',
            price: { monthly: 29, yearly: 290 },
            description: 'For professionals and small teams',
            features: [
                'Full dashboard access',
                'Advanced AI tools',
                '10 website projects',
                'Priority support',
                'Advanced analytics',
                'Custom domains',
                'Team collaboration'
            ],
            cta: 'Upgrade to Pro',
            highlighted: true,
            disabled: false
        },
        {
            name: 'Enterprise',
            price: { monthly: 99, yearly: 990 },
            description: 'For large teams and organizations',
            features: [
                'Everything in Pro',
                'Unlimited projects',
                'Dedicated support',
                'Custom integrations',
                'Advanced security',
                'SLA guarantee',
                'White-label options',
                'API access'
            ],
            cta: 'Contact Sales',
            highlighted: false,
            disabled: false
        }
    ];

    const handleSelectPlan = (planName: string) => {
        if (planName === 'Free') return;

        if (planName === 'Enterprise') {
            // Redirect to contact page
            router.push('/contact?plan=enterprise');
        } else {
            // Redirect to checkout
            router.push(`/checkout?plan=${planName.toLowerCase()}&billing=${billingCycle}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Unlock powerful features and take your projects to the next level
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-md transition-colors ${billingCycle === 'monthly'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-md transition-colors ${billingCycle === 'yearly'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                                Save 17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl p-8 ${plan.highlighted
                                ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl scale-105'
                                : 'bg-gray-800/50 backdrop-blur border border-gray-700'
                                }`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <Crown size={16} />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-400'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-white">
                                        ${plan.price[billingCycle]}
                                    </span>
                                    <span className={`text-lg ${plan.highlighted ? 'text-white/70' : 'text-gray-400'}`}>
                                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                                    <p className={`text-sm mt-1 ${plan.highlighted ? 'text-white/60' : 'text-gray-500'}`}>
                                        ${(plan.price.yearly / 12).toFixed(0)}/month when billed annually
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan.name)}
                                disabled={plan.disabled}
                                className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${plan.disabled
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : plan.highlighted
                                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {plan.cta}
                            </button>

                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check
                                            size={20}
                                            className={`flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-blue-500'
                                                }`}
                                        />
                                        <span className={plan.highlighted ? 'text-white' : 'text-gray-300'}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-400 mb-4">
                        All plans include a 14-day money-back guarantee
                    </p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        Already have an account? Login
                    </button>
                </div>
            </div>
        </div>
    );
}
