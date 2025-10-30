'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Loader2, Building2, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import '../../../styles/admin-styles/admin-login.scss';

function RegisterSuperAdminContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [invitedEmail, setInvitedEmail] = useState<string>('');
    const [tokenError, setTokenError] = useState<string>('');
    const [step, setStep] = useState(1); // 1: Google OAuth, 2: Organization Details
    const [googleData, setGoogleData] = useState<any>(null);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: '',
    });
    const [waitingForApproval, setWaitingForApproval] = useState(false);
    const [registrationId, setRegistrationId] = useState<string | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

    // Validate invite token on page load
    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setTokenError('No invitation token found. Please use the link from your invitation email.');
            setValidatingToken(false);
            return;
        }

        setInviteToken(token);
        validateInviteToken(token);
    }, [searchParams]);

    const handleGoogleCallback = useCallback(async (response: any) => {
        try {
            const credential = response.credential;
            const payload = JSON.parse(atob(credential.split('.')[1]));

            const { sub: googleId, email, name, picture: profilePicture } = payload;

            console.log('Google callback - Email from Google:', email);
            console.log('Google callback - Invited email:', invitedEmail);

            // Check if invitedEmail is set - if not, validate token now
            if (!invitedEmail || invitedEmail.trim() === '') {
                console.log('⚠️ Email not set yet, validating token now...');

                if (!inviteToken) {
                    toast.error('❌ Invalid invitation. Please use the link from your email.');
                    return;
                }

                // Validate token synchronously
                try {
                    console.log('🔄 Validating token inline with token:', inviteToken);
                    const validationResponse = await fetch('/api/auth/validate-invite-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: inviteToken }),
                    });

                    console.log('📥 Validation response status:', validationResponse.status);
                    const data = await validationResponse.json();
                    console.log('📥 Validation response data:', data);

                    if (data.success && data.invite) {
                        // Use the validated email for this registration
                        const validatedEmail = data.invite.invitedEmail;
                        console.log('✅ Token validated inline:', validatedEmail);

                        // Update state for future use
                        setInvitedEmail(validatedEmail);
                        setTokenValid(true);

                        // Continue with validation using the validated email
                        const normalizedGoogleEmail = email.toLowerCase().trim();
                        const normalizedInvitedEmail = validatedEmail.toLowerCase().trim();

                        if (normalizedGoogleEmail !== normalizedInvitedEmail) {
                            toast.error(
                                `❌ Email mismatch! You must sign in with ${validatedEmail}. You tried to use ${email}.`,
                                { duration: 6000 }
                            );
                            return;
                        }

                        // Email matches, proceed with registration
                        setGoogleData({ googleId, email, name, profilePicture });
                        setStep(2);
                        toast.success('✅ Email verified! Please complete your organization details.');
                        return;
                    } else {
                        console.error('❌ Validation failed:', data.error);
                        toast.error(`❌ ${data.error || 'Invalid or expired invitation link.'}`);
                        return;
                    }
                } catch (error: any) {
                    console.error('❌ Inline validation error:', error);
                    console.error('Error details:', error.message, error.stack);
                    toast.error(`❌ Validation error: ${error.message || 'Please try again.'}`);
                    return;
                }
            }

            // SECURITY: Validate that Google email matches invited email
            const normalizedGoogleEmail = email.toLowerCase().trim();
            const normalizedInvitedEmail = invitedEmail.toLowerCase().trim();

            if (normalizedGoogleEmail !== normalizedInvitedEmail) {
                toast.error(
                    `❌ Email mismatch! You must sign in with ${invitedEmail}. You tried to use ${email}.`,
                    { duration: 6000 }
                );
                return;
            }

            setGoogleData({ googleId, email, name, profilePicture });
            setStep(2);
            toast.success('✅ Email verified! Please complete your organization details.');
        } catch (error: any) {
            console.error('Google callback error:', error);
            toast.error('Google authentication failed: ' + (error.message || 'Unknown error'));
        }
    }, [invitedEmail, inviteToken]);

    const initializeGoogleSignIn = useCallback(() => {
        console.log('🔵 Initializing Google Sign-In...');

        if (!window.google) {
            console.error('❌ Google API not loaded');
            return;
        }

        const buttonElement = document.getElementById('google-signin-button');
        if (!buttonElement) {
            console.error('❌ Google button element not found');
            return;
        }

        console.log('✅ Google API loaded, button element found');

        const clientId = '810166744861-oe506bicohrjcnh8i0f516n7s4oah6lb.apps.googleusercontent.com';

        try {
            // Clear any existing button content
            buttonElement.innerHTML = '';

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleCallback,
                ux_mode: 'popup',
                auto_select: false,
                cancel_on_tap_outside: true,
                itp_support: true,
            });

            window.google.accounts.id.renderButton(
                buttonElement,
                {
                    theme: 'filled_blue',
                    size: 'large',
                    text: 'signup_with',
                    shape: 'rectangular',
                    width: 320,
                    type: 'standard',
                    logo_alignment: 'left',
                }
            );

            console.log('✅ Google Sign-In button rendered successfully');
            setGoogleLoaded(true);
        } catch (error) {
            console.error('❌ Error rendering Google button:', error);
            toast.error('Failed to initialize Google Sign-In');
        }
    }, [handleGoogleCallback]);

    const loadGoogleScript = useCallback(() => {
        if (typeof window === 'undefined') return;

        console.log('📥 Loading Google script...');

        if (window.google) {
            console.log('✅ Google already loaded, initializing...');
            setTimeout(() => initializeGoogleSignIn(), 100);
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            console.log('⏳ Google script already loading, waiting...');
            existingScript.addEventListener('load', () => {
                setTimeout(() => initializeGoogleSignIn(), 100);
            });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            console.log('✅ Google script loaded');
            setTimeout(() => initializeGoogleSignIn(), 100);
        };
        script.onerror = () => {
            console.error('❌ Failed to load Google script');
            toast.error('Failed to load Google Sign-In. Please refresh the page.');
        };
        document.body.appendChild(script);
    }, [initializeGoogleSignIn]);

    // Load Google script immediately when page loads
    useEffect(() => {
        console.log('📥 Loading Google script on page load...');
        loadGoogleScript();
    }, [loadGoogleScript]); // Empty dependency array = run once on mount

    // Initialize Google button when token is validated and Google API is loaded
    useEffect(() => {
        if (window.google && tokenValid && invitedEmail) {
            console.log('🎯 Token validated and Google loaded - initializing button');
            setTimeout(() => {
                initializeGoogleSignIn();
            }, 100);
        } else {
            console.log('⏳ Waiting for: window.google:', !!window.google, 'tokenValid:', tokenValid, 'invitedEmail:', !!invitedEmail);
        }
    }, [tokenValid, invitedEmail, initializeGoogleSignIn]); // Removed 'step' since we always want to init when ready

    const validateInviteToken = async (token: string) => {
        try {
            // Immediately set states to allow Google button to work
            // We'll validate in parallel
            setValidatingToken(false);

            const response = await fetch('/api/auth/validate-invite-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (data.success && data.invite) {
                console.log('✅ Token validation successful:', data.invite.invitedEmail);
                setInvitedEmail(data.invite.invitedEmail);
                setTokenValid(true);
                console.log('✅ State updated - tokenValid: true, invitedEmail:', data.invite.invitedEmail);
                toast.success(`Welcome! Invitation valid for ${data.invite.invitedEmail}`);
            } else {
                console.error('❌ Token validation failed:', data.error);
                setTokenError(data.error || 'Invalid or expired invitation link');
                setTokenValid(false);
                setValidatingToken(false);
            }
        } catch (error: any) {
            console.error('Token validation error:', error);
            setTokenError('Failed to validate invitation. Please try again.');
            setTokenValid(false);
            setValidatingToken(false);
        }
    };




    // Poll for approval status
    const checkApprovalStatus = async (id: string) => {
        try {
            const response = await fetch(`/api/auth/check-approval-status?id=${id}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            const data = await response.json();

            if (data.success) {
                setApprovalStatus(data.approvalStatus);

                if (data.approvalStatus === 'approved') {
                    toast.dismiss('waiting-approval');
                    toast.success('🎉 Your account has been approved! Logging you in...', { duration: 2000 });
                    setWaitingForApproval(false);
                    setLoading(false);

                    // Auto-login: Auth token is already set by the approval status check API
                    setTimeout(() => {
                        try {
                            // Use window.location for full page reload to ensure UI reflects auth state
                            window.location.href = '/';
                        } catch (error) {
                            console.error('Auto-login error:', error);
                            toast.error('Approved! Please login manually.');
                            window.location.href = '/superadmin-login';
                        }
                    }, 2000);
                    return true; // Stop polling
                } else if (data.approvalStatus === 'rejected') {
                    toast.dismiss('waiting-approval');
                    toast.error('❌ Your registration was rejected. Please contact support.', { duration: 5000 });
                    setWaitingForApproval(false);
                    setLoading(false);
                    return true; // Stop polling
                }
            }
            return false; // Continue polling
        } catch (error) {
            console.error('Error checking approval status:', error);
            return false;
        }
    };

    // Start polling when waiting for approval
    React.useEffect(() => {
        if (waitingForApproval && registrationId) {
            const pollInterval = setInterval(async () => {
                const shouldStop = await checkApprovalStatus(registrationId);
                if (shouldStop) {
                    clearInterval(pollInterval);
                }
            }, 3000); // Check every 3 seconds

            return () => clearInterval(pollInterval);
        }
    }, [waitingForApproval, registrationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting registration with data:', {
                googleData,
                formData,
                inviteToken
            });

            // Show sending email toast
            toast.loading('📧 Sending approval request to owner...', { id: 'email-sending' });

            const response = await fetch('/api/auth/register-superadmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    googleId: googleData.googleId,
                    email: googleData.email,
                    name: googleData.name,
                    profilePicture: googleData.profilePicture,
                    organizationName: formData.organizationName,
                    inviteToken, // Include the validated invite token
                }),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            // Dismiss loading toast
            toast.dismiss('email-sending');

            if (data.success) {
                if (data.emailSent && data.user?.id) {
                    // Email was sent successfully - start waiting for approval
                    toast.success(
                        '✅ Registration Successful!\n📧 Approval request sent to owner\n📱 Notification created in owner dashboard',
                        {
                            duration: 4000,
                            style: {
                                background: '#10b981',
                                color: 'white',
                                fontWeight: 500,
                                whiteSpace: 'pre-line'
                            }
                        }
                    );

                    // Start polling for approval
                    setRegistrationId(data.user.id);
                    setWaitingForApproval(true);

                    setTimeout(() => {
                        toast.loading('⏳ Waiting for owner approval... This page will update automatically.', {
                            id: 'waiting-approval',
                            duration: Infinity,
                        });
                    }, 4500);
                } else if (data.needsApproval) {
                    // Registration saved but email failed
                    toast.error('⚠️ Registration saved but email failed to send. Contact administrator.', {
                        duration: 5000,
                    });
                    setLoading(false);
                } else {
                    toast.success('✅ Registration successful!');
                    setTimeout(() => {
                        router.push('/');
                    }, 1500);
                }
            } else {
                console.error('Registration failed:', data.error);
                toast.error(data.error || 'Registration failed. Please try again.');
                setLoading(false);
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.dismiss('email-sending');
            toast.error('An error occurred during registration');
            setLoading(false);
        }
    };

    // Show loading state while validating token
    if (validatingToken) {
        return (
            <div className="admin-login-page">
                <Toaster position="top-center" />
                <div className="bg-effects">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>
                <div className="login-container">
                    <div className="login-card">
                        <div className="card-content" style={{ textAlign: 'center', padding: '3rem' }}>
                            <Loader2 className="spinner" size={48} style={{ margin: '0 auto 1rem' }} />
                            <h2>Validating your invitation...</h2>
                            <p style={{ color: '#6b7280' }}>Please wait while we verify your invite link</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state if token is invalid
    if (!tokenValid || tokenError) {
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
                            <Shield size={48} className="logo-icon" style={{ color: '#ef4444' }} />
                        </div>
                        <h1 style={{ color: '#ef4444' }}>Invalid Invitation</h1>
                    </div>
                    <div className="login-card">
                        <div className="card-content" style={{ textAlign: 'center', padding: '2rem' }}>
                            <AlertTriangle size={64} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Cannot Access Registration</h2>
                            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                                {tokenError}
                            </p>
                            <div style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginTop: '1rem'
                            }}>
                                <p style={{ color: '#991b1b', fontSize: '14px', margin: 0 }}>
                                    <strong>ℹ️ Need help?</strong><br />
                                    Please contact the platform owner to request a new invitation link.
                                </p>
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
                    <h1>SuperAdmin Registration</h1>
                    <p className="subtitle">Complete your registration for {invitedEmail}</p>
                </div>

                {/* Show invite confirmation banner - only when validated */}
                {tokenValid && invitedEmail && (
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
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '16px' }}>✅ Valid Invitation</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                            <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {invitedEmail}
                        </p>
                    </div>
                )}

                <div className="login-card">
                    <div className="card-content">
                        {/* Step 1: Google OAuth */}
                        {step === 1 && (
                            <div className="login-section">
                                <h2>Verify Your Identity</h2>
                                <p className="login-description">
                                    Sign in with your Google account ({invitedEmail})
                                </p>

                                <div style={{
                                    background: '#fff3cd',
                                    border: '1px solid #ffc107',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <p style={{ color: '#856404', fontSize: '14px', margin: 0 }}>
                                        <strong>🔒 Security Notice:</strong> You must sign in with <strong>{invitedEmail}</strong>.
                                        Other email addresses will be rejected.
                                    </p>
                                </div>

                                <div className="google-signin-wrapper" style={{
                                    minHeight: '60px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: '1.5rem',
                                    flexDirection: 'column'
                                }}>
                                    <div id="google-signin-button" style={{ width: '100%', maxWidth: '350px' }}></div>

                                    {!googleLoaded && (
                                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                            <Loader2 size={24} className="spinner" style={{ margin: '0 auto' }} />
                                            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                                                Loading Google Sign-In...
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    console.log('🔄 Manual retry triggered');
                                                    loadGoogleScript();
                                                }}
                                                style={{
                                                    marginTop: '1rem',
                                                    padding: '8px 16px',
                                                    fontSize: '14px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    color: '#374151'
                                                }}
                                            >
                                                Retry Loading
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {loading && (
                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <Loader2 size={20} className="spinner" />
                                        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                                            Authenticating...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SuperAdmin Account Details */}
                        {step === 2 && googleData && (
                            <div className="login-section">
                                <h2>Organization Details</h2>

                                <p className="login-description">
                                    Complete your organization information
                                </p>

                                <div style={{
                                    background: '#f0fdf4',
                                    border: '1px solid #10b981',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <p style={{ color: '#065f46', fontSize: '14px', margin: 0 }}>
                                        <strong>✅ Identity Verified:</strong> {googleData.email}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                                    {/* Name (Editable, Required) */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            <Shield size={18} style={{ display: 'inline', marginRight: '8px' }} />
                                            Your Name *
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            {googleData.profilePicture && (
                                                <img
                                                    src={googleData.profilePicture}
                                                    alt={googleData.name}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        border: '2px solid #10b981'
                                                    }}
                                                />
                                            )}
                                            <input
                                                type="text"
                                                required
                                                value={googleData.name}
                                                onChange={(e) => setGoogleData({ ...googleData, name: e.target.value })}
                                                placeholder="Enter your name"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    paddingLeft: googleData.profilePicture ? '52px' : '12px',
                                                    border: '2px solid #10b981',
                                                    borderRadius: '6px',
                                                    fontSize: '16px',
                                                    background: '#f0fdf4',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Email (Read-only, Verified) */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            <Mail size={18} style={{ display: 'inline', marginRight: '8px' }} />
                                            Email Address * (Verified)
                                        </label>
                                        <input
                                            type="email"
                                            value={googleData.email}
                                            readOnly
                                            disabled
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '2px solid #10b981',
                                                borderRadius: '6px',
                                                fontSize: '16px',
                                                background: '#f0fdf4',
                                                cursor: 'not-allowed',
                                            }}
                                        />
                                        <small style={{ color: '#059669', fontSize: '13px', display: 'block', marginTop: '4px' }}>
                                            ✓ This email is verified and cannot be changed
                                        </small>
                                    </div>

                                    {/* Organization Name (Required) */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            <Building2 size={18} style={{ display: 'inline', marginRight: '8px' }} />
                                            Organization Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.organizationName}
                                            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                            placeholder="Enter organization name"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                fontSize: '16px',
                                            }}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || waitingForApproval}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: (loading || waitingForApproval) ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: (loading || waitingForApproval) ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
                                        }}
                                    >
                                        {waitingForApproval ? (
                                            <>
                                                <Loader2 className="spinner" size={20} />
                                                Waiting for Approval...
                                            </>
                                        ) : loading ? (
                                            <>
                                                <Loader2 className="spinner" size={20} />
                                                Sending Approval Request...
                                            </>
                                        ) : (
                                            <>
                                                <Mail size={20} />
                                                Send Approval Request to Owner
                                            </>
                                        )}
                                    </button>

                                    {waitingForApproval ? (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '20px',
                                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                            borderRadius: '8px',
                                            border: '2px solid #f59e0b',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
                                            <strong style={{ color: '#92400e', fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                                                Waiting for Owner Approval
                                            </strong>
                                            <small style={{ color: '#78350f', fontSize: '13px', lineHeight: '1.5' }}>
                                                Your request has been sent to the owner.<br />
                                                This page will automatically update when approved or rejected.<br />
                                                <strong>Status: {approvalStatus.toUpperCase()}</strong>
                                            </small>
                                        </div>
                                    ) : (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '12px',
                                            background: '#eff6ff',
                                            borderRadius: '6px',
                                            border: '1px solid #3b82f6'
                                        }}>
                                            <small style={{ color: '#1e40af', fontSize: '13px', lineHeight: '1.5' }}>
                                                ℹ️ <strong>What happens next:</strong><br />
                                                1. Your request will be sent to the platform owner for approval<br />
                                                2. This page will wait and automatically update when approved<br />
                                                3. You&apos;ll be redirected to login automatically
                                            </small>
                                        </div>
                                    )}
                                </form>
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

export default function RegisterSuperAdminPage() {
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
            <RegisterSuperAdminContent />
        </Suspense>
    );
}
