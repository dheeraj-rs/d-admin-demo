'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Loader from './sample/loading/loader';

const InitialLoader: React.FC = () => {
    const { isAuthenticated, isLoading, user, error, checkAuth } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showLoader, setShowLoader] = useState(true); // Start with loader visible
    const [authChecked, setAuthChecked] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [animationStarted, setAnimationStarted] = useState(false);
    const hasHandledAuth = useRef(false);

    useEffect(() => {
        // Start the animation immediately when loader is shown
        if (showLoader && !animationStarted) {
            setAnimationStarted(true);
        }
    }, [showLoader, animationStarted]);

    // Handle initial page load and auth check
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check authentication status
                await checkAuth();
                setAuthChecked(true);

                // Show loader for a minimum time to ensure smooth UX
                setTimeout(() => {
                    setShowLoader(false);
                }, 2000); // Minimum 2 seconds for loader
            } catch (error) {
                console.error('Auth check failed:', error);
                setAuthChecked(true);
                setShowLoader(false);
            }
        };

        initializeApp();
    }, [checkAuth]);

    // Handle page reload after login
    useEffect(() => {
        const handleLoginSuccess = () => {
            // Check if we're coming from a login redirect
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('login') === 'success') {
                // Clear the URL parameter immediately
                window.history.replaceState({}, document.title, window.location.pathname);

                // Show loader for successful login transition
                setShowLoader(true);

                // After animation completes, hide loader
                setTimeout(() => {
                    setShowLoader(false);
                }, 1700); // Match animation duration
            }
        };

        // Check URL parameters on mount
        handleLoginSuccess();

        // Listen for URL changes
        const handleUrlChange = () => {
            handleLoginSuccess();
        };

        window.addEventListener('popstate', handleUrlChange);

        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);

    const handleLoaderFinish = () => {
        // Animation completed - hide loader after a short delay
        setTimeout(() => {
            setShowLoader(false);
        }, 500);
    };

    // Show loader
    if (showLoader) {
        return (
            <div className="initial-loader-wrapper">
                <Loader finishLoading={handleLoaderFinish} />
            </div>
        );
    }

    // Don't render anything otherwise
    return null;
};

export default InitialLoader;
