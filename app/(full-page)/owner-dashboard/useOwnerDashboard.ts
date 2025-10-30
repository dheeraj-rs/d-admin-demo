import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getOwnerSession, clearOwnerSession } from '../../../lib/ownerAuth';
import { User, Notification, BackupKey, ConfirmModalState, ActiveTab, NotificationFilter } from './types';
import * as api from './api';

export const useOwnerDashboard = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [superadmins, setSuperadmins] = useState<User[]>([]);
    const [admins, setAdmins] = useState<User[]>([]);
    const [ownerInfo, setOwnerInfo] = useState<any>(null);
    const [selectedSuperAdmin, setSelectedSuperAdmin] = useState<User | null>(null);
    const [superAdminChildren, setSuperAdminChildren] = useState<{ admins: User[]; users: User[] }>({ admins: [], users: [] });
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<ActiveTab>('admins');
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>('all');
    const [notificationTypeFilter, setNotificationTypeFilter] = useState<string>('all');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [backupKeys, setBackupKeys] = useState<BackupKey[]>([]);
    const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
    const [mobileSettingsExpanded, setMobileSettingsExpanded] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [passwordRequired, setPasswordRequired] = useState(true);
    const [hasPassword, setHasPassword] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Initial load
    useEffect(() => {
        const session = getOwnerSession();
        setOwnerInfo(session);
        setOwnerEmail(session?.email || '');
        setOwnerName(session?.name || '');
        loadUsersData();
    }, []);

    // Load data based on active tab
    useEffect(() => {
        if (activeTab === 'notifications') {
            loadNotificationsData();
        } else if (activeTab === 'settings') {
            loadSettingsData();
        }
    }, [activeTab]);

    const loadSuperAdminChildrenData = useCallback(
        (orgKey: string) => {
            const orgAdmins = admins.filter((admin) => admin.organizationKey === orgKey);
            const orgUsers = users.filter((user) => {
                const userOrgKey = (user as any).organizationKey || user.role;
                return userOrgKey === orgKey;
            });
            setSuperAdminChildren({ admins: orgAdmins, users: orgUsers });
        },
        [admins, users]
    );

    // Reload children when admins/users data changes
    useEffect(() => {
        if (selectedSuperAdmin && selectedSuperAdmin.organizationKey) {
            loadSuperAdminChildrenData(selectedSuperAdmin.organizationKey);
        }
    }, [admins, users, selectedSuperAdmin, loadSuperAdminChildrenData]);

    const loadUsersData = async () => {
        try {
            const data = await api.loadUsers();
            if (data.success) {
                setUsers(data.data.users || []);
                setSuperadmins(data.data.superadmins || []);
                setAdmins(data.data.admins || []);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNotificationsData = async () => {
        try {
            const data = await api.loadNotifications();
            if (data.success) {
                setNotifications(data.data || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('Failed to load notifications');
        }
    };

    const loadSettingsData = async () => {
        try {
            const data = await api.loadSettings();
            if (data.success) {
                setBackupKeys(data.data.backupKeys || []);
                setTwoFactorEnabled(data.data.twoFactorEnabled || false);
            }

            // Load password settings
            const passwordData = await api.loadPasswordSettings();
            if (passwordData.success) {
                setPasswordRequired(passwordData.data.passwordRequired);
                setHasPassword(passwordData.data.hasPassword);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleAction = (userId: string, action: string, collection: string, userName: string = 'User') => {
        setConfirmModal({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            message: `Are you sure you want to ${action} ${userName}?`,
            type: action === 'delete' ? 'danger' : action === 'activate' ? 'success' : 'warning',
            onConfirm: () => performAction(userId, action, collection, userName),
        });
    };

    const performAction = async (userId: string, action: string, collection: string, userName: string) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ing user...`, { id: 'action' });

        try {
            const data = await api.manageUser(userId, action, collection);
            toast.dismiss('action');

            if (data.success) {
                if (data.requiresApproval) {
                    toast.success(`📧 ${data.message || 'Approval email sent!'}`, { duration: 6000 });
                } else {
                    toast.success(`✅ ${userName} ${action}ed successfully!`);
                }

                await loadUsersData();

                if (selectedSuperAdmin && collection === 'superadmins') {
                    const updatedSuperAdmin = superadmins.find((sa) => sa._id === userId);
                    if (updatedSuperAdmin) {
                        setSelectedSuperAdmin(updatedSuperAdmin);
                    }
                } else if (selectedSuperAdmin) {
                    loadSuperAdminChildrenData(selectedSuperAdmin.organizationKey || '');
                }
            } else {
                toast.error(data.error || '❌ Action failed');
            }
        } catch (error) {
            console.error('Error managing user:', error);
            toast.dismiss('action');
            toast.error('❌ Failed to perform action');
        }
    };

    const handleSuperAdminClick = (superAdmin: User) => {
        if (selectedSuperAdmin?._id === superAdmin._id) {
            setSelectedSuperAdmin(null);
            setSuperAdminChildren({ admins: [], users: [] });
        } else {
            setSelectedSuperAdmin(superAdmin);
            loadSuperAdminChildrenData(superAdmin.organizationKey || '');
        }
    };

    const handleLogout = async () => {
        if (loggingOut) return;

        try {
            setLoggingOut(true);
            toast.loading('Logging out...', { id: 'logout' });
            const success = await clearOwnerSession();
            toast.dismiss('logout');

            if (success) {
                toast.success('Logged out successfully!', { duration: 2000 });
                router.push('/');
            } else {
                toast.error('Logout failed. Please try again.');
                setLoggingOut(false);
            }
        } catch (error) {
            toast.dismiss('logout');
            toast.error('An error occurred during logout');
            console.error('Logout error:', error);
            setLoggingOut(false);
        }
    };

    const handleInviteSuperAdmin = async (email: string) => {
        try {
            const data = await api.inviteSuperAdmin(email);
            if (data.success) {
                toast.success(`✅ Invitation Sent! Email sent to ${email}`, { duration: 5000 });
            } else {
                toast.error(data.error || '❌ Failed to send invitation');
                throw new Error(data.error || 'Failed to send invitation');
            }
        } catch (error: any) {
            console.error('Error sending invite:', error);
            if (!error.message.includes('Failed to send invitation')) {
                toast.error('❌ Failed to send invitation');
            }
            throw error;
        }
    };

    const handleDirectAccess = (superAdmin: User) => {
        setConfirmModal({
            isOpen: true,
            title: '🔐 Direct Access',
            message: `You will be logged in as: ${
                superAdmin.name || superAdmin.email
            }\n\nThis will:\n• Log you out as owner\n• Log you in as this Super Admin\n• Give you full Super Admin access\n\nContinue?`,
            type: 'warning',
            onConfirm: () => performDirectAccess(superAdmin),
        });
    };

    const performDirectAccess = async (superAdmin: User) => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        toast.loading('Accessing Super Admin account...', { id: 'direct-access' });

        try {
            const data = await api.generateAccessToken(superAdmin._id, ownerInfo?.email || 'owner');
            toast.dismiss('direct-access');

            if (data.success) {
                const token = data.data.token;
                const validateData = await api.validateAccessToken(token);

                if (validateData.success) {
                    const userData = validateData.user || validateData.data.user;

                    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

                    const userDataForStorage = {
                        id: userData.id || userData.userId,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role,
                        organizationKey: userData.organizationKey,
                        organizationName: userData.organizationName,
                        profilePicture: userData.profilePicture,
                    };

                    localStorage.setItem('user', JSON.stringify(userDataForStorage));
                    localStorage.setItem('superadmin_data', JSON.stringify(userDataForStorage));
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userRole', 'superadmin');

                    clearOwnerSession();
                    toast.success(`✅ Now logged in as ${userData.name}!`);

                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 1000);
                } else {
                    toast.error('❌ Failed to access account');
                }
            } else {
                toast.error(data.error || '❌ Failed to generate access');
            }
        } catch (error) {
            console.error('Error accessing account:', error);
            toast.dismiss('direct-access');
            toast.error('❌ Failed to access account');
        }
    };

    const handleGenerateAccessLink = async (superAdmin: User) => {
        toast.loading('Generating emergency access link...', { id: 'access-link' });

        try {
            const data = await api.generateAccessToken(superAdmin._id, ownerInfo?.email || 'owner');
            toast.dismiss('access-link');

            if (data.success) {
                const accessUrl = data.data.accessUrl;
                await navigator.clipboard.writeText(accessUrl);

                toast.success(
                    `✅ Emergency Access Link Generated! 🚨 One-time use only - Link copied to clipboard. Expires: ${new Date(
                        data.data.expiresAt
                    ).toLocaleString()}`,
                    { duration: 6000 }
                );

                setTimeout(() => {
                    const showLink = confirm(
                        `🚨 EMERGENCY ACCESS LINK GENERATED\n\n` +
                            `For: ${superAdmin.name || superAdmin.email}\n` +
                            `Organization: ${superAdmin.organizationName || 'N/A'}\n\n` +
                            `Link: ${accessUrl}\n\n` +
                            `⚠️ IMPORTANT:\n` +
                            `• ONE-TIME USE ONLY\n` +
                            `• Logs in Super Admin without credentials\n` +
                            `• Use only in emergency situations\n` +
                            `• Expires: ${new Date(data.data.expiresAt).toLocaleString()}\n\n` +
                            `The link has been copied to your clipboard.\n` +
                            `Click OK to view it again, or Cancel to close.`
                    );

                    if (showLink) {
                        prompt('🚨 Emergency Access Link (Ctrl+C to copy):', accessUrl);
                    }
                }, 500);
            } else {
                toast.error(data.error || '❌ Failed to generate access link');
            }
        } catch (error) {
            console.error('Error generating access link:', error);
            toast.dismiss('access-link');
            toast.error('❌ Failed to generate access link');
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const success = await api.markNotificationAsRead(notificationId);
            if (success) {
                setNotifications(notifications.map((n) => (n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const success = await api.markAllNotificationsAsRead();
            if (success) {
                setNotifications(notifications.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
                toast.success('All notifications marked as read');
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotificationHandler = async (notificationId: string) => {
        try {
            const success = await api.deleteNotification(notificationId);
            if (success) {
                setNotifications(notifications.filter((n) => n._id !== notificationId));
                toast.success('Notification deleted');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleGenerateBackupKey = async () => {
        try {
            const data = await api.generateBackupKey();
            if (data.success) {
                const keysText = data.data.keys.join(' ');
                toast.success(`6 New backup keys generated! ${keysText}`, { duration: 12000 });
                loadSettingsData();
            } else {
                toast.error(data.error || 'Failed to generate backup keys');
            }
        } catch (error) {
            toast.error('Failed to generate backup keys');
        }
    };

    const handleToggleTwoFactor = async () => {
        try {
            const newValue = !twoFactorEnabled;
            const data = await api.toggleTwoFactor(newValue);
            if (data.success) {
                setTwoFactorEnabled(newValue);
                toast.success(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'}!`);
            } else {
                toast.error(data.error || 'Failed to update setting');
            }
        } catch (error) {
            toast.error('Failed to update two-factor authentication');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const filteredSuperAdmins = superadmins.filter(
        (sa) =>
            sa.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sa.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sa.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        loading,
        users,
        superadmins,
        admins,
        ownerInfo,
        selectedSuperAdmin,
        superAdminChildren,
        searchQuery,
        activeTab,
        confirmModal,
        inviteModalOpen,
        notifications,
        notificationFilter,
        notificationTypeFilter,
        ownerEmail,
        ownerName,
        backupKeys,
        showKeys,
        mobileSettingsExpanded,
        twoFactorEnabled,
        loggingOut,
        passwordRequired,
        hasPassword,
        filteredSuperAdmins,
        setSearchQuery,
        setActiveTab,
        setConfirmModal,
        setInviteModalOpen,
        setNotificationFilter,
        setNotificationTypeFilter,
        setShowKeys,
        setMobileSettingsExpanded,
        setSelectedSuperAdmin,
        setSuperAdminChildren,
        handleAction,
        handleSuperAdminClick,
        handleLogout,
        handleInviteSuperAdmin,
        handleDirectAccess,
        handleGenerateAccessLink,
        markAsRead,
        markAllAsRead,
        deleteNotification: deleteNotificationHandler,
        handleGenerateBackupKey,
        handleToggleTwoFactor,
        handleTogglePasswordRequired: async (password: string) => {
            try {
                const response = await fetch('/api/owner/password-settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        passwordRequired: !passwordRequired,
                        verificationPassword: password,
                    }),
                });
                const data = await response.json();
                if (data.success) {
                    setPasswordRequired(data.data.passwordRequired);
                    toast.success(`Password requirement ${data.data.passwordRequired ? 'enabled' : 'disabled'}`);
                } else {
                    throw new Error(data.error);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to update password requirement');
                throw error;
            }
        },
        handleSetPassword: async (currentPassword: string, newPassword: string) => {
            try {
                const response = await fetch('/api/owner/password-settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword }),
                });
                const data = await response.json();
                if (data.success) {
                    setHasPassword(true);
                    setPasswordRequired(true);
                    return data;
                } else {
                    throw new Error(data.error);
                }
            } catch (error: any) {
                throw error;
            }
        },
        copyToClipboard,
    };
};
