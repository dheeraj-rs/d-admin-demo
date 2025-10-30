import { ElementCodeEditorData, ESaveData } from '../types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch a code element by ID
 */
export const useGetElement = (id?: string, p0?: { staleTime: number; refetchOnWindowFocus: boolean; }) => {
  return useQuery<ElementCodeEditorData>({
    queryKey: ['code-element', id],
    queryFn: async () => {
      if (!id) return null;

      const response = await fetch(`/api/code-library/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch element');
      }
      return response.json();
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch all code elements with pagination and filtering
 */
export const useGetAllElements = (page: number, limit: number, filters: Record<string, any>) => {
  return useQuery<{ pagination: any; data: ElementCodeEditorData[] }>({
    queryKey: ['code-elements', page, limit, filters],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      // Add all non-empty filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/code-library?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch elements: ${response.status}`);
      }
      return response.json();
    },
  });
};

/**
 * Hook to save a new code element
 */
export const useSaveElement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (elementData: ESaveData) => {
      const response = await fetch('/api/code-library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elementData),
      });

      if (!response.ok) {
        let errorMessage = `Failed to save code element: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['code-elements'] });
      return data;
    },
  });
};

/**
 * Hook to update an existing code element
 */
export const useUpdateElement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, elementData }: { id: string; elementData: ESaveData }) => {
      if (!id) throw new Error('No element ID provided for update');

      const response = await fetch(`/api/code-library/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(elementData),
      });

      if (!response.ok) {
        let errorMessage = `Failed to update code element: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['code-element', variables.id] });
      return data;
    },
  });
};

/**
 * Hook to delete a code element
 */
export const useDeleteElement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error('No element ID provided for deletion');

      const response = await fetch(`/api/code-library/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = `Failed to delete code element: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code-elements'] });
    },
  });
};