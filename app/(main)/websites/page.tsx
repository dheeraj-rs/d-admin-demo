import { generateMetadata } from '../../../lib/metadata';
import { Metadata } from 'next';
import WebsitesClient from '../../../components/websites/WebsitesClient';

// Generate metadata for the websites page
export const metadata: Metadata = generateMetadata({
    title: 'Websites - D-Admin | Manage Your Web Projects',
    description: 'Browse and manage all your websites in one place. View analytics, edit content, and monitor performance across all your web projects.',
    keywords: 'websites, web projects, website management, website analytics, website performance, web development projects',
    canonical: '/websites',
    ogType: 'website',
});

// Server-side data fetching function
async function getWebsitesData() {
    try {
        // This would be your server-side data fetching logic
        // For now, we'll return null and let the client handle it
        return null;
    } catch (error) {
        console.error('Error fetching websites data on server:', error);
        return null;
    }
}

export default async function Websites() {
    // Fetch data on the server side
    const initialData = await getWebsitesData();

    return <WebsitesClient initialData={initialData} />;
}
