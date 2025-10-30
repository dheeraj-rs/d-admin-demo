// 'use client';

// import { usePlanAuth } from '../../../hooks/usePlanAuth';
// import PlanRouteGuard from '../../../components/auth/PlanRouteGuard';
// import UsageDisplay from '../../../components/plans/UsageDisplay';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
// import { Button } from '../../../components/ui/button';
// import { Badge } from '../../../components/ui/badge';
// import { User, Building2, Calendar, Zap, HardDrive, Download } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// export default function DashboardPage() {
//     const { authData, logout } = usePlanAuth();
//     const router = useRouter();

//     const handleUpgrade = () => {
//         router.push('/upgrade');
//     };

//     const handleLogout = () => {
//         logout();
//         router.push('/select-superadmin');
//     };

//     return (
//         <PlanRouteGuard>
//             <div className="min-h-screen bg-gray-50">
//                 <div className="max-w-7xl mx-auto px-4 py-8">
//                     {/* Header */}
//                     <div className="mb-8">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h1 className="text-3xl font-bold text-gray-900">
//                                     Welcome back, {authData?.name}!
//                                 </h1>
//                                 <p className="text-gray-600 mt-2">
//                                     Manage your account and explore features
//                                 </p>
//                             </div>
//                             <div className="flex items-center space-x-4">
//                                 <Badge variant="outline" className="text-sm">
//                                     {authData?.plan} Plan
//                                 </Badge>
//                                 <Button variant="outline" onClick={handleLogout}>
//                                     Sign Out
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Account Info */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                         <Card>
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-lg flex items-center">
//                                     <User className="w-5 h-5 mr-2" />
//                                     Account Info
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="space-y-2">
//                                     <div className="flex justify-between">
//                                         <span className="text-sm text-gray-600">Email:</span>
//                                         <span className="text-sm font-medium">{authData?.email}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-sm text-gray-600">Plan:</span>
//                                         <Badge variant="secondary">{authData?.plan}</Badge>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-sm text-gray-600">Status:</span>
//                                         <Badge variant={authData?.isPlanActive ? "default" : "destructive"}>
//                                             {authData?.isPlanActive ? "Active" : "Inactive"}
//                                         </Badge>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-lg flex items-center">
//                                     <Building2 className="w-5 h-5 mr-2" />
//                                     Organization
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="space-y-2">
//                                     <div className="flex justify-between">
//                                         <span className="text-sm text-gray-600">Database:</span>
//                                         <span className="text-sm font-medium">{authData?.databaseName}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-sm text-gray-600">SuperAdmin ID:</span>
//                                         <span className="text-sm font-medium">{authData?.superAdminId}</span>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-lg flex items-center">
//                                     <Calendar className="w-5 h-5 mr-2" />
//                                     Plan Details
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="space-y-2">
//                                     {authData?.planEndDate && (
//                                         <div className="flex justify-between">
//                                             <span className="text-sm text-gray-600">Expires:</span>
//                                             <span className="text-sm font-medium">
//                                                 {new Date(authData.planEndDate).toLocaleDateString()}
//                                             </span>
//                                         </div>
//                                     )}
//                                     <div className="flex justify-between">
//                                         <span className="text-sm text-gray-600">Features:</span>
//                                         <span className="text-sm font-medium">{authData?.features.length}</span>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>

//                     {/* Usage Overview */}
//                     <div className="mb-8">
//                         <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Overview</h2>
//                         <UsageDisplay onUpgrade={handleUpgrade} />
//                     </div>

//                     {/* Quick Actions */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                         <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-lg flex items-center">
//                                     <Zap className="w-5 h-5 mr-2" />
//                                     API Access
//                                 </CardTitle>
//                                 <CardDescription>
//                                     Manage your API usage and limits
//                                 </CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 <Button variant="outline" className="w-full">
//                                     View API Dashboard
//                                 </Button>
//                             </CardContent>
//                         </Card>

//                         <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-lg flex items-center">
//                                     <HardDrive className="w-5 h-5 mr-2" />
//                                     Storage
//                                 </CardTitle>
//                                 <CardDescription>
//                                     Monitor your storage usage
//                                 </CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 <Button variant="outline" className="w-full">
//                                     View Storage
//                                 </Button>
//                             </CardContent>
//                         </Card>

//                         <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-lg flex items-center">
//                                     <Download className="w-5 h-5 mr-2" />
//                                     Downloads
//                                 </CardTitle>
//                                 <CardDescription>
//                                     Track your download activity
//                                 </CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 <Button variant="outline" className="w-full">
//                                     View Downloads
//                                 </Button>
//                             </CardContent>
//                         </Card>

//                         <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//                             <CardHeader className="pb-3">
//                                 <CardTitle className="text-lg flex items-center">
//                                     <Calendar className="w-5 h-5 mr-2" />
//                                     Upgrade Plan
//                                 </CardTitle>
//                                 <CardDescription>
//                                     Unlock more features and limits
//                                 </CardDescription>
//                             </CardHeader>
//                             <CardContent>
//                                 <Button onClick={handleUpgrade} className="w-full">
//                                     Upgrade Now
//                                 </Button>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             </div>
//         </PlanRouteGuard>
//     );
// }

import { generateMetadata } from '../../../lib/metadata';
import { Metadata } from 'next';
import DashboardClient from '../../../components/dashboard/DashboardClient';

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

