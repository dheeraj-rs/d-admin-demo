'use client';

import dynamic from 'next/dynamic';

interface ElementsClientProps {
    initialData?: any;
}

const Maintenance = dynamic(() => import('../error-pages/maintenance'), {
    ssr: false,
});

export default function ElementsClient({ initialData }: ElementsClientProps) {
    return <Maintenance />;
} 