/**
 * Centralized Role and Permission Types
 * 
 * This file contains all role-related types used throughout the application.
 * Import from here to ensure consistency across the codebase.
 */

/**
 * User Roles in the system
 * - owner: Platform administrator with full access
 * - superadmin: Organization owner/administrator
 * - account: Regular user with plan-based access
 */
export type UserRole = 'owner' | 'superadmin' | 'account';

/**
 * Account subscription plans
 * - free: Basic access with limited features
 * - pro: Enhanced access with advanced features
 * - max: Full access with all premium features
 */
export type AccountPlan = 'free' | 'pro' | 'max';

/**
 * Combined role for accounts with plan specification
 */
export type AccountRole = `account_${AccountPlan}`;

/**
 * Plan types for models (uppercase convention)
 */
export type PlanType = 'FREE' | 'PRO' | 'MAX';

/**
 * User authentication data
 */
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    plan?: AccountPlan;
    organizationKey?: string;
    databaseName?: string;
    profilePicture?: string;
    pinSetup?: boolean;
}

/**
 * Account with plan information
 */
export interface AccountUser extends AuthUser {
    role: 'account';
    plan: AccountPlan;
    organizationKey: string;
    databaseName: string;
    superAdminId: string;
}

/**
 * SuperAdmin user information
 */
export interface SuperAdminUser extends AuthUser {
    role: 'superadmin';
    organizationKey: string;
    organizationName: string;
    databaseName: string;
}

/**
 * Owner user information
 */
export interface OwnerUser extends AuthUser {
    role: 'owner';
}

/**
 * Feature permissions
 */
export type Feature =
    | 'basic_elements'
    | 'basic_templates'
    | 'advanced_elements'
    | 'ai_generation'
    | 'analytics'
    | 'custom_domain'
    | 'priority_support'
    | 'api_access';

/**
 * Plan features mapping
 */
export interface PlanFeatures {
    features: Feature[];
    maxApiCalls: number;
    maxStorage: number;
    maxDownloads: number;
    maxPages: number;
    maxProjects: number;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
}

/**
 * Role hierarchy levels
 */
export const RoleHierarchy: Record<UserRole, number> = {
    account: 1,
    superadmin: 2,
    owner: 3,
};

/**
 * Plan hierarchy levels
 */
export const PlanHierarchy: Record<AccountPlan, number> = {
    free: 1,
    pro: 2,
    max: 3,
};

/**
 * Convert lowercase plan to uppercase PlanType
 */
export function toPlanType(plan: AccountPlan): PlanType {
    return plan.toUpperCase() as PlanType;
}

/**
 * Convert uppercase PlanType to lowercase AccountPlan
 */
export function toAccountPlan(planType: PlanType): AccountPlan {
    return planType.toLowerCase() as AccountPlan;
}

/**
 * Check if user has higher or equal role
 */
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

/**
 * Check if plan has higher or equal level
 */
export function hasPlanLevel(userPlan: AccountPlan, requiredPlan: AccountPlan): boolean {
    return PlanHierarchy[userPlan] >= PlanHierarchy[requiredPlan];
}
