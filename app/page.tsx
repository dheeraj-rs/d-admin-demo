'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanAuth } from '../hooks/usePlanAuth';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import UpgradePage from './(main)/upgrade/page';

export default function HomePage() {
    const { authData: planAuthData, loading: planLoading } = usePlanAuth();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for both auth checks to complete
        if (planLoading || authLoading) return;

        // Check if user is SuperAdmin or Admin (has full dashboard access)
        if (isAuthenticated && user) {
            const isSuperAdmin = user.role === 'superadmin';
            const isAdmin = user.role === 'admin';
            const isOwner = user.role === 'owner';

            if (isSuperAdmin || isAdmin || isOwner) {
                // SuperAdmin, Admin, and Owner have full access to dashboard
                console.log(`✅ ${user.role} authenticated, redirecting to dashboard`);
                router.push('/dashboard');
                return;
            }
        }

        // Check if user is a regular account user with plan
        if (planAuthData) {
            // Regular account user is authenticated, redirect to dashboard
            console.log('✅ Account user authenticated, redirecting to dashboard');
            router.push('/dashboard');
            return;
        }

        // If not authenticated, redirect to upgrade page
        console.log('No authentication found, redirecting to upgrade page');
        router.push('/upgrade');
    }, [planAuthData, planLoading, user, authLoading, isAuthenticated, router]);

    // Show loading state while checking authentication
    if (planLoading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-300">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Show a loading state while redirect happens (prevent flash of content)
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-300">Loading...</p>
            </div>
        </div>
    );
}
