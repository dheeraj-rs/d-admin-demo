'use client';

import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import '../../styles/components/plan-selector.scss';

interface Plan {
    id: 'FREE' | 'PRO' | 'MAX';
    name: string;
    price: {
        monthly: number;
        yearly: number;
    };
    description: string;
    features: string[];
    limits: {
        storage: string;
        apiCalls: string;
        downloads: string;
        pages: string;
        websites: string;
    };
    popular?: boolean;
}

interface PlanSelectorProps {
    currentPlan?: 'FREE' | 'PRO' | 'MAX';
    onSelectPlan: (plan: 'FREE' | 'PRO' | 'MAX', billingPeriod: 'monthly' | 'yearly') => void;
    loading?: boolean;
}

const plans: Plan[] = [
    {
        id: 'FREE',
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        description: 'Perfect for getting started',
        features: [
            'Basic dashboard',
            'Profile management',
            'Basic elements',
            'AI websites (limited)',
            'Knowledge base access',
            '100MB storage',
            '100 API calls/month',
            '10 downloads/month',
            '5 pages',
            '1 website'
        ],
        limits: {
            storage: '100MB',
            apiCalls: '100/month',
            downloads: '10/month',
            pages: '5',
            websites: '1'
        }
    },
    {
        id: 'PRO',
        name: 'Pro',
        price: { monthly: 29, yearly: 290 },
        description: 'For growing businesses',
        features: [
            'Everything in Free',
            'Add custom elements',
            'Website builder',
            'Advanced analytics',
            'API access',
            '1GB storage',
            '1,000 API calls/month',
            '100 downloads/month',
            '50 pages',
            '5 websites',
            'Priority support'
        ],
        limits: {
            storage: '1GB',
            apiCalls: '1,000/month',
            downloads: '100/month',
            pages: '50',
            websites: '5'
        },
        popular: true
    },
    {
        id: 'MAX',
        name: 'Max',
        price: { monthly: 99, yearly: 990 },
        description: 'For enterprise needs',
        features: [
            'Everything in Pro',
            'Custom branding',
            'Webhooks',
            'Unlimited storage',
            '10,000 API calls/month',
            '1,000 downloads/month',
            '500 pages',
            '50 websites',
            'Custom integrations',
            '24/7 priority support',
            'Dedicated account manager'
        ],
        limits: {
            storage: 'Unlimited',
            apiCalls: '10,000/month',
            downloads: '1,000/month',
            pages: '500',
            websites: '50'
        }
    }
];

export default function PlanSelector({ currentPlan, onSelectPlan, loading }: PlanSelectorProps) {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const formatPrice = (price: number) => {
        if (price === 0) return 'Free';
        return `$${price}`;
    };

    const getYearlyDiscount = (monthlyPrice: number, yearlyPrice: number) => {
        if (monthlyPrice === 0) return 0;
        const monthlyTotal = monthlyPrice * 12;
        const savings = monthlyTotal - yearlyPrice;
        return Math.round((savings / monthlyTotal) * 100);
    };

    return (
        <div className="plan-selector-wrapper">
            {/* Billing Toggle */}
            <div className="billing-toggle-section">
                <span className={`billing-label ${billingPeriod === 'monthly' ? 'active' : ''}`}>
                    Monthly
                </span>
                <button
                    onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                    className={`billing-switch ${billingPeriod === 'yearly' ? 'yearly' : ''}`}
                >
                    <span className={`switch-handle ${billingPeriod === 'yearly' ? 'yearly' : ''}`} />
                </button>
                <span className={`billing-label ${billingPeriod === 'yearly' ? 'active' : ''}`}>
                    Yearly
                </span>
                {billingPeriod === 'yearly' && (
                    <span className="savings-badge">
                        Save up to 17%
                    </span>
                )}
            </div>

            {/* Plans Grid */}
            <div className="plans-grid">
                {plans.map((plan) => {
                    const isCurrentPlan = currentPlan === plan.id;
                    const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly;
                    const discount = getYearlyDiscount(plan.price.monthly, plan.price.yearly);

                    return (
                        <div
                            key={plan.id}
                            className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                        >
                            {plan.popular && (
                                <div className="popular-badge">
                                    <Star />
                                    Most Popular
                                </div>
                            )}

                            {isCurrentPlan && (
                                <div className="current-badge">
                                    Current Plan
                                </div>
                            )}

                            <div className="card-header">
                                <h3 className="plan-title">{plan.name}</h3>
                                <p className="plan-desc">{plan.description}</p>
                                <div className="price-display">
                                    <span className="price">{formatPrice(price)}</span>
                                    {price > 0 && (
                                        <span className="period">
                                            /{billingPeriod === 'monthly' ? 'month' : 'year'}
                                        </span>
                                    )}
                                </div>
                                {billingPeriod === 'yearly' && discount > 0 && (
                                    <div className="yearly-discount">
                                        Save {discount}% with yearly billing
                                    </div>
                                )}
                            </div>

                            <div className="card-content">
                                <ul className="features-list">
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>
                                            <Check />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => onSelectPlan(plan.id, billingPeriod)}
                                disabled={loading || isCurrentPlan}
                                className={`card-action ${plan.popular && !isCurrentPlan ? 'popular-button' :
                                    plan.id === 'FREE' ? 'secondary-button' : ''
                                    }`}
                            >
                                {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
                            </button>
                        </div>
                    );
                })}            </div>
        </div>
    );
}
