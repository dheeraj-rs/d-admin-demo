'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import PlanSelector from '../../../components/plans/PlanSelector';
import { usePlanAuth } from '../../../hooks/usePlanAuth';
import { isAuthenticated, getCurrentUser, isSuperAdmin, isOwner } from '../../../lib/permissions';
import '../../../styles/pages/upgrade/index.scss';

export default function UpgradePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { authData, loading: authLoading } = usePlanAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null);
    const [upgradedBillingPeriod, setUpgradedBillingPeriod] = useState<string | null>(null);

    const feature = searchParams.get('feature');
    const reason = searchParams.get('reason');
    const currentPlan = searchParams.get('currentPlan') as 'FREE' | 'PRO' | 'MAX' || authData?.plan;

    // Check if user is logged in (SuperAdmin, Owner, or Account user)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check multiple auth sources
            const authenticated = isAuthenticated();
            const user = getCurrentUser();

            // Check cookies directly for all user types
            const hasAuthToken = document.cookie.includes('auth_token=');      // SuperAdmin
            const hasOwnerToken = document.cookie.includes('owner_token=');    // Owner
            const hasPlanToken = document.cookie.includes('plan_auth_token='); // Account (plan)
            const hasUserToken = document.cookie.includes('user_token=');      // Account (user)

            // User is authenticated if ANY of these are true
            const isLoggedIn = authenticated || !!authData || hasAuthToken || hasOwnerToken || hasPlanToken || hasUserToken;

            setIsUserAuthenticated(isLoggedIn);
            setCurrentUser(user);

            console.log('🔍 Upgrade page auth check:', {
                authenticated,
                user,
                authData,
                hasAuthToken,
                hasOwnerToken,
                hasPlanToken,
                hasUserToken,
                isLoggedIn,
                isSuperAdmin: isSuperAdmin(),
                isOwner: isOwner(),
            });
        }
    }, [authData]);

    const handleSelectPlan = async (plan: 'FREE' | 'PRO' | 'MAX', billingPeriod: 'monthly' | 'yearly') => {
        // Check if ANY user is authenticated (SuperAdmin, Owner, or Account user)
        if (!isUserAuthenticated) {
            console.log('❌ No user authenticated - redirecting to login');

            // Save current URL to redirect back after login
            const returnUrl = `/upgrade?plan=${plan}&billingPeriod=${billingPeriod}${feature ? `&feature=${feature}` : ''}${reason ? `&reason=${reason}` : ''}`;
            sessionStorage.setItem('returnUrl', returnUrl);

            // Redirect to account login page (for normal users)
            router.push('/account-login');
            return;
        }

        console.log('✅ User authenticated:', currentUser?.role || 'account', '- proceeding with plan selection');

        if (plan === 'FREE') {
            router.push('/');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/payment/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan,
                    billingPeriod,
                    provider: 'stripe',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle 401 Unauthorized specifically
                if (response.status === 401) {
                    // Double-check if user is really not authenticated
                    if (!isUserAuthenticated) {
                        setError('Please login to continue with payment.');
                        setTimeout(() => {
                            const returnUrl = `/upgrade?plan=${plan}&billingPeriod=${billingPeriod}${feature ? `&feature=${feature}` : ''}${reason ? `&reason=${reason}` : ''}`;
                            sessionStorage.setItem('returnUrl', returnUrl);
                            router.push('/account-login');
                        }, 2000);
                        return;
                    } else {
                        // User is authenticated but API returned 401 - might be session issue
                        setError('Session expired. Please try again or re-login.');
                        return;
                    }
                }
                throw new Error(data.error || 'Failed to create payment intent');
            }

            if (data.clientSecret) {
                console.log('✅ Payment successful:', data);

                // Map plan to tier for display (matches User model enum)
                const planToTierMap: Record<string, string> = {
                    FREE: 'free',
                    PRO: 'premium',
                    MAX: 'enterprise',
                };
                const dbTier = planToTierMap[plan] || 'free';

                // Display tier mapping (for UI)
                const tierToDisplayMap: Record<string, string> = {
                    free: 'free',
                    premium: 'pro',
                    enterprise: 'max',
                };
                const displayTier = tierToDisplayMap[dbTier] || dbTier;

                // Update localStorage with new plan
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const userData = JSON.parse(storedUser);
                        userData.plan = plan;
                        userData.tier = displayTier; // Use display tier (free, pro, max)
                        localStorage.setItem('user', JSON.stringify(userData));
                        console.log('✅ User plan updated in localStorage:', { plan, tier: displayTier });
                    } catch (e) {
                        console.error('Failed to update localStorage:', e);
                    }
                }

                // Set upgraded plan details for success message
                setUpgradedPlan(plan);
                setUpgradedBillingPeriod(billingPeriod);
                setSuccess(true);
                setError(null);

                // Redirect to settings page after showing success
                setTimeout(() => {
                    console.log('🔄 Redirecting to settings page...');
                    window.location.href = '/settings'; // Full reload to refresh UI
                }, 4000); // Increased to 4 seconds to show full success message
            }
        } catch (error) {
            console.error('Payment error:', error);
            setError(error instanceof Error ? error.message : 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    const getUpgradeReason = () => {
        switch (reason) {
            case 'FEATURE_NOT_INCLUDED':
                return 'This feature is not included in your current plan.';
            case 'PLAN_EXPIRED':
                return 'Your plan has expired. Please upgrade to continue.';
            case 'API_LIMIT_REACHED':
                return 'You have reached your API call limit.';
            case 'STORAGE_LIMIT_EXCEEDED':
                return 'You have exceeded your storage limit.';
            case 'DOWNLOAD_LIMIT_REACHED':
                return 'You have reached your download limit.';
            default:
                return 'You need to upgrade your plan to access this feature.';
        }
    };

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="children__wrapper">
                <div className="upgrade-page-wrapper">
                    <div className="upgrade-container">
                        <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
                            <Loader2 className="spinner" style={{ width: '3rem', height: '3rem', animation: 'spin 0.8s linear infinite' }} />
                            <p style={{ color: 'var(--text-color-secondary)', fontSize: '0.9375rem' }}>Checking authentication...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="children__wrapper">
            <div className="upgrade-page-wrapper">
                <div className="upgrade-container">
                    <div className="upgrade-header">
                        <h1>Upgrade Your Plan</h1>
                        <p className="upgrade-description">{getUpgradeReason()}</p>

                        {feature && (
                            <div className="feature-alert">
                                <AlertTriangle />
                                <div className="alert-content">
                                    Feature: <code>{feature}</code>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="error-alert">
                            <AlertTriangle />
                            <div className="alert-content">{error}</div>
                        </div>
                    )}

                    {success && upgradedPlan && (
                        <div className="success-alert" style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <CheckCircle size={32} style={{ flexShrink: 0, marginTop: '0.25rem' }} />
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700 }}>
                                        🎉 Payment Successful!
                                    </h3>
                                    <p style={{ margin: '0 0 1rem 0', fontSize: '1rem', opacity: 0.95 }}>
                                        Your plan has been upgraded successfully.
                                    </p>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.6'
                                    }}>
                                        <p style={{ margin: '0 0 0.5rem 0' }}>
                                            <strong>New Plan:</strong> {upgradedPlan} PLAN
                                        </p>
                                        <p style={{ margin: '0 0 0.5rem 0' }}>
                                            <strong>Billing:</strong> {upgradedBillingPeriod === 'yearly' ? 'Yearly (Save 17%)' : 'Monthly'}
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            <strong>Status:</strong> Active ✓
                                        </p>
                                    </div>
                                    <p style={{ margin: '1rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                                        Redirecting to settings page to view your updated plan...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <PlanSelector
                        currentPlan={currentPlan}
                        onSelectPlan={handleSelectPlan}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
