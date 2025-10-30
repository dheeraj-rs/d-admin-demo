'use client';

import { useState, useEffect } from 'react';
import { safeJsonParse } from '../lib/safe-fetch';

export const useUserRole = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await fetch('/api/auth');
                const data = await safeJsonParse(response);
                
                if (data.authenticated && data.user) {
                    setUserRole(data.user.role);
                }
            } catch (error) {
                console.error('Failed to check user role:', error);
            }
        };
        checkUserRole();
    }, []);

    return userRole;
};
