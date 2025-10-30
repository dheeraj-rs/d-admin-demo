'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdminAuth } from '../../hooks/useSuperAdminAuth';
import { Loader2 } from 'lucide-react';

interface SuperAdminProtectedProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function SuperAdminProtected({ children, fallback }: SuperAdminProtectedProps) {
    const router = useRouter();
    const { isAuthenticated, isSuperAdmin, isLoading } = useSuperAdminAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log('❌ Not authenticated, redirecting to login...');
            router.push('/superadmin-login');
        } else if (!isLoading && !isSuperAdmin) {
            console.log('❌ Not a SuperAdmin, access denied');
            router.push('/superadmin-login');
        }
    }, [isAuthenticated, isSuperAdmin, isLoading, router]);

    if (isLoading) {
        return (
            fallback || (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: '20px'
                }}>
                    <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: '#666', fontSize: '16px' }}>Verifying permissions...</p>
                    <style jsx>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )
        );
    }

    if (!isAuthenticated || !isSuperAdmin) {
        return null;
    }

    return <>{children}</>;
}
