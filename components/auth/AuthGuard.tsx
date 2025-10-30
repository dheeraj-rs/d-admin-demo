'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isSuperAdmin, getCurrentUser } from '../../lib/permissions';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    requireSuperAdmin?: boolean;
    fallback?: React.ReactNode;
}

/**
 * AuthGuard - Protects routes and checks authentication
 * Works with both old auth system and new SuperAdmin auth
 */
export default function AuthGuard({ 
    children, 
    requireSuperAdmin = false,
    fallback 
}: AuthGuardProps) {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    const checkAuth = useCallback(() => {
        try {
            const authenticated = isAuthenticated();
            const user = getCurrentUser();

            console.log('🔐 AuthGuard check:', {
                authenticated,
                user: user?.email,
                role: user?.role,
                requireSuperAdmin
            });

            if (!authenticated) {
                console.log('❌ Not authenticated, redirecting...');
                router.push('/superadmin-login');
                setHasAccess(false);
                setIsChecking(false);
                return;
            }

            if (requireSuperAdmin && !isSuperAdmin()) {
                console.log('❌ Not a SuperAdmin, redirecting...');
                router.push('/superadmin-login');
                setHasAccess(false);
                setIsChecking(false);
                return;
            }

            console.log('✅ Access granted');
            setHasAccess(true);
            setIsChecking(false);
        } catch (error) {
            console.error('Auth check error:', error);
            setHasAccess(false);
            setIsChecking(false);
        }
    }, [router, requireSuperAdmin]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isChecking) {
        return (
            fallback || (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                    <Loader2 size={48} style={{ 
                        animation: 'spin 1s linear infinite',
                        color: 'white'
                    }} />
                    <p style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                        Verifying access...
                    </p>
                    <style jsx>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )
        );
    }

    if (!hasAccess) {
        return null;
    }

    return <>{children}</>;
}
