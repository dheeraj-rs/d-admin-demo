'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Plus, Copy, Trash2, Check, X, Clock, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import authFetch from '../../../lib/auth-fetch';
import { safeJsonParse } from '../../../lib/safe-fetch';
import { useRouter } from 'next/navigation';
import '../../../styles/pages/invite-admins/index.scss';

interface Invite {
    _id: string;
    invitedEmail: string;
    inviteToken: string;
    adminAccessKey: string;
    status: 'pending' | 'accepted' | 'expired';
    expiresAt: Date;
    acceptedAt?: Date;
    createdAt: Date;
}

const InviteAdminsPage = () => {
    const router = useRouter();
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [email, setEmail] = useState('');
    const [expiryDays, setExpiryDays] = useState(7);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/auth');
            const data = await safeJsonParse(response);
            if (!data.authenticated || data.user?.role !== 'superadmin') {
                toast.error('Access denied. Superadmin only.');
                router.push('/');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/');
        }
    }, [router]);

    useEffect(() => {
        checkAuth();
        fetchInvites();
    }, [checkAuth]);

    const fetchInvites = async () => {
        try {
            setIsLoading(true);
            const response = await authFetch('/api/admin-invites');
            const data = await safeJsonParse(response);

            if (data.success) {
                setInvites(data.data);
            } else {
                toast.error(data.error || 'Failed to load invites');
            }
        } catch (error) {
            console.error('Error fetching invites:', error);
            toast.error('Failed to load invites');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const response = await authFetch('/api/admin-invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, expiryDays }),
            });
            const data = await safeJsonParse(response);

            if (data.success) {
                setShowModal(false);
                setEmail('');
                setExpiryDays(7);
                await fetchInvites();

                // Show success message based on email status
                if (data.emailSent) {
                    toast.success(
                        `✅ Invite sent to ${email}! Check your email for the invite link and access key.`,
                        { duration: 5000 }
                    );
                } else {
                    // Show invite details if email failed
                    const inviteUrl = data.data.inviteUrl;
                    const adminKey = data.data.adminAccessKey;

                    toast.error(
                        `⚠️ Email failed to send. Please share these details manually with ${email}`,
                        { duration: 8000 }
                    );

                    // Show details in a separate toast
                    setTimeout(() => {
                        toast(
                            <div style={{ fontSize: '12px' }}>
                                <p><strong>Invite URL:</strong><br />{inviteUrl}</p>
                                <p><strong>Admin Key:</strong><br />{adminKey}</p>
                            </div>,
                            { duration: 15000 }
                        );
                    }, 500);
                }
            } else {
                toast.error(data.error || 'Failed to create invite');
            }
        } catch (error) {
            console.error('Error creating invite:', error);
            toast.error('Failed to create invite');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteInvite = async (inviteId: string) => {
        if (!confirm('Are you sure you want to delete this invite?')) return;

        try {
            const response = await authFetch(`/api/admin-invites/${inviteId}`, {
                method: 'DELETE',
            });
            const data = await safeJsonParse(response);

            if (data.success) {
                toast.success('Invite deleted successfully');
                await fetchInvites();
            } else {
                toast.error(data.error || 'Failed to delete invite');
            }
        } catch (error) {
            console.error('Error deleting invite:', error);
            toast.error('Failed to delete invite');
        }
    };

    const copyToClipboard = (text: string, id: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(`${id}-${type}`);
        toast.success(`${type} copied to clipboard!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getInviteUrl = (token: string) => {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        return `${appUrl}/register-admin?token=${token}`;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = (expiresAt: Date) => {
        return new Date(expiresAt) < new Date();
    };

    const getStatusBadge = (invite: Invite) => {
        if (invite.status === 'accepted') {
            return <span className="status-badge accepted"><Check size={14} /> Accepted</span>;
        }
        if (isExpired(invite.expiresAt)) {
            return <span className="status-badge expired"><Clock size={14} /> Expired</span>;
        }
        return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
    };

    return (
        <div className="invite-admins-page">
            <Toaster position="top-right" />

            <div className="page-header">
                <div>
                    <h1><UserPlus size={32} /> Invite Admins</h1>
                    <p>Send invitations to add admins to your organization</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    Create Invite
                </button>
            </div>

            <div className="invites-container">
                {isLoading ? (
                    <div className="loading-state">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
                        <p>Loading invites...</p>
                    </div>
                ) : invites.length === 0 ? (
                    <div className="empty-state">
                        <Mail size={64} />
                        <h3>No invites yet</h3>
                        <p>Create your first admin invite to get started</p>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} />
                            Create Invite
                        </button>
                    </div>
                ) : (
                    <div className="invites-grid">
                        {invites.map((invite) => (
                            <div key={invite._id} className={`invite-card ${invite.status}`}>
                                <div className="invite-header">
                                    <Mail size={24} />
                                    {getStatusBadge(invite)}
                                </div>

                                <div className="invite-body">
                                    <div className="invite-field">
                                        <label>Email</label>
                                        <p>{invite.invitedEmail}</p>
                                    </div>

                                    <div className="invite-field">
                                        <label>Invite URL</label>
                                        <div className="copy-field">
                                            <input
                                                type="text"
                                                value={getInviteUrl(invite.inviteToken)}
                                                readOnly
                                            />
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(
                                                        getInviteUrl(invite.inviteToken),
                                                        invite._id,
                                                        'URL'
                                                    )
                                                }
                                                className="copy-btn"
                                            >
                                                {copiedId === `${invite._id}-URL` ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <Copy size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="invite-field">
                                        <label>Admin Access Key</label>
                                        <div className="copy-field">
                                            <input
                                                type="text"
                                                value={invite.adminAccessKey}
                                                readOnly
                                            />
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(
                                                        invite.adminAccessKey,
                                                        invite._id,
                                                        'Key'
                                                    )
                                                }
                                                className="copy-btn"
                                            >
                                                {copiedId === `${invite._id}-Key` ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <Copy size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="invite-meta">
                                        <span>Created: {formatDate(invite.createdAt)}</span>
                                        <span>Expires: {formatDate(invite.expiresAt)}</span>
                                    </div>
                                </div>

                                <div className="invite-footer">
                                    {invite.status === 'pending' && !isExpired(invite.expiresAt) && (
                                        <button
                                            className="btn-danger-outline"
                                            onClick={() => handleDeleteInvite(invite._id)}
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create Admin Invite</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateInvite}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@example.com"
                                        required
                                    />
                                    <small>The admin will receive an invite to this email</small>
                                </div>

                                <div className="form-group">
                                    <label>Expiry (Days)</label>
                                    <select
                                        value={expiryDays}
                                        onChange={(e) => setExpiryDays(Number(e.target.value))}
                                    >
                                        <option value={1}>1 Day</option>
                                        <option value={3}>3 Days</option>
                                        <option value={7}>7 Days</option>
                                        <option value={14}>14 Days</option>
                                        <option value={30}>30 Days</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <i className="pi pi-spin pi-spinner" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={16} />
                                            Create Invite
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Styles are in /styles/pages/invite-admins/index.scss */}
            <style jsx>{`
                /* All styles moved to /styles/pages/invite-admins/index.scss */
            `}</style>
        </div>
    );
};

export default InviteAdminsPage;
