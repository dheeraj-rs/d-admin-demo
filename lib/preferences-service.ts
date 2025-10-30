import { connectDB } from './mongodb';
import Account from '../models/Account';

export interface UserPreferencesData {
    theme?: {
        name?: string;
        primaryColor?: string;
        secondaryColor?: string;
        darkMode?: boolean;
        customCSS?: string;
    };
    language?: {
        code?: string;
        direction?: 'ltr' | 'rtl';
        dateFormat?: string;
        timeFormat?: '12h' | '24h';
    };
    layout?: {
        sidebarCollapsed?: boolean;
        sidebarWidth?: number;
        headerHeight?: number;
        footerVisible?: boolean;
        breadcrumbsVisible?: boolean;
        gridSize?: 'small' | 'medium' | 'large';
    };
    websiteBuilder?: {
        defaultTemplate?: string;
        autoSave?: boolean;
        showGrid?: boolean;
        snapToGrid?: boolean;
        gridSize?: number;
        zoomLevel?: number;
    };
    dashboard?: {
        defaultView?: 'grid' | 'list' | 'table';
        itemsPerPage?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        filters?: Record<string, any>;
    };
    notifications?: {
        email?: boolean;
        push?: boolean;
        browser?: boolean;
        frequency?: 'immediate' | 'daily' | 'weekly';
        types?: string[];
    };
    privacy?: {
        analytics?: boolean;
        cookies?: boolean;
        tracking?: boolean;
        dataSharing?: boolean;
    };
}

/**
 * Get user preferences by userId (accountId)
 */
export async function getUserPreferences(userId?: string, sessionId?: string, adminId?: string): Promise<UserPreferencesData | null> {
    try {
        await connectDB();

        if (!userId) {
            return getDefaultPreferences();
        }

        // Get account and return embedded preferences
        const account = await Account.findById(userId);
        
        if (!account) {
            return getDefaultPreferences();
        }

        // Return preferences from account or default
        return (account as any).preferences || getDefaultPreferences();
    } catch (error) {
        console.error('Error getting user preferences:', error);
        return null;
    }
}

/**
 * Save or update user preferences
 */
export async function saveUserPreferences(
    preferencesData: UserPreferencesData,
    userId?: string,
    sessionId?: string,
    adminId?: string
): Promise<UserPreferencesData | null> {
    try {
        await connectDB();

        if (!userId) {
            return null;
        }

        // Update account with new preferences
        const account = await Account.findByIdAndUpdate(
            userId,
            { $set: { preferences: preferencesData } },
            { new: true }
        );

        if (!account) {
            return null;
        }

        return (account as any).preferences || preferencesData;
    } catch (error) {
        console.error('Error saving user preferences:', error);
        return null;
    }
}

/**
 * Get default preferences for new users
 */
export function getDefaultPreferences(): UserPreferencesData {
    return {
        theme: {
            name: 'lara-light-indigo',
            primaryColor: '#3B82F6',
            secondaryColor: '#6B7280',
            darkMode: false,
        },
        language: {
            code: 'en',
            direction: 'ltr',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
        },
        layout: {
            sidebarCollapsed: false,
            sidebarWidth: 250,
            headerHeight: 60,
            footerVisible: true,
            breadcrumbsVisible: true,
            gridSize: 'medium',
        },
        websiteBuilder: {
            defaultTemplate: 'blank',
            autoSave: true,
            showGrid: true,
            snapToGrid: true,
            gridSize: 20,
            zoomLevel: 100,
        },
        dashboard: {
            defaultView: 'grid',
            itemsPerPage: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            filters: {},
        },
        notifications: {
            email: true,
            push: false,
            browser: true,
            frequency: 'immediate',
            types: ['system', 'updates'],
        },
        privacy: {
            analytics: true,
            cookies: true,
            tracking: false,
            dataSharing: false,
        },
    };
}

/**
 * Merge user preferences with defaults
 */
export function mergeWithDefaults(userPreferences: Partial<UserPreferencesData>): UserPreferencesData {
    const defaults = getDefaultPreferences();

    return {
        theme: { ...defaults.theme, ...userPreferences.theme },
        language: { ...defaults.language, ...userPreferences.language },
        layout: { ...defaults.layout, ...userPreferences.layout },
        websiteBuilder: { ...defaults.websiteBuilder, ...userPreferences.websiteBuilder },
        dashboard: { ...defaults.dashboard, ...userPreferences.dashboard },
        notifications: { ...defaults.notifications, ...userPreferences.notifications },
        privacy: { ...defaults.privacy, ...userPreferences.privacy },
    };
}

/**
 * Generate session ID for anonymous users
 */
export function generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Clean up old anonymous sessions (older than 30 days)
 * Note: With new architecture, preferences are embedded in Account model
 * This function is kept for backward compatibility but does nothing
 */
export async function cleanupOldSessions(): Promise<void> {
    try {
        // No-op: Preferences are now embedded in Account model
        console.log('✅ Cleanup not needed - preferences embedded in Account model');
    } catch (error) {
        console.error('Error cleaning up old sessions:', error);
    }
}
