'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPreferencesData } from '../lib/preferences-service';

interface UseUserPreferencesReturn {
    preferences: UserPreferencesData | null;
    loading: boolean;
    error: string | null;
    updatePreferences: (newPreferences: Partial<UserPreferencesData>) => Promise<void>;
    resetToDefaults: () => Promise<void>;
    savePreferences: () => Promise<void>;
}

export function useUserPreferences(userId?: string, sessionId?: string, superAdminId?: string): UseUserPreferencesReturn {
    const [preferences, setPreferences] = useState<UserPreferencesData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPreferences = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters for GET request
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (sessionId) params.append('sessionId', sessionId);
            if (superAdminId) params.append('superAdminId', superAdminId);

            const url = `/api/user/preferences${params.toString() ? `?${params.toString()}` : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.warn('Failed to load preferences from server, using defaults');
                // Set default preferences instead of throwing error
                setPreferences(null);
                setError('Using default preferences');
                return;
            }

            const data = await response.json();
            setPreferences(data.preferences);
        } catch (err) {
            console.error('Error loading preferences:', err);
            // Set default preferences on error instead of breaking the app
            setPreferences(null);
            setError(err instanceof Error ? err.message : 'Using default preferences');
        } finally {
            setLoading(false);
        }
    }, [userId, sessionId, superAdminId]);

    const updatePreferences = useCallback(
        async (newPreferences: Partial<UserPreferencesData>) => {
            try {
                setError(null);

                // Update local state immediately for better UX
                setPreferences(
                    (prev) =>
                        ({
                            ...prev,
                            ...newPreferences,
                        } as UserPreferencesData)
                );

                // Save to server
                const response = await fetch('/api/user/preferences', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        sessionId,
                        superAdminId,
                        preferences: newPreferences,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save preferences');
                }

                const data = await response.json();
                setPreferences(data.preferences);
            } catch (err) {
                console.error('Error updating preferences:', err);
                setError(err instanceof Error ? err.message : 'Failed to update preferences');
            }
        },
        [userId, sessionId, superAdminId]
    );

    const resetToDefaults = useCallback(async () => {
        try {
            setError(null);

            const response = await fetch('/api/user/preferences/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, sessionId, superAdminId }),
            });

            if (!response.ok) {
                throw new Error('Failed to reset preferences');
            }

            const data = await response.json();
            setPreferences(data.preferences);
        } catch (err) {
            console.error('Error resetting preferences:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset preferences');
        }
    }, [userId, sessionId, superAdminId]);

    const savePreferences = useCallback(async () => {
        if (!preferences) return;

        try {
            setError(null);

            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    sessionId,
                    superAdminId,
                    preferences,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save preferences');
            }

            const data = await response.json();
            setPreferences(data.preferences);
        } catch (err) {
            console.error('Error saving preferences:', err);
            setError(err instanceof Error ? err.message : 'Failed to save preferences');
        }
    }, [preferences, userId, sessionId, superAdminId]);

    useEffect(() => {
        loadPreferences();
    }, [loadPreferences]);

    return {
        preferences,
        loading,
        error,
        updatePreferences,
        resetToDefaults,
        savePreferences,
    };
}
