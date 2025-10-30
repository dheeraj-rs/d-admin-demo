'use client';

import { useEffect } from 'react';

interface PerformanceOptimizerProps {
    pageName: string;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ pageName }) => {
    useEffect(() => {
        // Preload critical resources
        const preloadCriticalResources = () => {
            // Preload critical CSS
            const criticalCSS = document.createElement('link');
            criticalCSS.rel = 'preload';
            criticalCSS.href = '/themes/d-admin-dark/theme.css';
            criticalCSS.as = 'style';
            document.head.appendChild(criticalCSS);

            // Preload critical fonts
            const criticalFont = document.createElement('link');
            criticalFont.rel = 'preload';
            criticalFont.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
            criticalFont.as = 'style';
            document.head.appendChild(criticalFont);
        };

        // Optimize images
        const optimizeImages = () => {
            const images = document.querySelectorAll('img');
            images.forEach((img) => {
                // Add loading="lazy" to images below the fold
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }

                // Add decoding="async" for better performance
                if (!img.hasAttribute('decoding')) {
                    img.setAttribute('decoding', 'async');
                }
            });
        };

        // Monitor Core Web Vitals
        const monitorCoreWebVitals = () => {
            if ('web-vital' in window) {
                // This would be implemented with the web-vitals library
                console.log('Core Web Vitals monitoring enabled for:', pageName);
            }
        };

        // Optimize third-party scripts
        const optimizeThirdPartyScripts = () => {
            // Defer non-critical scripts
            const scripts = document.querySelectorAll('script[data-defer]');
            scripts.forEach((script) => {
                script.setAttribute('defer', 'true');
            });
        };

        // Initialize optimizations
        preloadCriticalResources();
        optimizeImages();
        monitorCoreWebVitals();
        optimizeThirdPartyScripts();

        // Cleanup function
        return () => {
            // Cleanup if needed
        };
    }, [pageName]);

    return null; // This component doesn't render anything
};

export default PerformanceOptimizer; 