'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2, Mail, CheckCircle, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import '../../../styles/admin-styles/admin-login.scss';

function SuperAdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [inviteEmail, setInviteEmail] = useState<string>('');
    const [hasInvite, setHasInvite] = useState(false);

    const handleGoogleCallback = useCallback(async (response: any) => {
        try {
            setLoading(true);
            const token = response.credential;

            if (mode === 'register') {
                // Redirect to full registration page with pre-filled email
                router.push(`/register-superadmin?token=${token}&email=${encodeURIComponent(inviteEmail)}`);
            } else {
                // Handle login
                await handleLogin(token);
            }
        } catch (error: any) {
            console.error('Google callback error:', error);
            toast.error('Authentication failed');
            setLoading(false);
        }
    }, [mode, inviteEmail, router]);

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
                    text: mode === 'register' ? 'continue_with' : 'signin_with',
                }
            );
        } catch (error) {
            console.error('Error initializing Google Sign-In:', error);
        }
    }, [mode, handleGoogleCallback]);

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
        // Check if there's an invite parameter
        const invite = searchParams.get('invite');
        if (invite) {
            setInviteEmail(decodeURIComponent(invite));
            setHasInvite(true);
            setMode('register');
        }
        loadGoogleScript();
    }, [searchParams, loadGoogleScript]);

    // Reinitialize Google button when mode changes
    useEffect(() => {
        if (window.google) {
            setTimeout(() => {
                initializeGoogleSignIn();
            }, 100);
        }
    }, [mode, initializeGoogleSignIn]);


    const handleLogin = async (token: string) => {
        try {
            const response = await fetch('/api/auth/superadmin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (data.success) {
                // Check if there's a return URL stored
                const returnUrl = sessionStorage.getItem('returnUrl');

                if (data.needsPinSetup) {
                    toast.success('Login successful! Please set up your PIN');
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 500);
                } else if (data.approvalStatus === 'pending') {
                    toast.error('Your account is pending approval');
                } else if (data.approvalStatus === 'rejected') {
                    toast.error('Your account was rejected. Contact support.');
                } else {
                    toast.success('Login successful!');

                    // Use window.location for full page reload to ensure UI reflects auth state
                    setTimeout(() => {
                        const targetUrl = returnUrl || '/';
                        if (returnUrl) {
                            sessionStorage.removeItem('returnUrl');
                        }
                        window.location.href = targetUrl;
                    }, 500);
                }
            } else {
                if (data.error === 'SuperAdmin not found') {
                    toast.error('No account found. Please register first or contact the owner for an invite.');
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
                        <Shield size={48} className="logo-icon" />
                    </div>
                    <h1>{mode === 'register' ? 'SuperAdmin Registration' : 'SuperAdmin Login'}</h1>
                    <p className="subtitle">
                        {mode === 'register'
                            ? 'Complete your registration to get started'
                            : 'Sign in with your Google account to access your dashboard'
                        }
                    </p>
                </div>

                {hasInvite && mode === 'register' && (
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
                    }}>
                        <CheckCircle size={24} style={{ marginBottom: '0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>✅ You&apos;ve been invited!</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                            <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {inviteEmail}
                        </p>
                    </div>
                )}

                <div className="login-card">
                    <div className="card-content">
                        {mode === 'register' ? (
                            <div className="login-section">
                                <h2>Complete Your Registration</h2>
                                <p className="login-description">
                                    Click below to sign in with Google and continue registration
                                </p>

                                <div className="google-signin-wrapper">
                                    <div id="google-signin-button"></div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => setMode('login')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#667eea',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                fontWeight: 600,
                                                fontSize: '14px'
                                            }}
                                        >
                                            Sign in here
                                        </button>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="login-section">
                                <h2>Sign In</h2>
                                <p className="login-description">
                                    Use your registered Google account to sign in
                                </p>

                                <div className="google-signin-wrapper">
                                    <div id="google-signin-button"></div>
                                </div>

                                <div style={{
                                    background: '#eff6ff',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginTop: '1.5rem',
                                    border: '1px solid #3b82f6'
                                }}>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', lineHeight: '1.5' }}>
                                        <strong>🔐 Security Note:</strong> Use the same Google account you registered with.
                                        Your account must be approved by the owner before you can access the dashboard.
                                    </p>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Need an invitation?{' '}
                                        <span style={{ color: '#667eea', fontWeight: 600 }}>
                                            Contact the platform owner
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <Loader2 className="spinner" size={24} />
                                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                                    Processing...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="login-footer">
                    <p>© 2025 D-Admin. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default function SuperAdminLoginPage() {
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
            <SuperAdminLoginContent />
        </Suspense>
    );
}
