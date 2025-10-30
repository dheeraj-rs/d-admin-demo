'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Bell, Plus, Edit, Trash2, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle, Shield, UserCheck, FileCheck, Settings, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '../../../lib/i18n';
import toast, { Toaster } from 'react-hot-toast';
import authFetch from '../../../lib/auth-fetch';
import { safeJsonParse } from '../../../lib/safe-fetch';
import { useRouter } from 'next/navigation';
import '../../../styles/pages/messages/index.scss';

interface Message {
    _id?: string;
    title: string;
    description: string;
    icon: string;
    timestamp: Date;
    isRead: boolean;
    recipientId?: string;
    recipientRole?: 'admin' | 'owner' | 'all';
    type: 'info' | 'warning' | 'success' | 'error';
    category?: 'system' | 'admin-permission' | 'admin-request' | 'approval-request' | 'general';
    link?: string;
    createdBy?: string;
}

interface PendingAdmin {
    _id: string;
    name: string;
    email: string;
    department?: string;
    role: string;
    jobTitle?: string;
    phoneNumber?: string;
    createdAt: Date;
    permissions: any;
}

const MessagesPage = () => {
    const { t } = useLanguage();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Message>({
        title: '',
        description: '',
        icon: 'pi-bell',
        timestamp: new Date(),
        isRead: false,
        recipientRole: 'all',
        type: 'info',
        category: 'general'
    });
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<PendingAdmin | null>(null);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [rejectReason, setRejectReason] = useState('');
    const [permissions, setPermissions] = useState<any>({
        dashboard: true,
        users: false,
        admins: false,
        dataStore: false,
        analytics: false,
        settings: false,
        users_create: false,
        users_read: false,
        users_update: false,
        users_delete: false,
        dataStore_create: false,
        dataStore_read: false,
        dataStore_update: false,
        dataStore_delete: false,
        admins_create: false,
        admins_read: false,
        admins_update: false,
        admins_delete: false,
        analytics_view: false,
        analytics_export: false,
        settings_view: false,
        settings_update: false,
    });

    const categories = [
        { id: 'all', name: 'All Messages', icon: Bell, color: '#667eea' },
        { id: 'system', name: 'System Messages', icon: Settings, color: '#3b82f6' },
        { id: 'admin-permission', name: 'Admin Permissions', icon: Shield, color: '#8b5cf6' },
        { id: 'admin-request', name: 'Admin Requests', icon: UserCheck, color: '#ec4899' },
        { id: 'approval-request', name: 'Approval Requests', icon: FileCheck, color: '#f59e0b' },
        { id: 'general', name: 'General', icon: Info, color: '#10b981' }
    ];

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await fetch('/api/auth');
                const data = await safeJsonParse(response);
                if (data.authenticated && data.user) {
                    setUserRole(data.user.role);
                    // Check if user is superadmin
                    if (data.user.role !== 'superadmin') {
                        toast.error('Access denied. This page is only accessible to superadmins.');
                        router.push('/');
                    }
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error('Failed to check user role:', error);
                router.push('/');
            }
        };
        checkUserRole();
    }, [router]);

    useEffect(() => {
        // Delay to ensure authentication is ready
        const timer = setTimeout(() => {
            fetchMessages();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await authFetch('/api/messages?limit=1000');

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Unauthorized access');
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await safeJsonParse(response);

            if (data.success && data.data) {
                setMessages(data.data);
            } else {
                console.error('API response error:', data);
                if (data.error && data.error !== 'Unauthorized') {
                    toast.error(data.error || 'Failed to load messages');
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            // Only show toast if it's not an auth error
            if (error instanceof Error && !error.message.includes('401')) {
                toast.error('Failed to load messages');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMessage = () => {
        setModalMode('add');
        setFormData({
            title: '',
            description: '',
            icon: 'pi-bell',
            timestamp: new Date(),
            isRead: false,
            recipientRole: 'all',
            type: 'info',
            category: 'general'
        });
        setShowModal(true);
    };

    const handleEditMessage = (message: Message) => {
        setModalMode('edit');
        setSelectedMessage(message);
        setFormData({
            title: message.title,
            description: message.description,
            icon: message.icon,
            timestamp: message.timestamp,
            isRead: message.isRead,
            recipientId: message.recipientId,
            recipientRole: message.recipientRole,
            type: message.type,
            category: message.category,
            link: message.link
        });
        setShowModal(true);
    };

    const handleDeleteMessage = (message: Message) => {
        setModalMode('delete');
        setSelectedMessage(message);
        setShowModal(true);
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true })
            });
            const data = await response.json();

            if (data.success) {
                await fetchMessages();
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('/api/messages/mark-all-read', {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                toast.success('All messages marked as read!');
                await fetchMessages();
            } else {
                toast.error(data.error || 'Failed to mark messages as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark messages as read');
        }
    };

    const handleClearAllMessages = async () => {
        if (!confirm('Are you sure you want to delete all messages? This action cannot be undone.')) {
            return;
        }

        try {
            // Delete all messages one by one
            const deletePromises = messages.map(msg => 
                fetch(`/api/messages/${msg._id}`, { method: 'DELETE' })
            );
            
            await Promise.all(deletePromises);
            toast.success('All messages cleared successfully!');
            await fetchMessages();
        } catch (error) {
            console.error('Error clearing all messages:', error);
            toast.error('Failed to clear all messages');
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            if (modalMode === 'add') {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('Message created successfully!');
                    setShowModal(false);
                    await fetchMessages();
                } else {
                    toast.error(data.error || 'Failed to create message');
                }
            } else if (modalMode === 'edit' && selectedMessage?._id) {
                const response = await fetch(`/api/messages/${selectedMessage._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('Message updated successfully!');
                    setShowModal(false);
                    await fetchMessages();
                } else {
                    toast.error(data.error || 'Failed to update message');
                }
            } else if (modalMode === 'delete' && selectedMessage?._id) {
                const response = await fetch(`/api/messages/${selectedMessage._id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();

                if (data.success) {
                    toast.success('Message deleted successfully!');
                    setShowModal(false);
                    await fetchMessages();
                } else {
                    toast.error(data.error || 'Failed to delete message');
                }
            }
        } catch (error) {
            console.error('Error submitting:', error);
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprovalClick = async (message: Message) => {
        if (!message.createdBy) return;
        
        try {
            // Fetch admin details
            const response = await authFetch(`/api/admins/${message.createdBy}`);
            const data = await safeJsonParse(response);
            
            if (data.success && data.data) {
                setSelectedAdmin(data.data);
                setApprovalAction('approve');
                setShowApprovalModal(true);
            } else {
                toast.error('Failed to load admin details');
            }
        } catch (error) {
            console.error('Error fetching admin:', error);
            toast.error('Failed to load admin details');
        }
    };

    const handleApproveAdmin = async () => {
        if (!selectedAdmin || isSubmitting) return;

        try {
            setIsSubmitting(true);

            if (approvalAction === 'approve') {
                const response = await authFetch('/api/admins/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        adminId: selectedAdmin._id,
                        permissions,
                    }),
                });
                const data = await safeJsonParse(response);

                if (data.success) {
                    toast.success('Admin approved successfully!');
                    setShowApprovalModal(false);
                    await fetchMessages();
                } else {
                    toast.error(data.error || 'Failed to approve admin');
                }
            } else {
                const response = await authFetch('/api/admins/reject', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        adminId: selectedAdmin._id,
                        reason: rejectReason,
                    }),
                });
                const data = await safeJsonParse(response);

                if (data.success) {
                    toast.success('Admin rejected');
                    setShowApprovalModal(false);
                    setRejectReason('');
                    await fetchMessages();
                } else {
                    toast.error(data.error || 'Failed to reject admin');
                }
            }
        } catch (error) {
            console.error('Error processing approval:', error);
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMessages = useMemo(() => {
        let filtered = messages;

        if (activeCategory !== 'all') {
            filtered = filtered.filter(msg => (msg.category || 'general') === activeCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (msg) =>
                    msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    msg.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [messages, activeCategory, searchQuery]);

    const unreadCount = useMemo(() => {
        return messages.filter(m => !m.isRead).length;
    }, [messages]);

    const getCategoryStats = (categoryId: string) => {
        if (categoryId === 'all') {
            return {
                total: messages.length,
                unread: messages.filter(m => !m.isRead).length
            };
        }
        const categoryMessages = messages.filter(m => (m.category || 'general') === categoryId);
        return {
            total: categoryMessages.length,
            unread: categoryMessages.filter(m => !m.isRead).length
        };
    };

    const getMessageIcon = (type: string) => {
        if (type === 'success') return <CheckCircle className="message-type-icon success" />;
        if (type === 'error') return <AlertCircle className="message-type-icon error" />;
        if (type === 'warning') return <AlertTriangle className="message-type-icon warning" />;
        return <Info className="message-type-icon info" />;
    };

    const formatTimestamp = (timestamp: Date) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const isSuperAdmin = userRole === 'superadmin';

    return (
        <div className="messages-page">
            <Toaster position="top-right" />

            <div className="top-bar sticky-header">
                <div className="categories-scroll">
                    {categories.map((category) => {
                        const stats = getCategoryStats(category.id);
                        const CategoryIcon = category.icon;
                        return (
                            <div
                                key={category.id}
                                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                <div className="category-icon" style={{ background: category.color }}>
                                    <CategoryIcon size={24} />
                                </div>
                                <div className="category-content">
                                    <h3>{category.name}</h3>
                                    <div className="category-stats">
                                        <span className="total">{stats.total} total</span>
                                        {stats.unread > 0 && (
                                            <span className="unread">{stats.unread} unread</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="top-bar-actions">
                    <div className="search-box">
                        <i className="pi pi-search" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {filteredMessages.length > 0 && (
                        <button 
                            className="btn-clear-all" 
                            onClick={handleClearAllMessages}
                            title="Clear all messages"
                        >
                            <Trash2 size={18} />
                            <span>Clear All</span>
                        </button>
                    )}
                    {unreadCount > 0 && (
                        <button 
                            className="btn-mark-read" 
                            onClick={handleMarkAllAsRead}
                            title="Mark all as read"
                        >
                            <Check size={18} />
                            <span>Mark All Read</span>
                        </button>
                    )}
                </div>
            </div>


            <div className="messages-container">
                {isLoading ? (
                    <div className="loading-state">
                        <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
                        <p>Loading messages...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={64} />
                        <h3>No messages found</h3>
                        <p>
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : `No ${activeCategory !== 'all' ? activeCategory : ''} messages available`}
                        </p>
                    </div>
                ) : (
                    <div className="messages-grid">
                        {filteredMessages.map((message) => (
                            <div
                                key={message._id}
                                className={`message-card ${!message.isRead ? 'unread' : ''} ${message.type}`}
                            >
                                <div className="message-header">
                                    <div className="message-icon-wrapper">
                                        {getMessageIcon(message.type)}
                                    </div>
                                    <div className="message-meta">
                                        <span className="message-time">{formatTimestamp(message.timestamp)}</span>
                                        {!message.isRead && <span className="unread-badge">New</span>}
                                    </div>
                                </div>
                                <div className="message-content">
                                    <h3 className="message-title">{message.title}</h3>
                                    <p className="message-description">{message.description}</p>
                                    {message.link && (
                                        <a href={message.link} className="message-link">
                                            View Details →
                                        </a>
                                    )}
                                </div>
                                <div className="message-footer">
                                    <div className="message-badges">
                                        <span className={`category-badge ${message.category || 'general'}`}>
                                            {(message.category || 'general').replace('-', ' ')}
                                        </span>
                                        <span className={`recipient-badge ${message.recipientRole}`}>
                                            {message.recipientRole === 'all' ? 'Everyone' : message.recipientRole}
                                        </span>
                                    </div>
                                    <div className="message-actions">
                                        {message.category === 'approval-request' && isSuperAdmin && (
                                            <button
                                                className="action-btn approve"
                                                onClick={() => handleApprovalClick(message)}
                                                title="Review Request"
                                                style={{ background: '#10b981', color: 'white' }}
                                            >
                                                <ThumbsUp size={16} />
                                            </button>
                                        )}
                                        {!message.isRead && (
                                            <button
                                                className="action-btn"
                                                onClick={() => handleMarkAsRead(message._id!)}
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button
                                            className="action-btn delete"
                                            onClick={() => handleDeleteMessage(message)}
                                            title="Delete message"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
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
                            <h2>
                                {modalMode === 'add' && 'Create New Message'}
                                {modalMode === 'edit' && 'Edit Message'}
                                {modalMode === 'delete' && 'Delete Message'}
                            </h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {modalMode === 'delete' ? (
                            <div className="modal-body">
                                <div className="delete-confirmation">
                                    <AlertCircle size={48} className="warning-icon" />
                                    <p>Are you sure you want to delete this message?</p>
                                    <p className="warning-text">This action cannot be undone.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Enter message title"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter message description"
                                        rows={4}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        >
                                            <option value="info">Info</option>
                                            <option value="success">Success</option>
                                            <option value="warning">Warning</option>
                                            <option value="error">Error</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                        >
                                            <option value="general">General</option>
                                            <option value="system">System Messages</option>
                                            <option value="admin-permission">Admin Permissions</option>
                                            <option value="admin-request">Admin Requests</option>
                                            <option value="approval-request">Approval Requests</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Recipient</label>
                                    <select
                                        value={formData.recipientRole}
                                        onChange={(e) => setFormData({ ...formData, recipientRole: e.target.value as any })}
                                    >
                                        <option value="all">Everyone</option>
                                        <option value="admin">Admins Only</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Link (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.link || ''}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="Enter link URL"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button
                                className={modalMode === 'delete' ? 'btn-danger' : 'btn-primary'}
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="pi pi-spin pi-spinner" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {modalMode === 'add' && 'Create Message'}
                                        {modalMode === 'edit' && 'Update Message'}
                                        {modalMode === 'delete' && 'Delete Message'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showApprovalModal && selectedAdmin && (
                <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>
                                {approvalAction === 'approve' ? 'Approve Admin Request' : 'Reject Admin Request'}
                            </h2>
                            <button className="close-btn" onClick={() => setShowApprovalModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <h3 style={{ marginBottom: '0.5rem', fontSize: '18px' }}>Admin Details</h3>
                                <p><strong>Name:</strong> {selectedAdmin.name}</p>
                                <p><strong>Email:</strong> {selectedAdmin.email}</p>
                                <p><strong>Department:</strong> {selectedAdmin.department || 'N/A'}</p>
                                <p><strong>Role:</strong> {selectedAdmin.role}</p>
                                <p><strong>Job Title:</strong> {selectedAdmin.jobTitle || 'N/A'}</p>
                                {selectedAdmin.phoneNumber && <p><strong>Phone:</strong> {selectedAdmin.phoneNumber}</p>}
                            </div>

                            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setApprovalAction('approve')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: approvalAction === 'approve' ? '#10b981' : '#e5e7eb',
                                        color: approvalAction === 'approve' ? 'white' : '#374151',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <ThumbsUp size={18} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => setApprovalAction('reject')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: approvalAction === 'reject' ? '#ef4444' : '#e5e7eb',
                                        color: approvalAction === 'reject' ? 'white' : '#374151',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <ThumbsDown size={18} />
                                    Reject
                                </button>
                            </div>

                            {approvalAction === 'approve' ? (
                                <div>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}>Assign Permissions</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                        {Object.keys(permissions).map((key) => (
                                            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={permissions[key]}
                                                    onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '14px' }}>{key.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Rejection Reason *</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Provide a reason for rejection..."
                                        rows={4}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowApprovalModal(false)} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button
                                className={approvalAction === 'approve' ? 'btn-primary' : 'btn-danger'}
                                onClick={handleApproveAdmin}
                                disabled={isSubmitting || (approvalAction === 'reject' && !rejectReason)}
                                style={{
                                    background: approvalAction === 'approve' ? '#10b981' : '#ef4444',
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="pi pi-spin pi-spinner" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {approvalAction === 'approve' ? 'Approve Admin' : 'Reject Admin'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
