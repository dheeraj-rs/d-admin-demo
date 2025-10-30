/**
 * Simple utility to verify auth_token cookie is removed after logout
 */

/**
 * Check if auth_token cookie exists
 */
export function hasAuthToken(): boolean {
    if (typeof document === 'undefined') return false;
    
    const cookies = document.cookie.split(';');
    const hasToken = cookies.some((cookie) => {
        const [name] = cookie.trim().split('=');
        return name === 'auth_token';
    });
    
    return hasToken;
}

/**
 * Get auth_token cookie value
 */
export function getAuthToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth_token') {
            return value || null;
        }
    }
    return null;
}

/**
 * Verify auth_token is completely removed
 * Call this after logout to verify
 */
export function verifyAuthTokenRemoved(): void {
    console.log('🔍 Checking auth_token cookie...');
    
    const hasToken = hasAuthToken();
    const tokenValue = getAuthToken();
    
    if (!hasToken && !tokenValue) {
        console.log('✅ SUCCESS: auth_token cookie is REMOVED');
        console.log('✅ Cookie check passed!');
        return;
    }
    
    console.error('❌ FAILED: auth_token cookie still exists!');
    console.error('Cookie value:', tokenValue);
    console.error('All cookies:', document.cookie);
    
    // Try to manually remove it
    console.log('🔧 Attempting manual removal...');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    
    const domain = window.location.hostname;
    document.cookie = `auth_token=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `auth_token=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    setTimeout(() => {
        const stillHasToken = hasAuthToken();
        if (!stillHasToken) {
            console.log('✅ Manual removal successful!');
        } else {
            console.error('❌ auth_token is httpOnly - needs server-side clearing');
            console.error('Make sure /api/auth/logout is being called');
        }
    }, 500);
}

/**
 * Show all cookies
 */
export function showAllCookies(): void {
    console.log('🍪 All cookies:');
    const cookies = document.cookie.split(';');
    
    if (cookies.length === 1 && cookies[0] === '') {
        console.log('  ✅ No cookies found');
        return;
    }
    
    cookies.forEach((cookie) => {
        const [name, value] = cookie.trim().split('=');
        console.log(`  - ${name}: ${value?.substring(0, 30)}...`);
    });
}

// Make functions available in browser console
if (typeof window !== 'undefined') {
    (window as any).hasAuthToken = hasAuthToken;
    (window as any).getAuthToken = getAuthToken;
    (window as any).verifyAuthTokenRemoved = verifyAuthTokenRemoved;
    (window as any).showAllCookies = showAllCookies;
}
