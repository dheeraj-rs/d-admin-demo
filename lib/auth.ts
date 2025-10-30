import { jwtVerify, SignJWT } from 'jose';

const COOKIE_NAME = 'user_data';

export const verifyAuth = async (token: string) => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(token, secret);

        // Check if payload has required fields
        if (!payload || !payload.userId) {
            console.log('Token payload missing required fields');
            return { authenticated: false };
        }

        return { authenticated: true, payload };
    } catch (error) {
        console.log('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        return { authenticated: false };
    }
};

export const createToken = async (
    userId: string,
    additionalData?: {
        email?: string;
        name?: string;
        role?: 'superadmin' | 'admin' | 'user';
        organizationKey?: string;
        superAdminKey?: string;
        permissions?: any;
    }
) => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
    const payload: any = { userId };

    if (additionalData) {
        Object.assign(payload, additionalData);
    }

    const token = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('24h').sign(secret);
    return token;
};

export const getUserRole = () => {
    const getCookie = (cookieName: string): string | null => {
        if (typeof document === 'undefined') return null;

        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${cookieName}=`);

            if (parts.length === 2) {
                const cookiePart = parts.pop();
                if (cookiePart) {
                    const cookieValue = cookiePart.split(';').shift();
                    return cookieValue || null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting cookie:', error);
            return null;
        }
    };

    try {
        const cookieValue = getCookie(COOKIE_NAME);

        // Check if cookie exists and is not empty
        if (!cookieValue || cookieValue.trim() === '' || cookieValue === 'undefined') {
            return null;
        }

        // Try to decode and parse the cookie value
        const decodedValue = decodeURIComponent(cookieValue);

        // Additional check after decoding
        if (!decodedValue || decodedValue.trim() === '' || decodedValue === 'undefined') {
            return null;
        }

        const userData = JSON.parse(decodedValue);

        // Validate that userData is an object and has a role property
        if (userData && typeof userData === 'object' && userData.role) {
            return userData.role;
        }

        return null;
    } catch (error) {
        console.error('Error parsing user role from cookie:', error);
        // Clear the invalid cookie
        if (typeof document !== 'undefined') {
            document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        return null;
    }
};

export const getUserData = () => {
    const getCookie = (cookieName: string): string | null => {
        if (typeof document === 'undefined') return null;

        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${cookieName}=`);

            if (parts.length === 2) {
                const cookiePart = parts.pop();
                if (cookiePart) {
                    const cookieValue = cookiePart.split(';').shift();
                    return cookieValue || null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting cookie:', error);
            return null;
        }
    };

    try {
        const cookieValue = getCookie(COOKIE_NAME);

        if (!cookieValue || cookieValue.trim() === '' || cookieValue === 'undefined') {
            return null;
        }

        const decodedValue = decodeURIComponent(cookieValue);

        if (!decodedValue || decodedValue.trim() === '' || decodedValue === 'undefined') {
            return null;
        }

        const userData = JSON.parse(decodedValue);

        if (userData && typeof userData === 'object') {
            return userData;
        }

        return null;
    } catch (error) {
        console.error('Error parsing user data from cookie:', error);
        // Clear the invalid cookie
        if (typeof document !== 'undefined') {
            document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        return null;
    }
};

export const clearUserData = () => {
    if (typeof document !== 'undefined') {
        document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
};

// Utility function to check if token is about to expire (within 1 hour)
export const isTokenExpiringSoon = async (token: string): Promise<boolean> => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(token, secret);

        if (!payload || !payload.exp) {
            return true; // Consider expired if no expiration
        }

        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        return expirationTime - currentTime < oneHour;
    } catch (error) {
        return true; // Consider expired if verification fails
    }
};

// Utility function to get token expiration time
export const getTokenExpirationTime = async (token: string): Promise<Date | null> => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(token, secret);

        if (!payload || !payload.exp) {
            return null;
        }

        return new Date(payload.exp * 1000);
    } catch (error) {
        return null;
    }
};

// Logout function to clear all authentication data
export const logout = () => {
    if (typeof document !== 'undefined') {
        // Clear all auth-related cookies
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'return_to=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        // Clear any cached data
        localStorage.removeItem('dashboardData');

        // Redirect to pin page
        window.location.href = '/auth/pin';
    }
};

// Check if user has owner-level permissions
export const hasOwnerPermissions = (): boolean => {
    try {
        const userData = getUserData();
        if (!userData) return false;

        return userData.permissions?.isOwner === true || userData.permissions?.ownerAccess === true;
    } catch (error) {
        console.error('Error checking owner permissions:', error);
        return false;
    }
};

// Get user permissions
export const getUserPermissions = () => {
    try {
        const userData = getUserData();
        if (!userData) return null;

        return userData.permissions || {};
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return null;
    }
};

// Check if user has full database access
export const hasFullDbAccess = (): boolean => {
    try {
        const userData = getUserData();
        if (!userData) return false;

        return userData.permissions?.fullDbAccess === true || userData.permissions?.ownerAccess === true;
    } catch (error) {
        console.error('Error checking DB access:', error);
        return false;
    }
};
