'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key, Mail, Lock, AlertCircle, Crown } from 'lucide-react';
import { setOwnerSession, isOwnerAuthenticated } from '../../../lib/ownerAuth';
import toast, { Toaster } from 'react-hot-toast';
import '../../../styles/admin-styles/admin-login.scss';

const OwnerLoginPage = () => {
    const router = useRouter();
    const [loginMethod, setLoginMethod] = useState<'google' | 'backup'>('google');
    const [backupKey, setBackupKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorPin, setTwoFactorPin] = useState('');
    const [pendingCredentials, setPendingCredentials] = useState<any>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [pinExpiresAt, setPinExpiresAt] = useState<Date | null>(null);

    const handleGoogleCallback = useCallback(async (response: any) => {
        setLoading(true);
        setError('');
        toast.loading('Verifying owner access...', { id: 'verifying' });

        try {
            // Decode JWT token to get user info
            const token = response.credential;
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const payload = JSON.parse(jsonPayload);

            // Send to backend for verification
            const res = await fetch('/api/auth/owner-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: payload.email,
                    name: payload.name,
                    googleToken: token,
                }),
            });

            const data = await res.json();
            toast.dismiss('verifying');

            console.log('Owner login response:', { status: res.status, success: data.success });

            if (!res.ok) {
                toast.error(data.error || '❌ Access denied. Owner only.');
                setError(data.error || 'Login failed');
                setLoading(false);
                return;
            }

            if (!data.success) {
                // Check if 2FA is required
                if (data.requiresTwoFactor) {
                    toast.dismiss('verifying');
                    setRequires2FA(true);
                    setPendingCredentials({
                        email: payload.email,
                        name: payload.name,
                        googleToken: token,
                    });

                    // Send PIN email if needed
                    if (data.requiresNewPin) {
                        await sendTwoFactorPin(payload.email);
                    } else {
                        toast.success('📧 PIN already sent! Check your email.');
                    }
                    setLoading(false);
                    return;
                }

                toast.error('❌ Login failed');
                setError('Login failed');
                setLoading(false);
                return;
            }

            // Store minimal owner session (no sensitive data in localStorage)
            setOwnerSession({
                email: 'owner', // Generic placeholder
                name: 'Owner',
                role: 'owner',
                isOwner: true
            });

            console.log('Owner login successful, redirecting to dashboard...');
            toast.success('👑 Welcome, Owner! Full access granted.');

            // Wait a moment for cookie to be set, then redirect
            setTimeout(() => {
                console.log('Redirecting to /owner-dashboard');
                window.location.href = '/owner-dashboard';
            }, 200);
        } catch (err) {
            console.error('Google login error:', err);
            toast.dismiss('verifying');
            toast.error('❌ Login failed. Please try again.');
            setError('Failed to login with Google');
            setLoading(false);
        }
    }, []);

    const initializeGoogleSignIn = useCallback(() => {
        if (typeof window !== 'undefined' && window.google) {
            const buttonElement = document.getElementById('googleSignInButton');
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
                itp_support: true, // Intelligent Tracking Prevention support
            });

            window.google.accounts.id.renderButton(
                buttonElement,
                {
                    theme: 'filled_blue',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'rectangular',
                    width: 350,
                    type: 'standard',
                    logo_alignment: 'left',
                }
            );
        }
    }, [handleGoogleCallback]);

    useEffect(() => {
        // Check if already authenticated - middleware will handle redirect
        // Don't redirect here to avoid conflicts

        // Load Google Sign-In script
        const loadGoogleScript = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                setGoogleLoaded(true);
                initializeGoogleSignIn();
            };
            document.body.appendChild(script);
        };

        loadGoogleScript();
    }, [initializeGoogleSignIn]);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);


    const sendTwoFactorPin = async (email: string) => {
        try {
            toast.loading('Sending verification PIN to drjsde@gmail.com...', { id: 'send-pin' });
            const res = await fetch('/api/owner/send-2fa-pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }), // This is ignored by API - always sends to OWNER_EMAIL
            });
            const data = await res.json();
            toast.dismiss('send-pin');

            if (data.success) {
                toast.success('📧 Verification PIN sent to drjsde@gmail.com!\n\nCheck your inbox and enter the 6-digit code.', { duration: 6000 });

                // Set cooldown timer (60 seconds before allowing resend)
                setResendCooldown(60);

                // Track PIN expiry time
                if (data.expiresAt) {
                    setPinExpiresAt(new Date(data.expiresAt));
                }
            } else {
                console.error('Failed to send PIN:', data.error);
                toast.error(`❌ ${data.error || 'Failed to send PIN'}\n\nCheck server console for details.`, { duration: 5000 });
            }
        } catch (error) {
            console.error('Error sending PIN:', error);
            toast.dismiss('send-pin');
            toast.error('❌ Failed to send PIN. Check server console for details.', { duration: 5000 });
        }
    };

    const handleTwoFactorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!twoFactorPin || twoFactorPin.length !== 6) {
            toast.error('Please enter a valid 6-digit PIN');
            return;
        }

        setLoading(true);
        toast.loading('Verifying PIN...', { id: 'verify-pin' });

        try {
            const requestBody = pendingCredentials.backupKey
                ? { backupKey: pendingCredentials.backupKey, twoFactorPin }
                : { ...pendingCredentials, twoFactorPin };

            const res = await fetch('/api/auth/owner-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            const data = await res.json();
            toast.dismiss('verify-pin');

            if (!res.ok || !data.success) {
                toast.error(data.error || '❌ Invalid PIN');
                setError(data.error || 'Invalid PIN');
                setLoading(false);
                return;
            }

            // Success! Store session and redirect
            setOwnerSession({
                email: 'owner',
                name: 'Owner',
                role: 'owner',
                isOwner: true
            });

            toast.success('✅ PIN verified! Welcome, Owner!');

            setTimeout(() => {
                window.location.href = '/owner-dashboard';
            }, 200);
        } catch (err) {
            console.error('2FA verification error:', err);
            toast.dismiss('verify-pin');
            toast.error('❌ Verification failed. Please try again.');
            setError('Verification failed');
            setLoading(false);
        }
    };

    const handleBackupKeyLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        toast.loading('Verifying backup key...', { id: 'verifying' });

        try {
            const res = await fetch('/api/auth/owner-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backupKey }),
            });

            const data = await res.json();
            toast.dismiss('verifying');

            console.log('Backup key login response:', { status: res.status, success: data.success });

            if (!res.ok) {
                toast.error(data.error || '❌ Invalid backup key');
                setError(data.error || 'Invalid backup key');
                setLoading(false);
                return;
            }

            if (!data.success) {
                // Check if 2FA is required for backup key
                if (data.requiresTwoFactor) {
                    toast.dismiss('verifying');
                    setRequires2FA(true);
                    setPendingCredentials({ backupKey });

                    // Send PIN email if needed
                    if (data.requiresNewPin) {
                        const ownerEmail = 'drjsde@gmail.com';
                        await sendTwoFactorPin(ownerEmail);
                    } else {
                        toast.success('📧 PIN already sent! Check your email.');
                    }
                    setLoading(false);
                    return;
                }

                toast.error('❌ Login failed');
                setError('Login failed');
                setLoading(false);
                return;
            }

            // Store minimal owner session (no sensitive data in localStorage)
            setOwnerSession({
                email: 'owner', // Generic placeholder
                name: 'Owner',
                role: 'owner',
                isOwner: true
            });

            console.log('Backup key login successful, redirecting to dashboard...');
            toast.success('👑 Backup key verified! Access granted.');

            // Wait a moment for cookie to be set, then redirect
            setTimeout(() => {
                console.log('Redirecting to /owner-dashboard');
                window.location.href = '/owner-dashboard';
            }, 200);
        } catch (err) {
            console.error('Backup key login error:', err);
            toast.dismiss('verifying');
            toast.error('❌ Login failed. Please try again.');
            setError('Failed to login with backup key');
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page owner-login-page">
            <Toaster position="top-center" />

            <div className="bg-effects">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-container">
                <div className="login-header">
                    <div className="logo-container">
                        <Crown size={48} className="logo-icon" style={{ color: '#f59e0b' }} />
                    </div>
                    <h1>Owner Access</h1>
                    <p className="subtitle">Highest level of system control</p>
                </div>

                <div className="login-card">
                    <div className="card-content">
                        {requires2FA ? (
                            <div className="login-section">
                                <h2>Two-Factor Authentication</h2>
                                <p className="login-description">
                                    Enter the 6-digit verification PIN sent to your email
                                </p>

                                <div style={{
                                    background: '#d1fae5',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: '1px solid #10b981',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontSize: '14px' }}>
                                        <Mail size={16} />
                                        <span>Check your email for the verification PIN</span>
                                    </div>
                                    {pinExpiresAt && (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            ⏰ PIN expires at {pinExpiresAt.toLocaleTimeString()} ({Math.round((pinExpiresAt.getTime() - Date.now()) / 60000)} min left)
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleTwoFactorSubmit}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            fontWeight: 600,
                                            color: '#1f2937'
                                        }}>
                                            <Shield size={16} />
                                            Verification PIN
                                        </label>
                                        <input
                                            type="text"
                                            value={twoFactorPin}
                                            onChange={(e) => setTwoFactorPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Enter 6-digit PIN"
                                            required
                                            maxLength={6}
                                            disabled={loading}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '1.5rem',
                                                letterSpacing: '0.5rem',
                                                textAlign: 'center',
                                                fontWeight: 600,
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || twoFactorPin.length !== 6}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: (loading || twoFactorPin.length !== 6) ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            cursor: (loading || twoFactorPin.length !== 6) ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {loading ? 'Verifying...' : 'Verify PIN'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (resendCooldown === 0) {
                                                const ownerEmail = 'drjsde@gmail.com';
                                                await sendTwoFactorPin(ownerEmail);
                                            }
                                        }}
                                        disabled={resendCooldown > 0}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: resendCooldown > 0 ? '#f3f4f6' : '#eff6ff',
                                            color: resendCooldown > 0 ? '#9ca3af' : '#3b82f6',
                                            border: resendCooldown > 0 ? '1px solid #e5e7eb' : '1px solid #3b82f6',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                            marginTop: '1rem',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {resendCooldown > 0
                                            ? `Resend PIN in ${resendCooldown}s`
                                            : '🔄 Resend PIN'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRequires2FA(false);
                                            setTwoFactorPin('');
                                            setPendingCredentials(null);
                                            setResendCooldown(0);
                                            setPinExpiresAt(null);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'transparent',
                                            color: '#6b7280',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            marginTop: '0.5rem',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        ← Back to Login
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <>
                                <div className="login-method-tabs">
                                    <button
                                        className={`method-tab ${loginMethod === 'google' ? 'active' : ''}`}
                                        onClick={() => setLoginMethod('google')}
                                    >
                                        <Mail size={18} />
                                        Google Login
                                    </button>
                                    <button
                                        className={`method-tab ${loginMethod === 'backup' ? 'active' : ''}`}
                                        onClick={() => setLoginMethod('backup')}
                                    >
                                        <Key size={18} />
                                        Backup Key
                                    </button>
                                </div>

                                {loginMethod === 'google' ? (
                                    <div className="login-section">
                                        <h2>Owner Login</h2>
                                        <p className="login-description">
                                            Sign in with the owner email account
                                        </p>

                                        <div style={{
                                            background: '#fef3c7',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            border: '1px solid #f59e0b',
                                            marginBottom: '2rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                                <Crown size={20} style={{ color: '#92400e' }} />
                                                <strong style={{ color: '#92400e' }}>Owner Email:</strong>
                                            </div>
                                            <p style={{ margin: 0, paddingLeft: '30px', color: '#92400e', fontSize: '14px' }}>
                                                drjsde@gmail.com
                                            </p>
                                        </div>

                                        <div className="google-signin-wrapper">
                                            <div id="googleSignInButton"></div>
                                        </div>

                                        {!googleLoaded && (
                                            <div style={{
                                                marginTop: '1rem',
                                                textAlign: 'center',
                                                color: '#6b7280',
                                                fontSize: '14px'
                                            }}>
                                                Loading Google Sign-In...
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="login-section">
                                        <h2>Backup Key Access</h2>
                                        <p className="login-description">
                                            Enter your secure backup key
                                        </p>

                                        <form onSubmit={handleBackupKeyLogin}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    marginBottom: '0.5rem',
                                                    fontWeight: 600,
                                                    color: '#1f2937'
                                                }}>
                                                    <Lock size={16} />
                                                    Backup Key
                                                </label>
                                                <input
                                                    type="password"
                                                    value={backupKey}
                                                    onChange={(e) => setBackupKey(e.target.value)}
                                                    placeholder="Enter your backup key"
                                                    required
                                                    disabled={loading}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.75rem 1rem',
                                                        border: '2px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        fontSize: '1rem',
                                                        transition: 'all 0.3s'
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading || !backupKey}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    background: loading ? '#9ca3af' : '#f59e0b',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.3s'
                                                }}
                                            >
                                                {loading ? 'Verifying...' : 'Login with Backup Key'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                <div style={{
                                    marginTop: '2rem',
                                    padding: '15px',
                                    background: '#fef2f2',
                                    borderRadius: '8px',
                                    border: '1px solid #ef4444',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#991b1b', fontSize: '14px' }}>
                                        <Shield size={16} />
                                        <span>Restricted to website owner only</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerLoginPage;
