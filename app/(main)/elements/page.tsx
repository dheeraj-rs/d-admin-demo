import { generateMetadata } from '../../../lib/metadata';
import { Metadata } from 'next';
import ElementsClient from '../../../components/elements/ElementsClient';

// Generate metadata for the elements page
export const metadata: Metadata = generateMetadata({
    title: 'Elements - D-Admin | Website Components & Templates',
    description: 'Browse and use professional website elements, components, and templates. Create stunning websites with our comprehensive library of UI elements.',
    keywords: 'website elements, UI components, templates, website builder components, web design elements',
    canonical: '/elements',
    ogType: 'website',
});

// Server-side data fetching function
async function getElementsData() {
    try {
        // This would be your server-side data fetching logic
        return null;
    } catch (error) {
        console.error('Error fetching elements data on server:', error);
        return null;
    }
}

export default async function Elements() {
    // Fetch data on the server side
    const initialData = await getElementsData();

    return <ElementsClient initialData={initialData} />;
}