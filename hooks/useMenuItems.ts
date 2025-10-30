import { useMemo, useState, useEffect } from 'react';
import { menuItems } from '../public/demo/data/menuItems';
import { AppMenuItem } from '../types';
import { useAuth } from './useAuth';
import { hasPermission, UserRole } from '../lib/roles';
import { getCurrentUser, getUserRole } from '../lib/permissions';

export const useMenuItems = () => {
    const { user: oldAuthUser } = useAuth();
    const [isClient, setIsClient] = useState(false);

    // Ensure we're on the client side to prevent hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredMenuItems = useMemo(() => {
        // During SSR or before hydration, return empty array to prevent mismatch
        if (!isClient) return [];

        // Check both old auth system and new SuperAdmin auth
        const superAdminUser = getCurrentUser();
        const superAdminRole = getUserRole();
        
        // Prioritize SuperAdmin auth if available
        const user = superAdminUser || oldAuthUser;
        const userRole = (superAdminRole || user?.role) as UserRole | null;

        console.log('🔍 Menu filtering with role:', userRole, 'User:', user);

        const filterMenuItem = (item: AppMenuItem): AppMenuItem | null => {
            // If item has a direct 'to' property, check permission
            if (item.to) {
                return hasPermission(item.to, userRole) ? item : null;
            }

            // If item has sub-items, filter them
            if (item.items) {
                const filteredItems = item.items.map(filterMenuItem).filter((item): item is AppMenuItem => item !== null);

                // Only return the parent item if it has at least one accessible child
                return filteredItems.length > 0 ? { ...item, items: filteredItems } : null;
            }

            // If no 'to' or 'items', allow access (for separators, etc.)
            return item;
        };

        return menuItems.map(filterMenuItem).filter((item): item is AppMenuItem => item !== null);
    }, [oldAuthUser, isClient]);

    return filteredMenuItems;
};
