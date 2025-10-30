'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanAuth } from '../../hooks/usePlanAuth';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface PlanRouteGuardProps {
    children: React.ReactNode;
    requiredFeature?: string;
    fallbackPath?: string;
    showUpgradePrompt?: boolean;
}

/**
 * PlanRouteGuard - Protects routes based on user role and plan
 * 
 * Access Levels:
 * 1. SuperAdmin/Admin: Full access to ALL pages (bypasses plan checks)
 * 2. Regular Users: Access based on plan and features
 */
export default function PlanRouteGuard({
    children,
    requiredFeature,
    fallbackPath = '/select-superadmin',
    showUpgradePrompt = true
}: PlanRouteGuardProps) {
    const { authData, loading: planLoading, canAccessFeature, isPlanActive } = usePlanAuth();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [showUpgrade, setShowUpgrade] = useState(false);

    useEffect(() => {
        // Wait for both auth checks
        if (planLoading || authLoading) return;

        // Check if user is SuperAdmin or Admin (they have full access)
        if (isAuthenticated && user) {
            const isSuperAdmin = user.role === 'superadmin';
            const isAdmin = user.role === 'admin';
            
            if (isSuperAdmin || isAdmin) {
                // SuperAdmin and Admin bypass all plan restrictions
                console.log(`✅ ${user.role} has full access - bypassing plan checks`);
                return; // Allow access
            }
        }

        // Regular user - check plan authentication
        if (!authData) {
            router.push(fallbackPath);
            return;
        }

        // Plan is not active
        if (!isPlanActive()) {
            if (showUpgradePrompt) {
                setShowUpgrade(true);
            } else {
                router.push('/upgrade?reason=PLAN_EXPIRED');
            }
            return;
        }

        // Check feature access
        if (requiredFeature && !canAccessFeature(requiredFeature)) {
            if (showUpgradePrompt) {
                setShowUpgrade(true);
            } else {
                router.push(`/upgrade?feature=${requiredFeature}&reason=FEATURE_NOT_INCLUDED`);
            }
            return;
        }
    }, [authData, planLoading, authLoading, user, isAuthenticated, canAccessFeature, isPlanActive, requiredFeature, router, fallbackPath, showUpgradePrompt]);

    // Show loading while checking authentication
    if (planLoading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // SuperAdmin/Admin have full access - render children immediately
    if (isAuthenticated && user && (user.role === 'superadmin' || user.role === 'admin')) {
        return <>{children}</>;
    }

    if (!authData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Please sign in to access this page.
                    </p>
                    <Button onClick={() => router.push('/select-superadmin')}>
                        Sign In
                    </Button>
                </div>
            </div>
        );
    }

    if (!isPlanActive()) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                            Plan Expired
                        </CardTitle>
                        <CardDescription>
                            Your plan has expired. Please upgrade to continue using the service.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Your {authData.plan} plan is no longer active.
                            </AlertDescription>
                        </Alert>
                        <div className="flex space-x-2">
                            <Button onClick={() => router.push('/upgrade')} className="flex-1">
                                Upgrade Plan
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/')}>
                                Go Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (requiredFeature && !canAccessFeature(requiredFeature)) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Lock className="w-5 h-5 text-yellow-500 mr-2" />
                            Feature Not Available
                        </CardTitle>
                        <CardDescription>
                            This feature is not included in your current plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                The feature &quot;{requiredFeature}&quot; requires a higher plan than your current {authData.plan} plan.
                            </AlertDescription>
                        </Alert>
                        <div className="flex space-x-2">
                            <Button onClick={() => router.push('/upgrade')} className="flex-1">
                                Upgrade Plan
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/')}>
                                Go Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
