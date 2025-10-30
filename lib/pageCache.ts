import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React from 'react';

// Define the structure for cached page data
export interface CachedPageData {
    [pageId: string]: {
        timestamp: number;
        data: any;
        version: string;
    };
}

// Define the page cache store interface
interface PageCacheStore {
    // Cache storage
    pageCache: CachedPageData;

    // Cache operations
    setPageCache: (pageId: string, data: any, version?: string) => void;
    getPageCache: (pageId: string) => any | null;
    clearPageCache: (pageId: string) => void;
    clearAllCache: () => void;
    clearExpiredCache: (maxAge?: number) => void;

    // Cache info
    getCacheInfo: () => {
        totalPages: number;
        totalSize: number;
        oldestEntry: number | null;
        newestEntry: number | null;
    };
}

// Create the page cache store with persistence
export const usePageCache = create<PageCacheStore>()(
    persist(
        (set, get) => ({
            pageCache: {},

            setPageCache: (pageId: string, data: any, version: string = '1.0') => {
                set((state) => ({
                    pageCache: {
                        ...state.pageCache,
                        [pageId]: {
                            timestamp: Date.now(),
                            data,
                            version,
                        },
                    },
                }));
            },

            getPageCache: (pageId: string) => {
                const state = get();
                const cached = state.pageCache[pageId];

                if (!cached) return null;

                // Check if cache is still valid (24 hours default)
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                if (Date.now() - cached.timestamp > maxAge) {
                    // Cache expired, remove it
                    get().clearPageCache(pageId);
                    return null;
                }

                return cached.data;
            },

            clearPageCache: (pageId: string) => {
                set((state) => {
                    const newCache = { ...state.pageCache };
                    delete newCache[pageId];
                    return { pageCache: newCache };
                });
            },

            clearAllCache: () => {
                set({ pageCache: {} });
            },

            clearExpiredCache: (maxAge: number = 24 * 60 * 60 * 1000) => {
                const state = get();
                const now = Date.now();
                const newCache: CachedPageData = {};

                Object.entries(state.pageCache).forEach(([pageId, cached]) => {
                    if (now - cached.timestamp <= maxAge) {
                        newCache[pageId] = cached;
                    }
                });

                set({ pageCache: newCache });
            },

            getCacheInfo: () => {
                const state = get();
                const entries = Object.values(state.pageCache);

                if (entries.length === 0) {
                    return {
                        totalPages: 0,
                        totalSize: 0,
                        oldestEntry: null,
                        newestEntry: null,
                    };
                }

                const timestamps = entries.map((entry) => entry.timestamp);
                const totalSize = JSON.stringify(state.pageCache).length;

                return {
                    totalPages: entries.length,
                    totalSize,
                    oldestEntry: Math.min(...timestamps),
                    newestEntry: Math.max(...timestamps),
                };
            },
        }),
        {
            name: 'page-cache-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ pageCache: state.pageCache }),
        }
    )
);

// Utility functions for common page operations
export const pageCacheUtils = {
    // Generate a unique page ID based on route and parameters
    generatePageId: (pathname: string, searchParams?: Record<string, string>): string => {
        const baseId = pathname.replace(/\//g, '-').replace(/^-|-$/g, '') || 'home';

        if (!searchParams || Object.keys(searchParams).length === 0) {
            return baseId;
        }

        const paramsString = Object.entries(searchParams)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        return `${baseId}-${paramsString}`;
    },

    // Auto-save page state with debouncing
    autoSave: (() => {
        const saveTimeouts: Record<string, NodeJS.Timeout> = {};

        return (pageId: string, data: any, delay: number = 1000) => {
            // Clear existing timeout
            if (saveTimeouts[pageId]) {
                clearTimeout(saveTimeouts[pageId]);
            }

            // Set new timeout
            saveTimeouts[pageId] = setTimeout(() => {
                usePageCache.getState().setPageCache(pageId, data);
                delete saveTimeouts[pageId];
            }, delay);
        };
    })(),

    // Restore page state with fallback
    restorePageState: <T>(pageId: string, fallbackData: T): T => {
        const cached = usePageCache.getState().getPageCache(pageId);
        return cached || fallbackData;
    },
};

// Hook for easy page caching
export const usePageState = <T>(pageId: string, initialState: T, autoSaveDelay: number = 1000) => {
    const { setPageCache, getPageCache } = usePageCache();

    // Restore state from cache on mount
    const [state, setState] = React.useState<T>(() => {
        const cached = getPageCache(pageId);
        return cached || initialState;
    });

    // Auto-save state changes
    React.useEffect(() => {
        if (state !== initialState) {
            pageCacheUtils.autoSave(pageId, state, autoSaveDelay);
        }
    }, [state, pageId, autoSaveDelay, initialState]);

    // Function to update state and cache
    const updateState = React.useCallback(
        (newState: T | ((prev: T) => T)) => {
            setState((prev) => {
                const updated = typeof newState === 'function' ? (newState as (prev: T) => T)(prev) : newState;
                // Immediately save to cache for important updates
                setPageCache(pageId, updated);
                return updated;
            });
        },
        [pageId, setPageCache]
    );

    // Function to clear cache for this page
    const clearCache = React.useCallback(() => {
        usePageCache.getState().clearPageCache(pageId);
    }, [pageId]);

    return {
        state,
        setState: updateState,
        clearCache,
        isCached: !!getPageCache(pageId),
    };
};
