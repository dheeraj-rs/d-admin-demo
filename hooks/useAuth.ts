import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { clearUserData } from '../lib/auth';
import { performLogout } from '../lib/auth-logout';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

// Global flag to prevent multiple simultaneous auth checks
let globalAuthCheckInProgress = false;
let globalAuthState: AuthState | null = null;

// Function to reset global auth state (useful for testing or logout)
export const resetGlobalAuthState = () => {
    globalAuthCheckInProgress = false;
    globalAuthState = null;
};

// Function to get auth token from cookies
const getAuthToken = () => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find((cookie) => cookie.trim().startsWith('auth_token='));
    return authCookie ? authCookie.split('=')[1] : null;
};

// Function to get user data from cookies
const getUserData = () => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find((cookie) => cookie.trim().startsWith('user_data='));

    if (!userCookie) {
        console.log('🍪 No user_data cookie found');
        return null;
    }

    try {
        const cookieValue = userCookie.split('=')[1];
        console.log('🍪 Raw cookie value:', cookieValue?.substring(0, 50) + '...');

        // Check if the value is undefined, empty, or malformed
        if (!cookieValue || cookieValue === 'undefined' || cookieValue === 'null' || cookieValue === '""') {
            console.log('🍪 Cookie value is empty or invalid');
            return null;
        }

        // Try to decode the URI component first
        let decodedValue;
        try {
            decodedValue = decodeURIComponent(cookieValue);
            console.log('🍪 Decoded value:', decodedValue);
        } catch (decodeError) {
            console.error('❌ Error decoding cookie value:', decodeError);
            // Clear the malformed cookie
            document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            return null;
        }

        // Validate the decoded value
        if (!decodedValue || decodedValue === 'undefined' || decodedValue === 'null' || decodedValue === '""') {
            console.log('🍪 Decoded value is empty or invalid');
            return null;
        }

        // Try to parse the JSON
        const parsedData = JSON.parse(decodedValue);
        console.log('🍪 Parsed user data:', parsedData);

        // Validate the parsed data structure
        if (!parsedData || typeof parsedData !== 'object' || !parsedData.id || !parsedData.email || !parsedData.role) {
            console.error('❌ Invalid user data structure:', parsedData);
            // Clear the invalid cookie
            document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            return null;
        }

        console.log('✅ Valid user data found:', { id: parsedData.id, email: parsedData.email, role: parsedData.role });
        return parsedData;
    } catch (error) {
        console.error('❌ Error parsing user data from cookie:', error);
        // Clear the invalid cookie
        document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return null;
    }
};

export const useAuth = (skip: boolean = false) => {
    const [authState, setAuthState] = useState<AuthState>(() => {
        // If skipped, return default state
        if (skip) {
            return {
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: null,
            };
        }

        // Initialize with global state if available
        if (globalAuthState) {
            console.log('🔄 Using global auth state:', globalAuthState);
            return globalAuthState;
        }

        // Check if we have auth data in cookies on initialization
        const token = getAuthToken();
        const userData = getUserData();

        console.log('🍪 Initial cookie check:', { hasToken: !!token, userData });

        // If we have userData, use it (token might be httpOnly and not readable)
        if (userData) {
            const initialState = {
                isAuthenticated: true,
                user: userData,
                isLoading: false,
                error: null,
            };
            globalAuthState = initialState;
            console.log('✅ Initialized with user data from cookie:', initialState);
            return initialState;
        }

        console.log('⏳ No user data found, starting in loading state');
        return {
            isAuthenticated: false,
            user: null,
            isLoading: true,
            error: null,
        };
    });
    const router = useRouter();
    const hasCheckedAuth = useRef(false);

    const checkAuth = useCallback(async () => {
        // Prevent multiple simultaneous auth checks globally
        if (globalAuthCheckInProgress) {
            return;
        }

        let timeoutId: NodeJS.Timeout | null = null;
        let controller: AbortController | null = null;

        try {
            globalAuthCheckInProgress = true;

            setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

            controller = new AbortController();
            timeoutId = setTimeout(() => {
                if (controller && !controller.signal.aborted) {
                    controller.abort();
                }
            }, 2000); // Reduced timeout

            const response = await fetch('/api/auth', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
            });

            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            const data = await response.json();

            // Handle both successful and failed responses
            const newAuthState = {
                isAuthenticated: response.ok && data.authenticated === true,
                user: response.ok && data.authenticated === true ? data.user : null,
                isLoading: false,
                error: response.ok ? null : data.error || 'Authentication failed',
            };

            // Update global state
            globalAuthState = newAuthState;
            setAuthState(newAuthState);

            // Clear invalid cookies if not authenticated
            if (!newAuthState.isAuthenticated) {
                clearUserData();
            }
        } catch (error) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            // Check if it's an abort error
            if (error instanceof Error && error.name === 'AbortError') {
                console.log('Auth request was aborted due to timeout');
                const timeoutState = {
                    isAuthenticated: false,
                    user: null,
                    isLoading: false,
                    error: 'Authentication request timed out',
                };
                globalAuthState = timeoutState;
                setAuthState(timeoutState);
                clearUserData();
                return;
            }

            console.error('Auth check error:', error);
            clearUserData();

            const errorState = {
                isAuthenticated: false,
                user: null,
                isLoading: false,
                error: 'Failed to check authentication',
            };

            globalAuthState = errorState;
            setAuthState(errorState);
        } finally {
            globalAuthCheckInProgress = false;
        }
    }, []);

    const refreshAuth = useCallback(() => {
        // Re-read cookies and update state immediately
        const token = getAuthToken();
        const userData = getUserData();

        console.log('🔄 Refreshing auth:', { hasToken: !!token, userData });

        // If we have userData, use it (token might be httpOnly and not readable)
        if (userData) {
            const newState = {
                isAuthenticated: true,
                user: userData,
                isLoading: false,
                error: null,
            };
            globalAuthState = newState;
            setAuthState(newState);
            console.log('✅ Auth refreshed with user data from cookie');
        } else {
            // No valid cookies, trigger full auth check
            console.log('⚠️ No user data found, triggering full auth check');
            checkAuth();
        }
    }, [checkAuth]);

    const logout = useCallback(() => {
        // Use comprehensive logout to clear ALL auth data
        performLogout();

        const logoutState = {
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: null,
        };
        globalAuthState = logoutState;
        setAuthState(logoutState);
        console.log('🔓 User logged out - all auth data cleared, redirecting to home (free mode)');

        // Redirect to home page (/) for free mode access
        router.push('/');
    }, [router]);

    // Check authentication on mount
    useEffect(() => {
        // Skip auth check if disabled
        if (skip) {
            return;
        }

        const token = getAuthToken();
        const userData = getUserData();

        if (userData) {
            // We have user data, verify with server in background
            setTimeout(() => {
                if (!globalAuthCheckInProgress) {
                    checkAuth();
                }
            }, 100);
        } else {
            // No user data, check auth immediately
            checkAuth();

            // Retry after delay in case cookies weren't available yet
            setTimeout(() => {
                console.log('🔄 Retrying cookie check after delay...');
                refreshAuth();
            }, 1000);
        }

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshAuth();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [checkAuth, refreshAuth, skip]);

    return {
        ...authState,
        checkAuth,
        refreshAuth,
        logout,
    };
};
