'use client';

import Layout from '../../layout/layout';
import '../../styles/elements/elements.scss';
import '../../styles/pages/index.scss';
import '../../styles/layout/layout.scss';
import { usePathname } from 'next/navigation';
import AuthGuard from '../../components/auth/AuthGuard';
import SessionChecker from '../../components/SessionChecker';
import { useEffect, useState } from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
}

// Pages that don't require authentication OR are accessible to authenticated users
const PUBLIC_PAGES = [
    '/',
    '/admin',
    '/superadmin-login',
    '/register-superadmin',
    '/register-admin',
    '/test-approval',
    '/knowledge',
    '/webconfig',
    '/websites',
    '/ai-websites',
    '/portfolio',
];

export default function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    const [userSession, setUserSession] = useState<{ email: string; userType: 'superadmin' | 'admin' | 'user' } | null>(null);

    useEffect(() => {
        // Check for user session in localStorage
        const superAdminData = localStorage.getItem('superadmin_data');
        const adminData = localStorage.getItem('admin_data');
        const userData = localStorage.getItem('user_data');
        const user = localStorage.getItem('user'); // Check 'user' key as well

        if (superAdminData) {
            try {
                const data = JSON.parse(superAdminData);
                if (data.email) {
                    setUserSession({ email: data.email, userType: 'superadmin' });
                }
            } catch (e) {
                console.error('Error parsing superadmin data:', e);
            }
        } else if (user) {
            // Check 'user' key (used by normal login and emergency access)
            try {
                const data = JSON.parse(user);
                if (data.email && data.role) {
                    const userType = data.role === 'superadmin' ? 'superadmin' :
                        data.role === 'admin' ? 'admin' : 'user';
                    setUserSession({ email: data.email, userType });
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        } else if (adminData) {
            try {
                const data = JSON.parse(adminData);
                if (data.email) {
                    setUserSession({ email: data.email, userType: 'admin' });
                }
            } catch (e) {
                console.error('Error parsing admin data:', e);
            }
        } else if (userData) {
            try {
                const data = JSON.parse(userData);
                if (data.email) {
                    setUserSession({ email: data.email, userType: 'user' });
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, [pathname]);

    // Disable AuthGuard for now - SuperAdmin auth works via localStorage
    // Pages will handle their own auth if needed
    return (
        <div className="page-transition">
            {userSession && (
                <SessionChecker
                    email={userSession.email}
                    userType={userSession.userType}
                    checkInterval={3000} // Check every 3 seconds for faster logout
                />
            )}
            <Layout>{children}</Layout>
        </div>
    );
}
