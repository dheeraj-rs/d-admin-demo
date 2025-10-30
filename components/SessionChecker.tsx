'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface SessionCheckerProps {
    email: string;
    userType: 'superadmin' | 'admin' | 'user';
    checkInterval?: number; // in milliseconds, default 60 seconds (increased from 10)
}

export default function SessionChecker({ email, userType, checkInterval = 60000 }: SessionCheckerProps) {
    const router = useRouter();
    const [isPageVisible, setIsPageVisible] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Handle page visibility changes
        const handleVisibilityChange = () => {
            setIsPageVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        // Only run session check if page is visible
        if (!isPageVisible) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const checkSession = async () => {
            // Don't check if page is not visible
            if (document.hidden) return;

            try {
                const res = await fetch('/api/check-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, userType }),
                });

                const data = await res.json();

                if (!data.isActive) {
                    // Account has been deactivated
                    toast.error(data.message || 'Your account has been deactivated');
                    
                    // Clear local storage
                    localStorage.clear();
                    
                    // Clear cookies
                    document.cookie.split(";").forEach((c) => {
                        document.cookie = c
                            .replace(/^ +/, "")
                            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });
                    
                    // Redirect based on user type
                    setTimeout(() => {
                        if (userType === 'superadmin') {
                            router.push('/superadmin-login');
                        } else if (userType === 'admin') {
                            router.push('/admin');
                        } else {
                            router.push('/');
                        }
                    }, 2000);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        };

        // Check immediately on mount (only if page is visible)
        checkSession();

        // Set up interval to check periodically (only when page is visible)
        intervalRef.current = setInterval(checkSession, checkInterval);

        // Cleanup on unmount or when page becomes hidden
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [email, userType, checkInterval, router, isPageVisible]);

    return null; // This component doesn't render anything
}
