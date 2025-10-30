'use client';
import dynamic from 'next/dynamic';
const WebsitesBuilder = dynamic(() => import('../../../components/website-builder/WebsitesBuilder'), {
    ssr: false,
});

export default function AddWebsitePage() {
    return <WebsitesBuilder />;
}
