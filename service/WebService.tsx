// service/WebsiteService.ts
import { WebConfigCardItems } from '../types';
import { WebsiteSelectionState as Website, FilterOption } from '../types/website';

interface GetWebsitesParams {
    category?: string;
    type?: string;
    technologies?: string;
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    noPagination?: boolean;
    initialCategory?: string;
}

export interface PaginatedResponse<T = WebConfigCardItems> {
    items: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

interface NonPaginatedResponse<T = WebConfigCardItems> {
    items: T[];
}

export type WebsiteResponse<T = WebConfigCardItems> = PaginatedResponse<T> | NonPaginatedResponse<T>;

interface FilterOptionsResponse {
    categoryOptions: FilterOption[];
    typeOptions: FilterOption[];
    techOptions: FilterOption[];
}

export const webService = {
    // Base method to fetch websites with flexible parameters
    getWebsites: async <T = WebConfigCardItems,>(params: GetWebsitesParams = {}): Promise<WebsiteResponse<T>> => {
        // Build query string based on provided parameters
        const queryParams = new URLSearchParams();

        // Add category filter if provided and not 'all'
        if (params.initialCategory && params.initialCategory !== 'all') {
            queryParams.append('initialCategory', params.initialCategory);
        } else if (params.category && params.category !== 'all') {
            queryParams.append('category', params.category);
        }

        // Add type filter if provided and not 'all'
        if (params.type && params.type !== 'all') {
            queryParams.append('type', params.type);
        }

        // Add technologies filter if provided and not 'all'
        if (params.technologies && params.technologies !== 'all') {
            queryParams.append('technologies', params.technologies);
        }

        // Add search term if provided
        if (params.search) {
            queryParams.append('search', params.search);
        }

        // Add time-based filtering parameters
        if (params.startDate) {
            queryParams.append('startDate', params.startDate);
        }

        if (params.endDate) {
            queryParams.append('endDate', params.endDate);
        }

        // Handle pagination vs. non-pagination
        if (params.noPagination) {
            queryParams.append('noPagination', 'true');
        } else {
            // Only add pagination params if we're using pagination
            if (params.page) {
                queryParams.append('page', params.page.toString());
            }

            if (params.limit) {
                queryParams.append('limit', params.limit.toString());
            }
        }

        const queryString = queryParams.toString();
        const url = queryString ? `/api/websites?${queryString}` : '/api/websites';

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch websites');
        }

        return response.json();
    },

    // Get paginated websites
    getPaginatedWebsites: async (
        page: number = 1,
        limit: number = 20,
        params: Omit<GetWebsitesParams, 'page' | 'limit' | 'noPagination'> = {}
    ): Promise<PaginatedResponse<WebConfigCardItems>> => {
        return webService.getWebsites<WebConfigCardItems>({
            ...params,
            page,
            limit,
            noPagination: false,
        }) as Promise<PaginatedResponse<WebConfigCardItems>>;
    },

    // Get category-specific websites
    getCategoryWebsites: async (
        initialCategory: string,
        page: number = 1,
        limit: number = 20,
        params: Omit<GetWebsitesParams, 'page' | 'limit' | 'noPagination' | 'initialCategory' | 'category'> = {}
    ): Promise<PaginatedResponse<WebConfigCardItems>> => {
        return webService.getWebsites<WebConfigCardItems>({
            ...params,
            initialCategory,
            page,
            limit,
            noPagination: false,
        }) as Promise<PaginatedResponse<WebConfigCardItems>>;
    },

    // Get all filter options
    getFilterOptions: async (): Promise<FilterOptionsResponse> => {
        // Using HEAD method as shown in your API implementation
        const response = await fetch('/api/websites', {
            method: 'HEAD',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch filter options');
        }

        return response.json();
    },

    // Get a specific website by ID
    getWebsiteById: async (id: string): Promise<WebConfigCardItems> => {
        const response = await fetch(`/api/websites/${id}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch website');
        }

        return response.json();
    },

    // Create a new website
    createWebsite: async (website: WebConfigCardItems): Promise<WebConfigCardItems> => {
        const response = await fetch('/api/websites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(website),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create website');
        }

        return response.json();
    },

    // Update an existing website
    updateWebsite: async (id: string, website: Partial<WebConfigCardItems>): Promise<WebConfigCardItems> => {
        const response = await fetch(`/api/websites/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...website,
                id: id, // Ensure ID is included in the update
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update website');
        }

        const result = await response.json();
        return result.item || result;
    },

    // Delete a website
    deleteWebsite: async (id: string): Promise<{ success: boolean; deletedItem: WebConfigCardItems }> => {
        const response = await fetch(`/api/websites/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete website');
        }

        return response.json();
    },
};
