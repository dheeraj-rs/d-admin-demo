'use client';

import { ReactNode, useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../../lib/i18n';
import { LayoutProvider, useLayout } from '../../layout/context/LayoutContext';
import { PageCacheProvider } from './PageCacheProvider';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { hasPermission, PUBLIC_PATHS, UserRole } from '../../lib/roles';
import { useAuth } from '../../hooks/useAuth';
import { ThemeProvider } from '../theme/ThemeContext';
import { LayoutConfig } from '../../types/layout';
import { LayoutContextProps } from '../../types';
import { isAuthenticated as checkSuperAdminAuth, getCurrentUser } from '../../lib/permissions';

interface AppProvidersProps {
    children: ReactNode;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

function ThemeWrapper({ children }: { children: ReactNode }) {
    const { layoutConfig, setLayoutConfig } = useLayout();

    return (
        <ThemeProvider 
            layoutConfig={layoutConfig} 
            setLayoutConfig={setLayoutConfig}
        >
            {children}
        </ThemeProvider>
    );
}

export default function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <LayoutProvider>
                    <PageCacheProvider>
                        <ThemeWrapper>
                            <PermissionGate>
                                {children}
                            </PermissionGate>
                        </ThemeWrapper>
                    </PageCacheProvider>
                </LayoutProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
}

function PermissionGate({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname() || '/';
    
    // Skip auth check for owner pages
    const isOwnerPage = pathname?.includes('/owner-');
    const { isAuthenticated: oldAuthAuthenticated, isLoading, user: oldUser, error } = useAuth(isOwnerPage);

    useEffect(() => {
        if (isLoading || isOwnerPage) return;

        // Check both auth systems
        const superAdminAuth = checkSuperAdminAuth();
        const superAdminUser = getCurrentUser();
        const isAuthenticated = superAdminAuth || oldAuthAuthenticated;
        const user = superAdminUser || oldUser;

        const isPublic = PUBLIC_PATHS.includes(pathname);

        // SuperAdmin always has full access - no redirects
        if (superAdminAuth && superAdminUser?.role === 'superadmin') {
            console.log('✅ SuperAdmin access granted:', pathname);
            return;
        }

        // For old auth system
        if (!isAuthenticated && !isPublic) {
            // Don't redirect - let pages handle their own auth
            return;
        }

        if (isAuthenticated && user) {
            const role = user.role as UserRole;
            // SuperAdmin has access to everything
            if (role === 'superadmin') {
                return;
            }
            if (!isPublic && !hasPermission(pathname, role)) {
                // Don't redirect - let pages handle
                return;
            }
        }
    }, [oldAuthAuthenticated, isLoading, oldUser, pathname, router, isOwnerPage]);

    return <>{children}</>;
}


