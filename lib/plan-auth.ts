import { jwtVerify, SignJWT } from 'jose';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'plan_auth_token';

export interface PlanAuthPayload {
    userId: string;
    email: string;
    name: string;
    role: 'user';
    superAdminId: string;
    organizationKey: string;
    plan: 'FREE' | 'PRO' | 'MAX';
    features: string[];
    isPlanActive: boolean;
    planEndDate?: number;
    [key: string]: any;
}

export const verifyPlanAuth = async (
    token: string
): Promise<{
    authenticated: boolean;
    payload?: PlanAuthPayload;
}> => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');
        const { payload } = await jwtVerify(token, secret);

        if (!payload || !payload.userId) {
            return { authenticated: false };
        }

        return { authenticated: true, payload: payload as unknown as PlanAuthPayload };
    } catch (error) {
        console.log('Plan auth token verification failed:', error);
        return { authenticated: false };
    }
};

export const createPlanAuthToken = async (payload: PlanAuthPayload): Promise<string> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'drjadmin');

    const token = await new SignJWT(payload as any).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('24h').sign(secret);

    return token;
};

export const getPlanAuthData = (): PlanAuthPayload | null => {
    if (typeof document === 'undefined') return null;

    try {
        const cookieValue = getCookie(COOKIE_NAME);
        if (!cookieValue || cookieValue.trim() === '' || cookieValue === 'undefined') {
            return null;
        }

        const decodedValue = decodeURIComponent(cookieValue);
        if (!decodedValue || decodedValue.trim() === '' || decodedValue === 'undefined') {
            return null;
        }

        const authData = JSON.parse(decodedValue);
        if (authData && typeof authData === 'object' && authData.userId) {
            return authData;
        }

        return null;
    } catch (error) {
        console.error('Error parsing plan auth data from cookie:', error);
        clearPlanAuthData();
        return null;
    }
};

export const setPlanAuthData = (authData: PlanAuthPayload): void => {
    if (typeof document === 'undefined') return;

    try {
        const cookieValue = encodeURIComponent(JSON.stringify(authData));
        document.cookie = `${COOKIE_NAME}=${cookieValue}; path=/; max-age=86400; secure; samesite=lax`;
    } catch (error) {
        console.error('Error setting plan auth data:', error);
    }
};

export const clearPlanAuthData = (): void => {
    if (typeof document === 'undefined') return;

    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const isPlanActive = (authData: PlanAuthPayload): boolean => {
    if (!authData.isPlanActive) return false;
    if (authData.plan === 'FREE') return true;
    if (!authData.planEndDate) return false;
    return Date.now() < authData.planEndDate;
};

export const canAccessFeature = (authData: PlanAuthPayload, feature: string): boolean => {
    if (!isPlanActive(authData)) return false;
    return authData.features.includes('*') || authData.features.includes(feature);
};

export const getRemainingUsage = (authData: PlanAuthPayload, limitType: 'apiCalls' | 'storage' | 'downloads' | 'pages'): number => {
    // This would need to be fetched from the server
    // For now, return a default value
    return 100;
};

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

/**
 * Get plan context from NextRequest (server-side)
 * Used in API routes to authenticate and get account info
 */
export async function getPlanContext(request: NextRequest): Promise<{
    authenticated: boolean;
    accountId: string;
    email: string;
    name: string;
    superAdminId: string;
    databaseName: string;
    plan: 'FREE' | 'PRO' | 'MAX';
    features: string[];
    isPlanActive: boolean;
} | null> {
    try {
        const token = request.cookies.get(COOKIE_NAME)?.value;
        if (!token) {
            return null;
        }

        const result = await verifyPlanAuth(token);
        if (!result.authenticated || !result.payload) {
            return null;
        }

        return {
            authenticated: true,
            accountId: result.payload.userId,
            email: result.payload.email,
            name: result.payload.name,
            superAdminId: result.payload.superAdminId,
            databaseName: result.payload.databaseName,
            plan: result.payload.plan,
            features: result.payload.features,
            isPlanActive: result.payload.isPlanActive,
        };
    } catch (error) {
        console.error('Error getting plan context:', error);
        return null;
    }
}
