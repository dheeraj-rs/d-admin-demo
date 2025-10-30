'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { UserPreferencesData } from '../../lib/preferences-service';

interface PreferencesContextType {
    preferences: UserPreferencesData | null;
    loading: boolean;
    error: string | null;
    updatePreferences: (newPreferences: Partial<UserPreferencesData>) => Promise<void>;
    resetToDefaults: () => Promise<void>;
    savePreferences: () => Promise<void>;
    // Quick access methods
    setTheme: (theme: Partial<UserPreferencesData['theme']>) => Promise<void>;
    setLanguage: (language: Partial<UserPreferencesData['language']>) => Promise<void>;
    setLayout: (layout: Partial<UserPreferencesData['layout']>) => Promise<void>;
    setWebsiteBuilder: (websiteBuilder: Partial<UserPreferencesData['websiteBuilder']>) => Promise<void>;
    setDashboard: (dashboard: Partial<UserPreferencesData['dashboard']>) => Promise<void>;
    setNotifications: (notifications: Partial<UserPreferencesData['notifications']>) => Promise<void>;
    setPrivacy: (privacy: Partial<UserPreferencesData['privacy']>) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

interface PreferencesProviderProps {
    children: React.ReactNode;
    userId?: string;
    sessionId?: string;
    superAdminId?: string;
}

export function PreferencesProvider({
    children,
    userId,
    sessionId,
    superAdminId
}: PreferencesProviderProps) {
    const [currentSessionId, setCurrentSessionId] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
    const [currentSuperAdminId, setCurrentSuperAdminId] = useState<string | undefined>(superAdminId);

    // Get session ID for anonymous users
    useEffect(() => {
        // Skip for owner pages - they don't need preferences
        if (typeof window !== 'undefined' && window.location.pathname.includes('/owner-')) {
            return;
        }

        if (!userId && !sessionId) {
            // Generate session ID for anonymous users
            const session = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
            setCurrentSessionId(session);
        } else {
            setCurrentSessionId(sessionId || '');
        }
    }, [userId, sessionId]);

    // Update user info when authentication changes
    useEffect(() => {
        setCurrentUserId(userId);
        setCurrentSuperAdminId(superAdminId);
    }, [userId, superAdminId]);

    const {
        preferences,
        loading,
        error,
        updatePreferences,
        resetToDefaults,
        savePreferences
    } = useUserPreferences(currentUserId, currentSessionId, currentSuperAdminId);

    // Quick access methods for common operations
    const setTheme = async (theme: Partial<UserPreferencesData['theme']>) => {
        await updatePreferences({ theme });
    };

    const setLanguage = async (language: Partial<UserPreferencesData['language']>) => {
        await updatePreferences({ language });
    };

    const setLayout = async (layout: Partial<UserPreferencesData['layout']>) => {
        await updatePreferences({ layout });
    };

    const setWebsiteBuilder = async (websiteBuilder: Partial<UserPreferencesData['websiteBuilder']>) => {
        await updatePreferences({ websiteBuilder });
    };

    const setDashboard = async (dashboard: Partial<UserPreferencesData['dashboard']>) => {
        await updatePreferences({ dashboard });
    };

    const setNotifications = async (notifications: Partial<UserPreferencesData['notifications']>) => {
        await updatePreferences({ notifications });
    };

    const setPrivacy = async (privacy: Partial<UserPreferencesData['privacy']>) => {
        await updatePreferences({ privacy });
    };

    const value: PreferencesContextType = {
        preferences,
        loading,
        error,
        updatePreferences,
        resetToDefaults,
        savePreferences,
        setTheme,
        setLanguage,
        setLayout,
        setWebsiteBuilder,
        setDashboard,
        setNotifications,
        setPrivacy
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}

// Default export for the component
export default PreferencesProvider;
