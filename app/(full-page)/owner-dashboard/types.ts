export interface User {
    _id: string;
    username?: string;
    email: string;
    name?: string;
    role?: string;
    plan?: 'free' | 'pro' | 'max';
    isActive: boolean;
    isApproved?: boolean;
    organizationName?: string;
    organizationKey?: string;
    createdAt?: string;
    profilePicture?: string;
}

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    priority: 'urgent' | 'high' | 'normal';
    isRead: boolean;
    readAt?: string;
    actionRequired?: boolean;
    createdAt: string;
    relatedUser?: {
        name: string;
        email: string;
        role: string;
    };
}

export interface BackupKey {
    key: string;
    generatedAt: string;
    used?: boolean;
}

export interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export type ActiveTab = 'admins' | 'accounts' | 'notifications' | 'settings' | 'plans' | 'active' | 'pending' | 'inactive';
export type NotificationFilter = 'all' | 'unread' | 'action_required';
