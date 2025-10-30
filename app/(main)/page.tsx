import { generateMetadata } from '../../lib/metadata';
import { Metadata } from 'next';
import DashboardClient from '../../components/dashboard/DashboardClient';

// Generate metadata for the dashboard page
export const metadata: Metadata = generateMetadata({
    title: 'Dashboard - D-Admin | Website Builder & Management',
    description: 'Manage your websites, view analytics, and access powerful tools with the D-Admin dashboard. Monitor performance, track user engagement, and control your web presence.',
    keywords: 'dashboard, website management, analytics, performance monitoring, user engagement, website builder dashboard',
    canonical: '/',
    ogType: 'website',
});

// Server-side data fetching function
async function getDashboardData() {
    try {
        // This would be your server-side data fetching logic
        // For now, we'll return null and let the client handle it
        return null;
    } catch (error) {
        console.error('Error fetching dashboard data on server:', error);
        return null;
    }
}

export default async function Dashboard() {
    // Fetch data on the server side
    const initialData = await getDashboardData();

    return <DashboardClient initialData={initialData} />;
}
