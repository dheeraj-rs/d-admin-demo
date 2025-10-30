import { connectDB } from './mongodb';
import OwnerNotification from '../models/OwnerNotification';

interface CreateNotificationParams {
    type: 'invite_sent' | 'registration' | 'approval_request' | 'message' | 'status_change' | 'system';
    title: string;
    message: string;
    relatedUser?: {
        id: string;
        name: string;
        email: string;
        role: 'superadmin' | 'admin' | 'user';
    };
    metadata?: any;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    actionRequired?: boolean;
    actionUrl?: string;
}

export async function createOwnerNotification(params: CreateNotificationParams) {
    try {
        await connectDB();
        console.log('📝 Creating notification:', params.type, '-', params.title);

        const notification = await OwnerNotification.create({
            type: params.type,
            title: params.title,
            message: params.message,
            relatedUser: params.relatedUser,
            metadata: params.metadata || {},
            isRead: false,
            priority: params.priority || 'medium',
            actionRequired: params.actionRequired || false,
            actionUrl: params.actionUrl,
        });

        console.log('✅ Notification created successfully:', {
            id: notification._id,
            type: notification.type,
            title: notification.title,
            priority: notification.priority
        });
        return notification;
    } catch (error: any) {
        console.error('❌ Error creating notification:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            params: params
        });
        return null;
    }
}
