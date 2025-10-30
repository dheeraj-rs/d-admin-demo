'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPlanAuthData, setPlanAuthData, clearPlanAuthData, PlanAuthPayload } from '../lib/plan-auth';
import { performLogout } from '../lib/auth-logout';

interface UsePlanAuthReturn {
    authData: PlanAuthPayload | null;
    loading: boolean;
    error: string | null;
    login: (authData: PlanAuthPayload) => void;
    logout: () => void;
    refresh: () => Promise<void>;
    canAccessFeature: (feature: string) => boolean;
    isPlanActive: () => boolean;
}

export function usePlanAuth(): UsePlanAuthReturn {
    const [authData, setAuthData] = useState<PlanAuthPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadAuthData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get auth data from cookie
            const data = getPlanAuthData();

            if (!data) {
                setAuthData(null);
                return;
            }

            // Verify with server
            const response = await fetch('/api/auth/plan', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token is invalid, clear local data
                    clearPlanAuthData();
                    setAuthData(null);
                } else {
                    throw new Error('Failed to verify authentication');
                }
                return;
            }

            const result = await response.json();
            if (result.success) {
                // Update local auth data with server response
                const updatedAuthData: PlanAuthPayload = {
                    userId: result.account.id,
                    email: result.account.email,
                    name: result.account.name,
                    role: 'user',
                    superAdminId: data.superAdminId,
                    organizationKey: data.organizationKey || '',
                    plan: result.account.plan,
                    features: result.account.features,
                    isPlanActive: result.account.isPlanActive,
                    planEndDate: result.account.planEndDate ? new Date(result.account.planEndDate).getTime() : undefined,
                };

                setAuthData(updatedAuthData);
                setPlanAuthData(updatedAuthData);
            } else {
                throw new Error(result.error || 'Authentication verification failed');
            }
        } catch (err) {
            console.error('Auth data loading error:', err);
            setError(err instanceof Error ? err.message : 'Authentication failed');
            clearPlanAuthData();
            setAuthData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback((newAuthData: PlanAuthPayload) => {
        setAuthData(newAuthData);
        setPlanAuthData(newAuthData);
        setError(null);
    }, []);

    const logout = useCallback(() => {
        // Use comprehensive logout to clear ALL auth data
        performLogout();
        setAuthData(null);
        setError(null);
    }, []);

    const refresh = useCallback(async () => {
        await loadAuthData();
    }, [loadAuthData]);

    const canAccessFeature = useCallback(
        (feature: string): boolean => {
            if (!authData) return false;
            return authData.features.includes('*') || authData.features.includes(feature);
        },
        [authData]
    );

    const isPlanActive = useCallback((): boolean => {
        if (!authData) return false;
        if (!authData.isPlanActive) return false;
        if (authData.plan === 'FREE') return true;
        if (!authData.planEndDate) return false;
        return Date.now() < authData.planEndDate;
    }, [authData]);

    useEffect(() => {
        loadAuthData();
    }, [loadAuthData]);

    return {
        authData,
        loading,
        error,
        login,
        logout,
        refresh,
        canAccessFeature,
        isPlanActive,
    };
}
