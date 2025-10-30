export type UserRole = 'owner' | 'superadmin' | 'account' | 'all';
export type AccountPlan = 'free' | 'pro' | 'max';
export type AccountRole = `account_${AccountPlan}`;

export interface RoutePermission {
    path: string;
    roles: UserRole[];
    title: string;
    description?: string;
}

// Publicly accessible paths that do not require authentication
export const PUBLIC_PATHS: string[] = [
    '/',
    '/admin',
    '/auth/pin',
    '/auth/admin',
    '/auth/pending',
    '/auth/setup-profile',
    '/auth/setup',
    '/auth/set-pin',
    '/register-superadmin',
    '/superadmin-login',
    '/owner-login',
    '/owner-dashboard',
    '/mail/dashboard',
    '/test-approval',
    '/register-admin',
    '/knowledge',
    '/webconfig',
    '/websites',
    '/ai-websites',
    '/webconfig/portfolio',
];

export const ROUTE_PERMISSIONS: RoutePermission[] = [
    {
        path: '/',
        roles: ['all'],
        title: 'routes.dashboard',
        description: 'routes.dashboardDesc',
    },
    {
        path: '/register-superadmin',
        roles: ['all'],
        title: 'SuperAdmin Registration',
        description: 'Register as organization owner',
    },
    {
        path: '/register-admin',
        roles: ['all'],
        title: 'Admin Registration',
        description: 'Register as organization admin',
    },
    {
        path: '/elements',
        roles: ['superadmin', 'account'],
        title: 'routes.elements',
        description: 'routes.elementsDesc',
    },
    {
        path: '/add-elements',
        roles: ['superadmin'],
        title: 'routes.addElements',
        description: 'routes.addElementsDesc',
    },
    // Common Elements
    {
        path: '/elements/common/formlayout',
        roles: ['all'],
        title: 'routes.formLayout',
        description: 'routes.formLayoutDesc',
    },
    {
        path: '/elements/common/button',
        roles: ['all'],
        title: 'routes.button',
        description: 'routes.buttonDesc',
    },
    {
        path: '/elements/common/card',
        roles: ['all'],
        title: 'routes.card',
        description: 'routes.cardDesc',
    },
    {
        path: '/elements/common/input',
        roles: ['all'],
        title: 'routes.input',
        description: 'routes.inputDesc',
    },
    {
        path: '/elements/common/table',
        roles: ['all'],
        title: 'routes.table',
        description: 'routes.tableDesc',
    },
    {
        path: '/elements/common/other',
        roles: ['all'],
        title: 'routes.other',
        description: 'routes.otherDesc',
    },
    // Sections
    {
        path: '/elements/sections/header',
        roles: ['all'],
        title: 'routes.header',
        description: 'routes.headerDesc',
    },
    {
        path: '/elements/sections/hero',
        roles: ['all'],
        title: 'routes.hero',
        description: 'routes.heroDesc',
    },
    {
        path: '/elements/sections/footer',
        roles: ['all'],
        title: 'routes.footer',
        description: 'routes.footerDesc',
    },
    // Auth Sections
    {
        path: '/elements/sections/auth/login',
        roles: ['superadmin', 'account'],
        title: 'routes.login',
        description: 'routes.loginDesc',
    },
    {
        path: '/elements/sections/auth/error',
        roles: ['superadmin', 'account'],
        title: 'routes.error',
        description: 'routes.errorDesc',
    },
    {
        path: '/elements/sections/auth/access',
        roles: ['superadmin', 'account'],
        title: 'routes.accessDenied',
        description: 'routes.accessDeniedDesc',
    },
    {
        path: '/elements/sections/notfound',
        roles: ['superadmin', 'account'],
        title: 'routes.notFound',
        description: 'routes.notFoundDesc',
    },
    // Utils
    {
        path: '/utils/icons',
        roles: ['superadmin', 'account'],
        title: 'routes.icons',
        description: 'routes.iconsDesc',
    },
    {
        path: '/utils/flex',
        roles: ['superadmin', 'account'],
        title: 'routes.flex',
        description: 'routes.flexDesc',
    },
    {
        path: '/utils/box-shadow',
        roles: ['superadmin', 'account'],
        title: 'routes.shadow',
        description: 'routes.shadowDesc',
    },
    {
        path: '/utils/color-palettes',
        roles: ['superadmin', 'account'],
        title: 'routes.colorPalettes',
        description: 'routes.colorPalettesDesc',
    },
    // Tools
    {
        path: '/messages',
        roles: ['superadmin'],
        title: 'routes.messages',
        description: 'routes.messagesDesc',
    },
    {
        path: '/emails',
        roles: ['superadmin'],
        title: 'routes.emailAccounts',
        description: 'routes.emailAccountsDesc',
    },
    {
        path: '/ai-websites',
        roles: ['all'],
        title: 'routes.aiWebsites',
        description: 'routes.aiWebsitesDesc',
    },
    // Software
    {
        path: '/software/chatbot',
        roles: ['superadmin'],
        title: 'routes.chatBot',
        description: 'routes.chatBotDesc',
    },
    {
        path: '/software/iconmaker',
        roles: ['superadmin'],
        title: 'routes.iconMaker',
        description: 'routes.iconMakerDesc',
    },
    {
        path: '/software',
        roles: ['superadmin'],
        title: 'routes.softwareManagement',
        description: 'routes.softwareManagementDesc',
    },
    // Document
    {
        path: '/document',
        roles: ['superadmin', 'account'],
        title: 'routes.documentation',
        description: 'routes.documentationDesc',
    },
    {
        path: '/knowledge',
        roles: ['all'],
        title: 'routes.knowledgeBase',
        description: 'routes.knowledgeBaseDesc',
    },
    // Website
    {
        path: '/webconfig',
        roles: ['all'],
        title: 'routes.webConfiguration',
        description: 'routes.webConfigurationDesc',
    },
    {
        path: '/website-builder',
        roles: ['superadmin'],
        title: 'routes.websiteBuilder',
        description: 'routes.websiteBuilderDesc',
    },
    {
        path: '/websites',
        roles: ['all'],
        title: 'routes.websites',
        description: 'routes.websitesDesc',
    },
    // Other existing routes
    {
        path: '/folder',
        roles: ['superadmin', 'account'],
        title: 'routes.folderManagement',
        description: 'routes.folderManagementDesc',
    },
    {
        path: '/webconfig/portfolio',
        roles: ['all'],
        title: 'routes.portfolio',
        description: 'routes.portfolioDesc',
    },
    {
        path: '/settings',
        roles: ['superadmin'],
        title: 'routes.settings',
        description: 'routes.settingsDesc',
    },
];

