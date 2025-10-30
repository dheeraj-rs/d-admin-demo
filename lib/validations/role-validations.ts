/**
 * Validation schemas for role-based access control system
 */

export const VALID_ROLES = ['owner', 'superadmin', 'account'] as const;
export const VALID_PLANS = ['free', 'pro', 'max'] as const;

export type UserRole = typeof VALID_ROLES[number];
export type AccountPlan = typeof VALID_PLANS[number];

/**
 * Validate user role
 */
export function isValidRole(role: string): role is UserRole {
    return VALID_ROLES.includes(role as UserRole);
}

/**
 * Validate account plan
 */
export function isValidPlan(plan: string): plan is AccountPlan {
    return VALID_PLANS.includes(plan as AccountPlan);
}

/**
 * Validate role-based access
 */
export function canAccessResource(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
        account: 1,
        superadmin: 2,
        owner: 3,
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Validate plan-based access
 */
export function canAccessFeatureByPlan(plan: AccountPlan, feature: string): boolean {
    const planFeatures: Record<AccountPlan, string[]> = {
        free: ['basic_elements', 'basic_templates'],
        pro: [
            'basic_elements',
            'basic_templates',
            'advanced_elements',
            'ai_generation',
            'analytics',
        ],
        max: [
            'basic_elements',
            'basic_templates',
            'advanced_elements',
            'ai_generation',
            'analytics',
            'custom_domain',
            'priority_support',
            'api_access',
        ],
    };
    
    return planFeatures[plan]?.includes(feature) || false;
}

/**
 * Get plan limits
 */
export function getPlanLimits(plan: AccountPlan) {
    const limits: Record<AccountPlan, {
        maxApiCalls: number;
        maxStorage: number;
        maxDownloads: number;
        maxPages: number;
        maxProjects: number;
    }> = {
        free: {
            maxApiCalls: 100,
            maxStorage: 100,
            maxDownloads: 10,
            maxPages: 5,
            maxProjects: 3,
        },
        pro: {
            maxApiCalls: 1000,
            maxStorage: 1000,
            maxDownloads: 100,
            maxPages: 50,
            maxProjects: 20,
        },
        max: {
            maxApiCalls: 10000,
            maxStorage: 10000,
            maxDownloads: 1000,
            maxPages: 500,
            maxProjects: 100,
        },
    };
    
    return limits[plan];
}

/**
 * Validate account creation request
 */
export interface CreateAccountRequest {
    email: string;
    name: string;
    googleId: string;
    plan?: AccountPlan;
    superAdminId: string;
    organizationKey: string;
    databaseName: string;
}

export function validateAccountCreation(data: Partial<CreateAccountRequest>): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    if (!data.email || !data.email.includes('@')) {
        errors.push('Valid email is required');
    }
    
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Name is required');
    }
    
    if (!data.googleId) {
        errors.push('Google ID is required');
    }
    
    if (!data.superAdminId) {
        errors.push('SuperAdmin ID is required');
    }
    
    if (!data.organizationKey) {
        errors.push('Organization key is required');
    }
    
    if (!data.databaseName) {
        errors.push('Database name is required');
    }
    
    if (data.plan && !isValidPlan(data.plan)) {
        errors.push('Invalid plan type');
    }
    
    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate plan upgrade/downgrade
 */
export function canChangePlan(currentPlan: AccountPlan, newPlan: AccountPlan, direction: 'upgrade' | 'downgrade'): boolean {
    const planHierarchy: Record<AccountPlan, number> = {
        free: 1,
        pro: 2,
        max: 3,
    };
    
    const currentLevel = planHierarchy[currentPlan];
    const newLevel = planHierarchy[newPlan];
    
    if (direction === 'upgrade') {
        return newLevel > currentLevel;
    } else {
        return newLevel < currentLevel;
    }
}

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
    owner: 'Platform Owner',
    superadmin: 'Organization Admin',
    account: 'Account User',
};

/**
 * Plan display names
 */
export const PLAN_DISPLAY_NAMES: Record<AccountPlan, string> = {
    free: 'Free Plan',
    pro: 'Pro Plan',
    max: 'Max Plan',
};

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
        owner: 'bg-purple-100 text-purple-800',
        superadmin: 'bg-blue-100 text-blue-800',
        account: 'bg-green-100 text-green-800',
    };
    
    return colors[role] || 'bg-gray-100 text-gray-800';
}

/**
 * Get plan badge color for UI
 */
export function getPlanBadgeColor(plan: AccountPlan): string {
    const colors: Record<AccountPlan, string> = {
        free: 'bg-gray-100 text-gray-800',
        pro: 'bg-blue-100 text-blue-800',
        max: 'bg-purple-100 text-purple-800',
    };
    
    return colors[plan] || 'bg-gray-100 text-gray-800';
}
