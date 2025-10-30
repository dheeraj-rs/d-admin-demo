/**
 * Permission and Access Control Utilities
 */

export type UserRole = 'owner' | 'superadmin' | 'account';
export type AccountPlan = 'free' | 'pro' | 'max';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    plan?: AccountPlan; // For account role
    organizationKey?: string;
    organizationName?: string;
    profilePicture?: string;
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isAuthenticated') === 'true';
}

/**
 * Check if user is Owner
 */
export function isOwner(): boolean {
    const user = getCurrentUser();
    return user?.role === 'owner';
}

/**
 * Check if user is SuperAdmin
 */
export function isSuperAdmin(): boolean {
    const user = getCurrentUser();
    return user?.role === 'superadmin';
}

/**
 * Check if user is Account
 */
export function isAccount(): boolean {
    const user = getCurrentUser();
    return user?.role === 'account';
}

/**
 * Check if user has admin privileges (Owner or SuperAdmin)
 */
export function hasAdminPrivileges(): boolean {
    return isOwner() || isSuperAdmin();
}

/**
 * Get account plan
 */
export function getAccountPlan(): AccountPlan | null {
    const user = getCurrentUser();
    return user?.plan || null;
}

/**
 * Check if user has permission to access a specific feature
 */
export function hasPermission(feature: string): boolean {
    const user = getCurrentUser();
    if (!user) return false;

    // Owner and SuperAdmin have access to everything
    if (user.role === 'owner' || user.role === 'superadmin') return true;

    // Define feature permissions
    const permissions: Record<UserRole, string[]> = {
        owner: ['*'], // All permissions
        superadmin: ['*'], // All permissions
        account: ['view_dashboard', 'view_own_content', 'manage_own_profile'],
    };

    const userPermissions = permissions[user.role] || [];

    // For accounts, check plan-based features
    if (user.role === 'account' && user.plan) {
        const planFeatures: Record<AccountPlan, string[]> = {
            free: ['view_dashboard', 'view_own_content', 'manage_own_profile'],
            pro: ['view_dashboard', 'view_own_content', 'manage_own_profile', 'ai_generation', 'analytics', 'advanced_elements'],
            max: [
                'view_dashboard',
                'view_own_content',
                'manage_own_profile',
                'ai_generation',
                'analytics',
                'advanced_elements',
                'custom_domain',
                'priority_support',
                'api_access',
            ],
        };
        const planPerms = planFeatures[user.plan] || [];
        return planPerms.includes(feature);
    }

    return userPermissions.includes('*') || userPermissions.includes(feature);
}

/**
 * Get user role
 */
export function getUserRole(): UserRole | null {
    const user = getCurrentUser();
    return user?.role || null;
}

/**
 * Clear user session
 * @deprecated Use performLogout from './auth-logout' for comprehensive logout
 */
export function clearSession(): void {
    if (typeof window === 'undefined') return;

    // Import and use comprehensive logout
    import('./auth-logout').then(({ performLogout }) => {
        performLogout();
    });
}

/**
 * Redirect to login if not authenticated
 */
export function requireAuth(redirectUrl: string = '/superadmin-login'): boolean {
    if (typeof window === 'undefined') return false;

    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Require Owner role
 */
export function requireOwner(redirectUrl: string = '/'): boolean {
    if (typeof window === 'undefined') return false;

    if (!isOwner()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Require SuperAdmin role
 */
export function requireSuperAdmin(redirectUrl: string = '/superadmin-login'): boolean {
    if (typeof window === 'undefined') return false;

    if (!isSuperAdmin() && !isOwner()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

/**
 * Check if user belongs to specific organization
 */
export function belongsToOrganization(organizationKey: string): boolean {
    const user = getCurrentUser();
    if (!user) return false;

    // Owner has access to all organizations
    if (user.role === 'owner') return true;

    // SuperAdmin with matching organization key
    if (user.role === 'superadmin') {
        return user.organizationKey === organizationKey;
    }

    return false;
}

/**
 * Get organization key for current user
 */
export function getOrganizationKey(): string | null {
    const user = getCurrentUser();
    return user?.organizationKey || null;
}
