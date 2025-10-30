/**
 * Comprehensive Logout Utility
 * Clears all authentication data across the application
 */

/**
 * Clear all authentication data and logout the user
 * This function handles all cleanup required for a complete logout
 * Returns a Promise to ensure server-side logout completes
 */
export async function performLogout(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        console.log('🔄 Performing comprehensive logout...');

        // 0. Call server-side logout API to clear httpOnly cookies - WAIT for completion
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                console.log('✅ Server-side cookies cleared');
            } else {
                console.error('❌ Server-side logout failed:', data.error);
            }
        } catch (err) {
            console.error('❌ Server-side logout error:', err);
        }

        // 1. Disable Google One Tap auto-login FIRST (before clearing data)
        if (window.google?.accounts?.id) {
            try {
                // Disable auto-select to prevent automatic re-login
                (window.google.accounts.id as any).disableAutoSelect?.();
                console.log('✅ Google auto-select disabled');

                // Cancel any pending prompts
                (window.google.accounts.id as any).cancel?.();
                console.log('✅ Google prompts cancelled');

                // Revoke the session
                (window.google.accounts.id as any).revoke?.('', () => {
                    console.log('✅ Google session revoked');
                });
            } catch (e) {
                console.error('Error disabling Google One Tap:', e);
            }
        }

        // 2. Clear ALL localStorage (complete wipe)
        console.log('🗑️ Clearing localStorage...');
        try {
            localStorage.clear(); // Clear everything
            console.log('✅ localStorage cleared');
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            // Fallback: remove specific keys
            const keysToRemove = [
                'user',
                'isAuthenticated',
                'userRole',
                'plan_auth_data',
                'auth_data',
                'sessionId',
                'superAdminId',
                'organizationKey',
                'databaseName',
                'plan',
                'dashboardData',
                'g_state',
            ];
            keysToRemove.forEach((key) => {
                localStorage.removeItem(key);
            });
        }

        // 3. Clear ALL sessionStorage completely
        console.log('🗑️ Clearing sessionStorage...');
        try {
            sessionStorage.clear();
            console.log('✅ sessionStorage cleared');
        } catch (e) {
            console.error('Error clearing sessionStorage:', e);
        }

        // 4. Clear ALL cookies (including Google cookies)
        console.log('🗑️ Clearing cookies...');
        const cookiesToClear = [
            'auth_token',
            'plan_auth_token',
            'owner_token',
            'session_id',
            'g_state',
            '__Host-1PLSID',
            '__Host-3PLSID',
            'HSID',
            'SSID',
            'APISID',
            'SAPISID',
        ];

        // Get all existing cookies
        const allCookies = document.cookie.split(';');

        // Clear specific auth cookies
        cookiesToClear.forEach((cookieName) => {
            // Multiple attempts with different configurations
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`;

            const domain = window.location.hostname;
            document.cookie = `${cookieName}=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            document.cookie = `${cookieName}=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        });

        // Also try to clear any cookie that looks like it might be auth-related
        allCookies.forEach((cookie) => {
            const cookieName = cookie.split('=')[0].trim();
            if (cookieName && (cookieName.includes('auth') || cookieName.includes('token') || cookieName.includes('session'))) {
                document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                console.log(`🗑️ Cleared cookie: ${cookieName}`);
            }
        });

        console.log('✅ Cookies cleared');

        // 5. Set a flag to prevent auto-login
        sessionStorage.setItem('logout_performed', 'true');
        localStorage.setItem('prevent_auto_login', 'true');

        // 6. Clear any cached data
        if ('caches' in window) {
            caches.keys().then((names) => {
                names.forEach((name) => {
                    caches.delete(name);
                });
            });
        }

        console.log('✅ Logout completed successfully - auto-login disabled');
    } catch (error) {
        console.error('❌ Error during logout:', error);
    }
}

/**
 * Logout and redirect to home page (free mode)
 * Always redirects to '/' to show free/public content
 */
export async function logoutAndRedirect(redirectUrl: string = '/dashboard'): Promise<void> {
    // WAIT for logout to complete before redirecting
    await performLogout();

    console.log('🔓 Logout complete, redirecting to:', redirectUrl);

    // Redirect immediately since logout is complete
    window.location.href = redirectUrl;
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const authToken = getCookie('auth_token');
    const planAuthToken = getCookie('plan_auth_token');
    const ownerToken = getCookie('owner_token');
    const isAuthenticatedLS = localStorage.getItem('isAuthenticated') === 'true';

    return !!(authToken || planAuthToken || ownerToken || isAuthenticatedLS);
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }

    return null;
}

/**
 * Get current user data from localStorage
 */
export function getCurrentUserData(): any | null {
    if (typeof window === 'undefined') return null;

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

/**
 * Force logout if session is invalid
 */
export function forceLogoutIfInvalid(): void {
    const isAuthenticated = isUserAuthenticated();
    const userData = getCurrentUserData();

    // If no auth tokens but localStorage says authenticated, clear everything
    if (!isAuthenticated && userData) {
        console.warn('⚠️ Invalid session detected - forcing logout');
        performLogout();
    }
}
