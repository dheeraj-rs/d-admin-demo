'use client';

import {
    Bell,
    Check,
    Trash2,
    Mail,
    UserPlus,
    UserCheck,
    MessageSquare,
    Activity,
    Crown,
    Shield,
    Users,
} from 'lucide-react';
import { Notification, NotificationFilter } from '../types';

interface NotificationsSectionProps {
    notifications: Notification[];
    notificationFilter: NotificationFilter;
    setNotificationFilter: (filter: NotificationFilter) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (notificationId: string) => void;
}

export const NotificationsSection = ({
    notifications,
    notificationFilter,
    setNotificationFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
}: NotificationsSectionProps) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filteredNotifications = notifications.filter(n => {
        if (notificationFilter === 'unread' && n.isRead) return false;
        if (notificationFilter === 'action_required' && !n.actionRequired) return false;
        return true;
    });

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </h2>
                <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    style={{
                        background: unreadCount === 0 ? 'var(--surface-border)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: unreadCount === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        opacity: unreadCount === 0 ? 0.5 : 1,
                    }}
                >
                    <Check size={14} />
                    Mark All Read
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {(['all', 'unread', 'action_required'] as NotificationFilter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setNotificationFilter(f)}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            border: '1px solid var(--surface-border)',
                            background: notificationFilter === f ? 'var(--primary-color)' : 'transparent',
                            color: notificationFilter === f ? 'white' : 'var(--text-color)',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="empty-state">
                    <Bell size={64} style={{ opacity: 0.3 }} />
                    <div className="empty-message">No Notifications</div>
                    <div className="empty-suggestion">
                        {notificationFilter === 'all' ? 'You have no notifications yet.' : `No ${notificationFilter.replace('_', ' ')} notifications.`}
                    </div>
                </div>
            ) : (
                <div className="emails-list">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                            className="email-item"
                            style={{
                                background: notification.isRead ? 'var(--surface-card)' : 'var(--surface-ground)',
                                cursor: 'pointer',
                            }}
                        >
                            <div className="email-row">
                                <div className="email-icon" style={{
                                    background: `${notification.priority === 'urgent' ? '#ef4444' : notification.priority === 'high' ? '#f59e0b' : '#3b82f6'}15`,
                                    color: notification.priority === 'urgent' ? '#ef4444' : notification.priority === 'high' ? '#f59e0b' : '#3b82f6',
                                }}>
                                    {notification.type === 'invite_sent' ? <Mail className="icon" /> :
                                        notification.type === 'registration' ? <UserPlus className="icon" /> :
                                            notification.type === 'approval_request' ? <UserCheck className="icon" /> :
                                                notification.type === 'message' ? <MessageSquare className="icon" /> :
                                                    notification.type === 'status_change' ? <Activity className="icon" /> :
                                                        <Bell className="icon" />}
                                </div>
                                <div className="email-content">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{notification.title}</span>
                                        {!notification.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />}
                                        {notification.actionRequired && (
                                            <span style={{ padding: '2px 6px', borderRadius: '10px', background: '#f59e0b', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                                                ACTION
                                            </span>
                                        )}
                                    </div>
                                    <div className="email-category" style={{ marginTop: '4px' }}>
                                        <span style={{ fontSize: '13px' }}>{notification.message}</span>
                                    </div>
                                    {notification.relatedUser && (
                                        <div className="email-category">
                                            {notification.relatedUser.role === 'superadmin' ? <Crown size={12} /> :
                                                notification.relatedUser.role === 'admin' ? <Shield size={12} /> :
                                                    <Users size={12} />}
                                            <span style={{ fontWeight: 500 }}>{notification.relatedUser.name}</span>
                                            <span>• {notification.relatedUser.email}</span>
                                        </div>
                                    )}
                                    <div className="email-category" style={{ fontSize: '11px', opacity: 0.7 }}>
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="copy-buttons">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification._id);
                                    }}
                                    className="copy-btn delete-btn"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
