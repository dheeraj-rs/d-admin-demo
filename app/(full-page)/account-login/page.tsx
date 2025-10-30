'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Loader2, Mail, Building2, ChevronDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import '../../../styles/admin-styles/admin-login.scss';

interface SuperAdmin {
    _id: string;
    email: string;
    organizationName: string;
    name: string;
    profilePicture?: string;
}

function AccountLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [superAdminId, setSuperAdminId] = useState<string>('');
    const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
    const [needsSuperAdminSelection, setNeedsSuperAdminSelection] = useState(false);

    const handleLogin = useCallback(async (token: string) => {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    superAdminId: superAdminId || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Account login successful:', data.account);

                // Set localStorage immediately for client-side detection
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('user', JSON.stringify({
                    id: data.account.id,
                    email: data.account.email,
                    name: data.account.name,
                    role: 'account',
                    plan: data.account.plan,
                    profilePicture: data.account.profilePicture,
                }));

                // Check if there's a return URL stored
                const returnUrl = sessionStorage.getItem('returnUrl');

                // Clear any organization selection flag
                setNeedsSuperAdminSelection(false);

                if (data.isNewAccount) {
                    toast.success('Welcome! Account created successfully');
                } else {
                    toast.success('Login successful!');
                }

                console.log('🔄 Redirecting to:', returnUrl || '/dashboard');

                // Use window.location for full page reload to ensure UI reflects auth state
                setTimeout(() => {
                    const targetUrl = returnUrl || '/dashboard';
                    if (returnUrl) {
                        sessionStorage.removeItem('returnUrl');
                    }
                    window.location.href = targetUrl;
                }, 800);
            } else {
                if (data.needsSuperAdminSelection) {
                    // New user needs to select organization
                    setNeedsSuperAdminSelection(true);
                    toast('Please select an organization to register', { icon: 'ℹ️' });
                } else {
                    toast.error(data.error || 'Login failed');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('An error occurred during login');
        } finally {
            setLoading(false);
        }
    }, [superAdminId]);

    const handleGoogleCallback = useCallback(async (response: any) => {
        try {
            setLoading(true);
            const token = response.credential;

            // Try login without organization first (for existing users)
            await handleLogin(token);
        } catch (error: any) {
            console.error('Google callback error:', error);
            toast.error('Authentication failed');
            setLoading(false);
        }
    }, [handleLogin]);

    const initializeGoogleSignIn = useCallback(() => {
        if (!window.google || !window.google.accounts) return;

        try {
            const buttonElement = document.getElementById('google-signin-button');
            if (!buttonElement) {
                console.error('Google sign-in button element not found');
                return;
            }

            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                callback: handleGoogleCallback,
            });

            window.google.accounts.id.renderButton(
                buttonElement,
                {
                    theme: 'outline',
                    size: 'large',
                    width: 350,
                    text: 'signin_with',
                }
            );
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
        }
    }, [handleGoogleCallback]);

    const loadGoogleScript = useCallback(() => {
        if (typeof window === 'undefined') return;

        if (window.google) {
            initializeGoogleSignIn();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initializeGoogleSignIn();
        };
        document.body.appendChild(script);
    }, [initializeGoogleSignIn]);

    useEffect(() => {
        // Fetch available organizations
        fetchSuperAdmins();

        // Check if SuperAdmin ID is provided in URL
        const superAdminFromUrl = searchParams.get('superAdminId');
        if (superAdminFromUrl) {
            setSuperAdminId(superAdminFromUrl);
            // Also store in localStorage for persistence
            localStorage.setItem('selectedSuperAdminId', superAdminFromUrl);
        } else {
            // Check localStorage as fallback
            const storedSuperAdminId = localStorage.getItem('selectedSuperAdminId');
            if (storedSuperAdminId) {
                setSuperAdminId(storedSuperAdminId);
            }
        }
        loadGoogleScript();
    }, [searchParams, loadGoogleScript]);

    const fetchSuperAdmins = async () => {
        try {
            const response = await fetch('/api/auth/superadmins');
            const data = await response.json();

            if (data.success) {
                setSuperAdmins(data.superAdmins || []);
            } else {
                toast.error('Failed to load organizations');
            }
        } catch (error) {
            console.error('Error fetching SuperAdmins:', error);
            toast.error('Failed to load organizations');
        } finally {
            setLoadingOrgs(false);
        }
    };

    const handleOrganizationChange = (orgId: string) => {
        setSuperAdminId(orgId);
        localStorage.setItem('selectedSuperAdminId', orgId);
        toast.success('Organization selected');
    };





    return (
        <div className="admin-login-page">
            <Toaster position="top-center" />

            <div className="bg-effects">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-container">
                <div className="login-header">
                    <div className="logo-container">
                        <User size={48} className="logo-icon" />
                    </div>
                    <h1>Account Login</h1>
                    <p className="subtitle">
                        Sign in with your Google account to access your dashboard
                    </p>
                </div>

                <div className="login-card">
                    <div className="card-content">
                        {/* Organization Selector Dropdown - Only for new users */}
                        {needsSuperAdminSelection && (
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: 'rgba(251, 146, 60, 0.1)',
                                    border: '1px solid #fb923c',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#fb923c', fontWeight: 600 }}>
                                        New user detected! Please select your organization to register.
                                    </p>
                                </div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    color: 'var(--text-color)'
                                }}>
                                    <Building2 size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                    Select Organization
                                </label>
                                {loadingOrgs ? (
                                    <div style={{
                                        padding: '12px',
                                        border: '1px solid var(--surface-border)',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        backgroundColor: 'var(--surface-section)'
                                    }}>
                                        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite', display: 'inline' }} />
                                        <span style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--text-color-secondary)' }}>Loading organizations...</span>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={superAdminId}
                                            onChange={(e) => handleOrganizationChange(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px 40px 12px 16px',
                                                fontSize: '14px',
                                                border: `2px solid ${superAdminId ? '#10b981' : 'var(--surface-border)'}`,
                                                borderRadius: '8px',
                                                backgroundColor: 'var(--surface-section)',
                                                color: 'var(--text-color)',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <option value="">-- Choose an organization --</option>
                                            {superAdmins.map((admin) => (
                                                <option key={admin._id} value={admin._id}>
                                                    {admin.organizationName} ({admin.email})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={20}
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                pointerEvents: 'none',
                                                color: 'var(--text-color-secondary)'
                                            }}
                                        />
                                    </div>
                                )}
                                {superAdminId && (
                                    <p style={{
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        color: '#10b981',
                                        fontWeight: 600
                                    }}>
                                        ✓ Organization selected - Ready to register
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="login-section">
                            <h2>Sign In with Google</h2>
                            <p className="login-description">
                                {needsSuperAdminSelection
                                    ? 'After selecting an organization, sign in with Google to register'
                                    : 'Use your Google account to access your dashboard'
                                }
                            </p>

                            <div className="google-signin-wrapper">
                                <div id="google-signin-button"></div>
                            </div>

                            {loading && (
                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <Loader2 size={24} className="spinner" />
                                    <p style={{ marginTop: '0.5rem', fontSize: '14px', color: '#6b7280' }}>
                                        {needsSuperAdminSelection ? 'Redirecting...' : 'Authenticating...'}
                                    </p>
                                </div>
                            )}

                            {!needsSuperAdminSelection && (
                                <div style={{
                                    textAlign: 'center',
                                    marginTop: '1.5rem',
                                    paddingTop: '1.5rem',
                                    borderTop: '1px solid #e5e7eb'
                                }}>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        New to D-Admin? Sign in with Google and we&apos;ll guide you through organization selection.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="login-footer">
                    <p>© 2025 D-Admin. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default function AccountLoginPage() {
    return (
        <Suspense fallback={
            <div className="admin-login-page">
                <div className="login-container">
                    <div className="login-card">
                        <div className="card-content" style={{ textAlign: 'center', padding: '3rem' }}>
                            <Loader2 className="spinner" size={48} style={{ margin: '0 auto 1rem' }} />
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <AccountLoginContent />
        </Suspense>
    );
}
