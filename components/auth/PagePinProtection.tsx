'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PinLock from './PinLock';
import { LucideIcon } from 'lucide-react';

interface PagePinProtectionProps {
    /**
     * Current page path (e.g., '/emails', '/admin-keys')
     */
    pagePath: string;
    
    /**
     * Icon to display in PIN lock screen
     */
    icon?: LucideIcon;
    
    /**
     * Title for PIN lock screen
     */
    title?: string;
    
    /**
     * Children to render when authenticated
     */
    children: React.ReactNode;
    
    /**
     * Loading component
     */
    loadingComponent?: React.ReactNode;
}

const PagePinProtection: React.FC<PagePinProtectionProps> = ({
    pagePath,
    icon,
    title,
    children,
    loadingComponent
}) => {
    const [isChecking, setIsChecking] = useState(true);
    const [requiresPin, setRequiresPin] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [pageName, setPageName] = useState('');

    const checkPageProtection = useCallback(async () => {
        try {
            setIsChecking(true);
            const response = await fetch('/api/pin-settings/check-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pagePath })
            });

            const data = await response.json();

            if (data.success) {
                setRequiresPin(data.requiresPin);
                setIsVerified(data.isVerified);
                setPageName(data.pageName || '');
            }
        } catch (error) {
            console.error('Error checking page protection:', error);
            // On error, allow access (fail open for better UX)
            setRequiresPin(false);
            setIsVerified(true);
        } finally {
            setIsChecking(false);
        }
    }, [pagePath]);

    useEffect(() => {
        checkPageProtection();
    }, [checkPageProtection]);

    const handlePinSuccess = () => {
        setIsVerified(true);
    };

    // Show loading state
    if (isChecking) {
        if (loadingComponent) {
            return <>{loadingComponent}</>;
        }
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--surface-border)',
                    borderTopColor: 'var(--primary-color)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }}></div>
                <p style={{ color: 'var(--text-color-secondary)', fontSize: '0.875rem' }}>
                    Checking access...
                </p>
            </div>
        );
    }

    // Show PIN lock if required and not verified
    if (requiresPin && !isVerified) {
        return (
            <PinLock
                getPinEndpoint="/api/pin-settings"
                verifyPinEndpoint="/api/pin-settings/verify-page"
                verifyPayload={{ pagePath }}
                onSuccess={handlePinSuccess}
                icon={icon}
                title={title || `Enter PIN for ${pageName}`}
                pinLength={4}
                showToasts={true}
                successMessage="Access Granted!"
                errorMessage="Incorrect PIN"
            />
        );
    }

    // Show protected content
    return <>{children}</>;
};

export default PagePinProtection;