// Normalize path to remove trailing slashes (except root) and ensure leading slash
const normalizePath = (path: string): string => {
    if (!path) return '/';
    let normalized = path.startsWith('/') ? path : `/${path}`;
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    return normalized;
};

// Find the most specific matching route permission for a given path
export const getRoutePermission = (path: string): RoutePermission | undefined => {
    const currentPath = normalizePath(path);
    // Prefer longest matching prefix to allow hierarchical permissions
    const matches = ROUTE_PERMISSIONS.filter((route) => {
        const routePath = normalizePath(route.path);
        if (routePath === '/') return currentPath === '/';
        return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
    });
    if (matches.length === 0) return undefined;
    return matches.sort((a, b) => normalizePath(b.path).length - normalizePath(a.path).length)[0];
};

export const hasPermission = (path: string, userRole: UserRole | null): boolean => {
    const route = getRoutePermission(path);
    if (!route) {
        // If no specific permission is defined, allow access
        return true;
    }

    // If route has 'all' role, allow access for everyone (even unauthenticated)
    if (route.roles.includes('all')) {
        return true;
    }

    // If user is not authenticated, deny access to non-public routes
    if (!userRole) {
        return false;
    }

    return route.roles.includes(userRole);
};

// Check if a route is publicly accessible (has 'all' role)
export const isPublicRoute = (path: string): boolean => {
    const route = getRoutePermission(path);
    return route ? route.roles.includes('all') : false;
};

export const getAccessibleRoutes = (userRole: UserRole): RoutePermission[] => {
    return ROUTE_PERMISSIONS.filter((route) => route.roles.includes(userRole));
};

export const getRoleHierarchy = (role: UserRole | AccountRole): number => {
    const hierarchy: Record<string, number> = {
        all: 0,
        account_free: 1,
        account_pro: 2,
        account_max: 3,
        account: 3,
        superadmin: 4,
        owner: 5,
    };
    return hierarchy[role] || 0;
};

export const canAccessRoute = (userRole: UserRole, requiredRole: UserRole): boolean => {
    return getRoleHierarchy(userRole) >= getRoleHierarchy(requiredRole);
};

// Feature-level permissions for Settings page
export type SettingFeature = 'profile' | 'language' | 'theme' | 'layout' | 'website_generation' | 'seo' | 'notifications' | 'advanced' | 'security';

export const SETTINGS_FEATURE_PERMISSIONS: Record<SettingFeature, UserRole[]> = {
    profile: ['account', 'superadmin', 'owner'],
    language: ['account', 'superadmin', 'owner'],
    theme: ['account', 'superadmin', 'owner'],
    layout: ['superadmin', 'owner'],
    website_generation: ['superadmin', 'owner'],
    seo: ['superadmin', 'owner'],
    notifications: ['account', 'superadmin', 'owner'],
    advanced: ['superadmin', 'owner'],
    security: ['superadmin', 'owner'],
};

export const canUseSetting = (feature: SettingFeature, userRole: UserRole): boolean => {
    const allowedRoles = SETTINGS_FEATURE_PERMISSIONS[feature];
    return allowedRoles.includes(userRole);
};

// Plan-based permission helpers
export const getPlanLimits = (plan: AccountPlan) => {
    const limits = {
        free: {
            maxApiCalls: 100,
            maxStorage: 100, // MB
            maxDownloads: 10,
            maxPages: 5,
            maxProjects: 3,
            features: ['basic_elements', 'basic_templates']
        },
        pro: {
            maxApiCalls: 1000,
            maxStorage: 1000, // MB
            maxDownloads: 100,
            maxPages: 50,
            maxProjects: 20,
            features: ['basic_elements', 'basic_templates', 'advanced_elements', 'ai_generation', 'analytics']
        },
        max: {
            maxApiCalls: 10000,
            maxStorage: 10000, // MB
            maxDownloads: 1000,
            maxPages: 500,
            maxProjects: 100,
            features: ['basic_elements', 'basic_templates', 'advanced_elements', 'ai_generation', 'analytics', 'custom_domain', 'priority_support', 'api_access']
        }
    };
    return limits[plan];
};

export const canAccessFeature = (plan: AccountPlan, feature: string): boolean => {
    const limits = getPlanLimits(plan);
    return limits.features.includes(feature);
};

export const hasReachedPlanLimit = (plan: AccountPlan, limitType: string, currentUsage: number): boolean => {
    const limits = getPlanLimits(plan);
    const limitKey = `max${limitType.charAt(0).toUpperCase() + limitType.slice(1)}` as keyof typeof limits;
    const limit = limits[limitKey];
    if (typeof limit === 'number') {
        return currentUsage >= limit;
    }
    return false;
};
