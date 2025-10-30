import { DashboardData } from '../types/dashboard';

// Global cache to prevent duplicate requests
let dashboardDataCache: DashboardData | null = null;
let dashboardRequestPromise: Promise<DashboardData> | null = null;

export const DashboardService = {
    getDashboardData(): Promise<DashboardData> {
        // Return cached data if available
        if (dashboardDataCache) {
            return Promise.resolve(dashboardDataCache);
        }

        // Return existing request if one is in progress
        if (dashboardRequestPromise) {
            return dashboardRequestPromise;
        }

        // Create new request
        dashboardRequestPromise = fetch('/demo/data/dashboard.json', {
            headers: { 'Cache-Control': 'no-cache' },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                const dashboardData = data as DashboardData;
                // Cache the result in memory only
                dashboardDataCache = dashboardData;
                return dashboardData;
            })
            .finally(() => {
                // Clear the request promise
                dashboardRequestPromise = null;
            });

        return dashboardRequestPromise;
    },

    updateDashboardData(data: DashboardData) {
        // Store only in memory cache, not localStorage
        dashboardDataCache = data;
        return Promise.resolve(data);
    },

    // Function to clear cache (useful for testing or refresh)
    clearCache() {
        dashboardDataCache = null;
        dashboardRequestPromise = null;
    },
};
