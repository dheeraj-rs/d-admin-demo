'use client';

import { useState } from 'react';
import { Mail, Send, X } from 'lucide-react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string) => Promise<void>;
}

export default function InviteModal({ isOpen, onClose, onInvite }: InviteModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await onInvite(email);
            setEmail('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to send invite');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setEmail('');
            setError('');
            onClose();
        }
    };

    return (
        <div
            className="invite-modal-overlay"
            onClick={handleClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <div
                className="invite-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: 'var(--surface-card)',
                    borderRadius: '12px',
                    padding: '0',
                    maxWidth: '500px',
                    width: '90%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    animation: 'modalSlideIn 0.2s ease-out',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '24px',
                        color: 'white',
                        position: 'relative',
                    }}
                >
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                    >
                        <X size={18} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                                Invite SuperAdmin
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                                Send invitation to register as SuperAdmin
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            htmlFor="invite-email"
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'var(--text-color)',
                            }}
                        >
                            Email Address <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="invite-email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                                placeholder="superadmin@example.com"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    border: `1px solid ${error ? '#ef4444' : 'var(--surface-border)'}`,
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    backgroundColor: loading ? 'var(--surface-ground)' : 'var(--surface-card)',
                                    color: 'var(--text-color)',
                                    transition: 'all 0.2s',
                                    outline: 'none',
                                }}
                                onFocus={(e) => {
                                    if (!error) {
                                        e.currentTarget.style.borderColor = '#667eea';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--surface-border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                            <Mail
                                size={18}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: error ? '#ef4444' : 'var(--text-color-secondary)',
                                }}
                            />
                        </div>
                        {error && (
                            <p
                                style={{
                                    margin: '8px 0 0 0',
                                    fontSize: '13px',
                                    color: '#ef4444',
                                }}
                            >
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Info Box */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                        }}
                    >
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-color-secondary)', lineHeight: '1.6' }}>
                            <strong>📧 What happens next:</strong>
                            <br />
                            • An invitation email will be sent to this address
                            <br />
                            • They can register using the invite link
                            <br />
                            • You will receive an approval request after registration
                            <br />• You must approve before they can access the dashboard
                        </p>
                    </div>

                    {/* Buttons */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                border: '1px solid var(--surface-border)',
                                backgroundColor: 'transparent',
                                color: 'var(--text-color)',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.5 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !email.trim()}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: loading || !email.trim()
                                    ? 'var(--surface-border)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 500,
                                cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && email.trim()) {
                                    e.currentTarget.style.opacity = '0.9';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <Send size={16} />
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
