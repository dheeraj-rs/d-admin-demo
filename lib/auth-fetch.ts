/**
 * Authenticated fetch wrapper that:
 * 1. Adds user info to headers
 * 2. Handles 401 responses (account deactivated)
 * 3. Automatically logs out user if deactivated
 */

import toast from 'react-hot-toast';

interface AuthFetchOptions extends RequestInit {
    skipAuthCheck?: boolean;
}

export async function authFetch(url: string, options: AuthFetchOptions = {}): Promise<Response> {
    // Get user info from localStorage
    let userEmail: string | null = null;
    let userType: 'superadmin' | 'admin' | 'user' | null = null;

    const superAdminData = localStorage.getItem('superadmin_data');
    const adminData = localStorage.getItem('admin_data');
    const userData = localStorage.getItem('user_data');

    if (superAdminData) {
        try {
            const data = JSON.parse(superAdminData);
            userEmail = data.email;
            userType = 'superadmin';
        } catch (e) {
            console.error('Error parsing superadmin data:', e);
        }
    } else if (adminData) {
        try {
            const data = JSON.parse(adminData);
            userEmail = data.email;
            userType = 'admin';
        } catch (e) {
            console.error('Error parsing admin data:', e);
        }
    } else if (userData) {
        try {
            const data = JSON.parse(userData);
            userEmail = data.email;
            userType = 'user';
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }

    // Add user info to headers if available
    const headers = new Headers(options.headers);
    if (userEmail && userType && !options.skipAuthCheck) {
        headers.set('x-user-email', userEmail);
        headers.set('x-user-type', userType);
    }

    // Make the request
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Check if account was deactivated
    if (response.status === 401) {
        try {
            const data = await response.clone().json();
            if (data.error === 'ACCOUNT_DEACTIVATED' && data.requiresLogout) {
                // Account deactivated - logout immediately
                toast.error(data.message || 'Your account has been deactivated');
                
                // Clear all data
                localStorage.clear();
                
                // Clear cookies
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
                
                // Redirect to login
                setTimeout(() => {
                    if (userType === 'superadmin') {
                        window.location.href = '/superadmin-login';
                    } else if (userType === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/';
                    }
                }, 2000);
            }
        } catch (e) {
            // Not JSON response, ignore
        }
    }

    return response;
}

// Export a default fetch that can be used as a drop-in replacement
export default authFetch;
