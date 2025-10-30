'use client';

import React, { createContext, useContext, useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePageCache, pageCacheUtils } from '../../lib/pageCache';

interface PageCacheContextType {
    currentPageId: string;
    isCached: boolean;
    clearCurrentPageCache: () => void;
    getCacheInfo: () => {
        totalPages: number;
        totalSize: number;
        oldestEntry: number | null;
        newestEntry: number | null;
    };
}

const PageCacheContext = createContext<PageCacheContextType | null>(null);

export const usePageCacheContext = () => {
    const context = useContext(PageCacheContext);
    if (!context) {
        throw new Error('usePageCacheContext must be used within a PageCacheProvider');
    }
    return context;
};

interface PageCacheProviderProps {
    children: React.ReactNode;
}

// Inner component that uses useSearchParams
const PageCacheProviderInner: React.FC<PageCacheProviderProps> = ({ children }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { getCacheInfo, clearPageCache, getPageCache } = usePageCache();

    // Generate current page ID
    const currentPageId = pageCacheUtils.generatePageId(
        pathname,
        Object.fromEntries(searchParams.entries())
    );

    // Track if current page has cached data (reactive)
    const [isCached, setIsCached] = useState<boolean>(() => usePageCache.getState().getPageCache(currentPageId) !== null);

    // Clear cache for current page
    const clearCurrentPageCache = () => {
        clearPageCache(currentPageId);
    };

    // Clean up expired cache entries periodically and subscribe to cache changes
    useEffect(() => {
        const interval = setInterval(() => {
            usePageCache.getState().clearExpiredCache();
            setIsCached(usePageCache.getState().getPageCache(currentPageId) !== null);
        }, 5 * 60 * 1000); // Clean up every 5 minutes

        // Subscribe to storage events (e.g., other tabs) and local changes
        const updateCachedFlag = () => setIsCached(usePageCache.getState().getPageCache(currentPageId) !== null);
        window.addEventListener('storage', updateCachedFlag);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', updateCachedFlag);
        };
    }, [currentPageId]);

    // Log cache info in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const info = getCacheInfo();
            console.log(`[PageCache] Current page: ${currentPageId}`, {
                isCached,
                cacheInfo: info,
            });
        }
    }, [currentPageId, isCached, getCacheInfo]);

    const contextValue: PageCacheContextType = {
        currentPageId,
        isCached,
        clearCurrentPageCache,
        getCacheInfo,
    };

    return (
        <PageCacheContext.Provider value={contextValue}>
            {children}
        </PageCacheContext.Provider>
    );
};

// Wrapper component with Suspense boundary
export const PageCacheProvider: React.FC<PageCacheProviderProps> = ({ children }) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PageCacheProviderInner>
                {children}
            </PageCacheProviderInner>
        </Suspense>
    );
};
