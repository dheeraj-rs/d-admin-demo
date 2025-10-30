'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/pages/auth/admin-login.scss';

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const handleGoogleCallback = useCallback(async (response: any) => {
        setLoading(true);

        try {
            // Decode JWT token from Google
            const credential = response.credential;
            const payload = JSON.parse(atob(credential.split('.')[1]));

            const { sub: googleId, email, name, picture: profilePicture } = payload;

            console.log('🔐 Google login attempt:', email);

            // Get selected SuperAdmin ID from localStorage (if user previously selected one)
            const selectedSuperAdminId = localStorage.getItem('selectedSuperAdminId');

            // Send to backend for validation
            const apiResponse = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleId,
                    email,
                    name,
                    profilePicture,
                    superAdminId: selectedSuperAdminId || undefined,
                }),
            });

            const data = await apiResponse.json();

            console.log('📊 API Response:', data);

            if (data.needsSuperAdminSelection) {
                // New user needs to select an organization
                toast.success('Please select an organization to continue...');
                setTimeout(() => {
                    router.push('/select-superadmin');
                }, 1000);
                return;
            }

            if (data.success) {
                // Clear the selected SuperAdmin ID after successful login
                localStorage.removeItem('selectedSuperAdminId');
                
                // Check if profile setup is needed
                if (data.needsProfileSetup) {
                    toast.success('Login successful! Please complete your profile...');
                    setTimeout(() => {
                        router.push('/auth/setup-profile');
                    }, 1500);
                } else if (data.needsPinSetup) {
                    // Profile complete but PIN not set up
                    toast.success('Login successful! Please set up your PIN...');
                    setTimeout(() => {
                        router.push('/auth/set-pin');
                    }, 1500);
                } else {
                    // Login successful - go to dashboard
                    toast.success('Login successful! Welcome back!');
                    setTimeout(() => {
                        router.push('/');
                    }, 1500);
                }
            } else if (data.needsApproval) {
                // Pending approval
                toast.error('Your account is pending approval. Please wait for confirmation.');
            } else {
                // Error
                toast.error(data.error || 'Login failed. Please contact administrator.');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('An error occurred during login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    const initializeGoogleSignIn = useCallback(() => {
        if (!window.google) return;

        const buttonElement = document.getElementById('google-signin-button');
        if (!buttonElement) return;

        const clientId = '810166744861-oe506bicohrjcnh8i0f516n7s4oah6lb.apps.googleusercontent.com';

        // Clear any existing button content
        buttonElement.innerHTML = '';

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
            ux_mode: 'popup', // Force popup mode
            auto_select: false,
            cancel_on_tap_outside: true,
            itp_support: true,
        });

        window.google.accounts.id.renderButton(
            buttonElement,
            {
                theme: 'filled_blue',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: 320,
                type: 'standard',
                logo_alignment: 'left',
            }
        );
    }, [handleGoogleCallback]);

    const loadGoogleScript = useCallback(() => {
        if (typeof window === 'undefined') return;

        // Check if script already loaded
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

    const checkExistingAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            
            if (data.success && data.user) {
                // Already logged in - redirect to dashboard
                toast.success('Already logged in! Redirecting...');
                setTimeout(() => {
                    router.push('/');
                }, 1000);
                return;
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setCheckingAuth(false);
            // Load Google script after checking auth
            loadGoogleScript();
        }
    }, [router, loadGoogleScript]);

    useEffect(() => {
        // Check if already logged in
        checkExistingAuth();
    }, [checkExistingAuth]);




    if (checkingAuth) {
        return (
            <div className="admin-login-page">
                <Toaster position="top-center" />
                <div className="login-container">
                    <div className="loading-state">
                        <Loader2 className="spinner" size={40} />
                        <p>Checking authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-login-page">
            <Toaster position="top-center" />

            {/* Background Effects */}
            <div className="bg-effects">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-container">
                {/* Logo/Header */}
                <div className="login-header">
                    <div className="logo-container">
                        <Shield size={48} className="logo-icon" />
                    </div>
                    <h1>Admin Login</h1>
                    <p className="subtitle">Sign in with your registered Google account</p>
                </div>

                {/* Login Card */}
                <div className="login-card">
                    <div className="card-content">
                        <div className="login-section">
                            <h2>Sign In with Google</h2>
                            <p className="login-description">
                                Use your registered Google account to access the admin portal.
                            </p>

                            {/* Google Sign-In Button */}
                            <div className="google-signin-wrapper">
                                <div id="google-signin-button"></div>
                            </div>

                            {loading && (
                                <div className="loading-overlay">
                                    <Loader2 className="spinner" size={32} />
                                    <p>Authenticating...</p>
                                </div>
                            )}

                            {/* Info Section */}
                            <div className="info-section" style={{ marginTop: '2rem' }}>
                                <div className="info-item">
                                    <CheckCircle size={20} className="info-icon" />
                                    <span>Secure Google OAuth</span>
                                </div>
                                <div className="info-item">
                                    <CheckCircle size={20} className="info-icon" />
                                    <span>Organization-Based Access</span>
                                </div>
                                <div className="info-item">
                                    <CheckCircle size={20} className="info-icon" />
                                    <span>Role-Based Permissions</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <p>© 2025 D-Admin. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
