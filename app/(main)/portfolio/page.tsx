import { generateMetadata } from '../../../lib/metadata';
import { Metadata } from 'next';
import PortfolioClient from '../../../components/portfolio/PortfolioClient';

// Generate metadata for the portfolio page
export const metadata: Metadata = generateMetadata({
    title: 'Portfolio - D-Admin | Professional Web Development Projects',
    description: 'Explore our portfolio of professional web development projects. See examples of websites, applications, and digital solutions we\'ve created for clients.',
    keywords: 'portfolio, web development projects, website examples, professional projects, web applications',
    canonical: '/portfolio',
    ogType: 'website',
});

// Server-side data fetching function
async function getPortfolioData() {
    try {
        // This would be your server-side data fetching logic
        return null;
    } catch (error) {
        console.error('Error fetching portfolio data on server:', error);
        return null;
    }
}

export default async function Portfolio() {
    // Fetch data on the server side
    const initialData = await getPortfolioData();

    return <PortfolioClient initialData={initialData} />;
}
