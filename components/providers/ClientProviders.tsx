'use client';

import { LayoutProvider } from '../../layout/context/LayoutContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

interface ClientProvidersProps {
    children: ReactNode;
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});

export default function ClientProviders({ children }: ClientProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <LayoutProvider>{children}</LayoutProvider>
        </QueryClientProvider>
    );
} 