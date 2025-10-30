'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
const WebsitesBuilder = dynamic(() => import('../../../../components/website-builder/WebsitesBuilder'), {
    ssr: false,
});

export default function ECodePage() {
    const params = useParams();
    const id = params.id as string;

    return <WebsitesBuilder id={id} />;
}
