// service/WebsiteService.ts
import { SectionCodeProps } from '../components/website-builder/store/websiteBuilderStore';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

// ========================= TYPES =========================

export interface SnippetWebsite {
  _id: string;
  name: string;
  websiteType: string;
  paymentType: string;
  paymentAmount: number;
  publishedUrl: string;
  author: string;
  version: string;
  support: string;
  thumbnail: string;
  screenshots: string[];
  features: string[];
  technologies: string[];
  description: string;
  longDescription: string;
  snippet: SectionCodeProps[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebsiteData {
  name: string;
  websiteType: string;
  paymentType: string;
  paymentAmount?: number;
  publishedUrl?: string;
  author?: string;
  version?: string;
  support?: string;
  thumbnail?: string;
  screenshots?: string[];
  features?: string[];
  technologies?: string[];
  description?: string;
  longDescription?: string;
  snippet?: SectionCodeProps[];
}

export interface UpdateWebsiteData extends Partial<CreateWebsiteData> {}

export interface GetWebsitesParams {
  page?: number;
  limit?: number;
  search?: string;
  websiteType?: string;
  paymentType?: string;
  author?: string;
  minPaymentAmount?: number;
  maxPaymentAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  currentItems:number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface GetWebsitesResponse {
  success: boolean;
  data: SnippetWebsite[];
  pagination: PaginationInfo;
  filters: GetWebsitesParams;
  timestamp: string;
}

export interface SingleWebsiteResponse {
  success: boolean;
  data: SnippetWebsite;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string[];
  timestamp: string;
}

// ========================= API FUNCTIONS =========================

const API_BASE_URL = '/api/snippet-website';

// Create Website
const createWebsite = async (data: CreateWebsiteData): Promise<SnippetWebsite> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create website');
  }

  return response.json();
};

// Get Websites (with pagination, search, filters)
const getWebsites = async (params: GetWebsitesParams = {}): Promise<GetWebsitesResponse> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}?${searchParams.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch websites');
  }

  return response.json();
};

// Get Single Website
const getWebsite = async (id: string): Promise<SingleWebsiteResponse> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch website');
  }

  return response.json();
};

// Update Website
const updateWebsite = async ({ id, data }: { id: string; data: UpdateWebsiteData }): Promise<SingleWebsiteResponse> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update website');
  }

  return response.json();
};

// Delete Website
const deleteWebsite = async (id: string): Promise<SingleWebsiteResponse> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete website');
  }

  return response.json();
};

// ========================= REACT QUERY HOOKS =========================

// Query Keys
export const websiteKeys = {
  all: ['websites'] as const,
  lists: () => [...websiteKeys.all, 'list'] as const,
  list: (params: GetWebsitesParams) => [...websiteKeys.lists(), params] as const,
  details: () => [...websiteKeys.all, 'detail'] as const,
  detail: (id: string) => [...websiteKeys.details(), id] as const,
};

// Get Websites Hook
export const useGetWebsites = (
  params: GetWebsitesParams = {},
  options?: UseQueryOptions<GetWebsitesResponse, Error>
) => {
  return useQuery({
    queryKey: websiteKeys.list(params),
    queryFn: () => getWebsites(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Get Single Website Hook
export const useGetWebsite = (
  id: string,
  options?: UseQueryOptions<SingleWebsiteResponse, Error>
) => {
  return useQuery({
    queryKey: websiteKeys.detail(id),
    queryFn: () => getWebsite(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Create Website Hook
export const useCreateWebsite = (
  options?: UseMutationOptions<SnippetWebsite, Error, CreateWebsiteData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWebsite,
    onSuccess: () => {
      // Invalidate and refetch website lists
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
    },
    ...options,
  });
};

// Update Website Hook
export const useUpdateWebsite = (
  options?: UseMutationOptions<SingleWebsiteResponse, Error, { id: string; data: UpdateWebsiteData }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWebsite,
    onSuccess: (data, variables) => {
      // Invalidate and refetch website lists
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
      // Update the specific website cache
      queryClient.setQueryData(websiteKeys.detail(variables.id), data);
    },
    ...options,
  });
};

// Delete Website Hook
export const useDeleteWebsite = (
  options?: UseMutationOptions<SingleWebsiteResponse, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWebsite,
    onSuccess: (data, id) => {
      // Invalidate and refetch website lists
      queryClient.invalidateQueries({ queryKey: websiteKeys.lists() });
      // Remove the specific website from cache
      queryClient.removeQueries({ queryKey: websiteKeys.detail(id) });
    },
    ...options,
  });
};

// ========================= UTILITY HOOKS =========================

// Prefetch Website
export const usePrefetchWebsite = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: websiteKeys.detail(id),
      queryFn: () => getWebsite(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Invalidate All Website Queries
export const useInvalidateWebsites = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: websiteKeys.all });
  };
};

// ========================= EXPORT ALL =========================

export const WebsiteService = {
  // API Functions
  createWebsite,
  getWebsites,
  getWebsite,
  updateWebsite,
  deleteWebsite,
  
  // React Query Hooks
  useGetWebsites,
  useGetWebsite,
  useCreateWebsite,
  useUpdateWebsite,
  useDeleteWebsite,
  usePrefetchWebsite,
  useInvalidateWebsites,
  
  // Query Keys
  websiteKeys,
};

export default WebsiteService;