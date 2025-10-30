'use client';

import { useEffect, useState } from 'react';
import { hasOwnerPermissions, hasFullDbAccess, getUserPermissions } from '../../lib/auth';
import { Shield, Lock, Crown } from 'lucide-react';

interface OwnerPermissionGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireFullDbAccess?: boolean;
}

/**
 * Component that only renders children if user has owner permissions
 * 
 * Usage:
 * <OwnerPermissionGuard>
 *   <AdminOnlyFeature />
 * </OwnerPermissionGuard>
 */
export const OwnerPermissionGuard: React.FC<OwnerPermissionGuardProps> = ({
    children,
    fallback,
    requireFullDbAccess = false,
}) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkPermissions = () => {
            if (requireFullDbAccess) {
                setHasPermission(hasFullDbAccess());
            } else {
                setHasPermission(hasOwnerPermissions());
            }
            setIsChecking(false);
        };

        checkPermissions();
    }, [requireFullDbAccess]);

    if (isChecking) {
        return null; // Or a loading spinner
    }

    if (!hasPermission) {
        return fallback ? <>{fallback}</> : null;
    }

    return <>{children}</>;
};

/**
 * Badge component to show owner access status
 * 
 * Usage:
 * <OwnerAccessBadge />
 */
export const OwnerAccessBadge: React.FC = () => {
    const [permissions, setPermissions] = useState<any>(null);

    useEffect(() => {
        setPermissions(getUserPermissions());
    }, []);

    if (!permissions?.ownerAccess) {
        return null;
    }

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            }}
        >
            <Crown size={14} />
            Owner Access
        </div>
    );
};

/**
 * Hook to check owner permissions
 * 
 * Usage:
 * const { hasOwnerAccess, hasDbAccess, permissions } = useOwnerPermissions();
 */
export const useOwnerPermissions = () => {
    const [permissions, setPermissions] = useState<any>(null);
    const [hasOwnerAccess, setHasOwnerAccess] = useState(false);
    const [hasDbAccess, setHasDbAccess] = useState(false);

    useEffect(() => {
        const perms = getUserPermissions();
        setPermissions(perms);
        setHasOwnerAccess(hasOwnerPermissions());
        setHasDbAccess(hasFullDbAccess());
    }, []);

    return {
        hasOwnerAccess,
        hasDbAccess,
        permissions,
        canAccessAllPages: permissions?.accessAllPages === true,
        canAccessAllAccounts: permissions?.accessAllAccounts === true,
    };
};

/**
 * Permission info panel component
 * Shows current user's permissions
 * 
 * Usage:
 * <PermissionInfoPanel />
 */
export const PermissionInfoPanel: React.FC = () => {
    const { hasOwnerAccess, hasDbAccess, permissions } = useOwnerPermissions();

    if (!hasOwnerAccess) {
        return null;
    }

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                border: '2px solid #667eea',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Crown size={20} color="#667eea" />
                <h3 style={{ margin: 0, color: '#667eea', fontSize: '16px', fontWeight: '700' }}>
                    Owner-Level Access Enabled
                </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {hasDbAccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                        <Shield size={14} />
                        <span style={{ fontSize: '14px' }}>Full Database Access</span>
                    </div>
                )}
                {permissions?.accessAllPages && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                        <Shield size={14} />
                        <span style={{ fontSize: '14px' }}>All Pages Access</span>
                    </div>
                )}
                {permissions?.accessAllAccounts && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                        <Shield size={14} />
                        <span style={{ fontSize: '14px' }}>All Accounts Access</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerPermissionGuard;
