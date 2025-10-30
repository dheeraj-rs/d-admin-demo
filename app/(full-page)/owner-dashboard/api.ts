import toast from 'react-hot-toast';
import { User } from './types';

export const loadUsers = async () => {
    const res = await fetch('/api/owner/users');
    const data = await res.json();
    return data;
};

export const loadNotifications = async () => {
    const res = await fetch('/api/owner/notifications');
    const data = await res.json();
    return data;
};

export const loadSettings = async () => {
    const res = await fetch('/api/owner/settings');
    const data = await res.json();
    return data;
};

export const loadPasswordSettings = async () => {
    const res = await fetch('/api/owner/password-settings');
    const data = await res.json();
    return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
    const res = await fetch(`/api/owner/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
    });
    return res.ok;
};

export const markAllNotificationsAsRead = async () => {
    const res = await fetch('/api/owner/notifications/mark-all-read', {
        method: 'POST',
    });
    return res.ok;
};

export const deleteNotification = async (notificationId: string) => {
    const res = await fetch(`/api/owner/notifications/${notificationId}`, {
        method: 'DELETE',
    });
    return res.ok;
};

export const generateBackupKey = async () => {
    toast.loading('Clearing old keys and generating 6 new ones...', { id: 'backup-key' });
    const res = await fetch('/api/owner/settings/generate-backup-key', {
        method: 'POST',
    });
    const data = await res.json();
    toast.dismiss('backup-key');
    return data;
};

export const toggleTwoFactor = async (enabled: boolean) => {
    toast.loading('Updating two-factor authentication...', { id: '2fa' });
    const res = await fetch('/api/owner/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: enabled }),
    });
    const data = await res.json();
    toast.dismiss('2fa');
    return data;
};

export const manageUser = async (userId: string, action: string, collection: string) => {
    const res = await fetch('/api/owner/manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, collection }),
    });
    return await res.json();
};

export const inviteSuperAdmin = async (email: string) => {
    toast.loading('Sending invitation...', { id: 'invite' });
    const res = await fetch('/api/owner/invite-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    toast.dismiss('invite');
    return data;
};

export const generateAccessToken = async (superAdminId: string, ownerEmail: string) => {
    const res = await fetch('/api/owner/generate-access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            superAdminId,
            ownerEmail,
            accessMode: 'emergency',
            oneTimeUse: true,
            maxUses: 1,
            expiryDays: 7,
        }),
    });
    return await res.json();
};

export const validateAccessToken = async (token: string) => {
    const res = await fetch('/api/owner/validate-access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    return await res.json();
};
