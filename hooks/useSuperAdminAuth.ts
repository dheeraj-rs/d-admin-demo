import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getCurrentUser, 
    isAuthenticated, 
    isSuperAdmin, 
    hasPermission,
    getUserRole,
    getOrganizationKey,
    clearSession,
    type User 
} from '../lib/permissions';

interface SuperAdminAuthState {
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    user: User | null;
    organizationKey: string | null;
    isLoading: boolean;
}

export function useSuperAdminAuth() {
    const router = useRouter();
    const [authState, setAuthState] = useState<SuperAdminAuthState>({
        isAuthenticated: false,
        isSuperAdmin: false,
        user: null,
        organizationKey: null,
        isLoading: true,
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        try {
            const authenticated = isAuthenticated();
            const superAdmin = isSuperAdmin();
            const user = getCurrentUser();
            const orgKey = getOrganizationKey();

            setAuthState({
                isAuthenticated: authenticated,
                isSuperAdmin: superAdmin,
                user,
                organizationKey: orgKey,
                isLoading: false,
            });

            console.log('🔐 Auth State:', {
                authenticated,
                isSuperAdmin: superAdmin,
                role: user?.role,
                organizationKey: orgKey,
            });
        } catch (error) {
            console.error('Error checking auth:', error);
            setAuthState({
                isAuthenticated: false,
                isSuperAdmin: false,
                user: null,
                organizationKey: null,
                isLoading: false,
            });
        }
    };

    const logout = () => {
        clearSession();
        setAuthState({
            isAuthenticated: false,
            isSuperAdmin: false,
            user: null,
            organizationKey: null,
            isLoading: false,
        });
        router.push('/superadmin-login');
    };

    const checkPermission = (feature: string): boolean => {
        return hasPermission(feature);
    };

    const requireSuperAdmin = () => {
        if (!authState.isSuperAdmin && !authState.isLoading) {
            router.push('/superadmin-login');
            return false;
        }
        return true;
    };

    return {
        ...authState,
        checkAuth,
        logout,
        checkPermission,
        requireSuperAdmin,
        hasFullAccess: authState.isSuperAdmin,
    };
}
