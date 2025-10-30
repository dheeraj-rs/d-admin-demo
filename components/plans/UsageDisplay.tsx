'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import {
    HardDrive,
    Zap,
    Download,
    FileText,
    Globe,
    AlertTriangle,
    TrendingUp,
    Calendar,
    LogOut
} from 'lucide-react';
import { logoutAndRedirect } from '../../lib/auth-logout';

interface UsageData {
    plan: string;
    features: string[];
    usage: {
        apiCalls: { used: number; limit: number; remaining: number };
        storage: { used: number; limit: number; remaining: number };
        downloads: { used: number; limit: number; remaining: number };
        pages: { used: number; limit: number; remaining: number };
    };
    isPlanActive: boolean;
    planEndDate?: string;
}

interface UsageDisplayProps {
    onUpgrade?: () => void;
}

export default function UsageDisplay({ onUpgrade }: UsageDisplayProps) {
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsageData();
    }, []);

    const fetchUsageData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/account/usage', {
                credentials: 'include', // Ensure cookies are sent
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                // Authentication failed - user needs to login again
                console.error('Authentication failed - redirecting to login');
                setError('Session expired. Please login again.');
                
                // Wait a moment before redirecting to show the error
                setTimeout(() => {
                    logoutAndRedirect('/');
                }, 2000);
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch usage data');
            }

            setUsageData(data.usage);
        } catch (error) {
            console.error('Error fetching usage data:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch usage data';
            setError(errorMessage);
            
            // If it's a network error, might be authentication issue
            if (errorMessage.includes('Failed to fetch')) {
                setTimeout(() => {
                    logoutAndRedirect('/');
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getUsagePercentage = (used: number, limit: number) => {
        if (limit === 0) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getUsageStatus = (used: number, limit: number) => {
        const percentage = getUsagePercentage(used, limit);
        if (percentage >= 90) return 'critical';
        if (percentage >= 75) return 'warning';
        return 'good';
    };

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !usageData) {
        return (
            <div className="w-full max-w-4xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Failed to load usage data'}
                        {error?.includes('Session expired') && (
                            <div className="mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => logoutAndRedirect('/')}
                                    className="ml-2"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Login Again
                                </Button>
                            </div>
                        )}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const usageItems = [
        {
            title: 'API Calls',
            icon: Zap,
            used: usageData.usage.apiCalls.used,
            limit: usageData.usage.apiCalls.limit,
            remaining: usageData.usage.apiCalls.remaining,
            unit: 'calls'
        },
        {
            title: 'Storage',
            icon: HardDrive,
            used: usageData.usage.storage.used,
            limit: usageData.usage.storage.limit,
            remaining: usageData.usage.storage.remaining,
            unit: 'MB',
            format: formatBytes
        },
        {
            title: 'Downloads',
            icon: Download,
            used: usageData.usage.downloads.used,
            limit: usageData.usage.downloads.limit,
            remaining: usageData.usage.downloads.remaining,
            unit: 'downloads'
        },
        {
            title: 'Pages',
            icon: FileText,
            used: usageData.usage.pages.used,
            limit: usageData.usage.pages.limit,
            remaining: usageData.usage.pages.remaining,
            unit: 'pages'
        }
    ];

    const criticalItems = usageItems.filter(item =>
        getUsageStatus(item.used, item.limit) === 'critical'
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Usage Overview
                        </h2>
                        <p className="text-gray-600">
                            Current plan: <Badge variant="outline">{usageData.plan}</Badge>
                        </p>
                    </div>
                    {onUpgrade && (
                        <Button onClick={onUpgrade} variant="outline">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Upgrade Plan
                        </Button>
                    )}
                </div>

                {!usageData.isPlanActive && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Your plan has expired. Please upgrade to continue using the service.
                        </AlertDescription>
                    </Alert>
                )}

                {criticalItems.length > 0 && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            You&apos;re approaching limits for: {criticalItems.map(item => item.title).join(', ')}.
                            Consider upgrading your plan.
                        </AlertDescription>
                    </Alert>
                )}

                {usageData.planEndDate && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        Plan expires: {new Date(usageData.planEndDate).toLocaleDateString()}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {usageItems.map((item) => {
                    const percentage = getUsagePercentage(item.used, item.limit);
                    const status = getUsageStatus(item.used, item.limit);
                    const color = getUsageColor(percentage);
                    const displayUsed = item.format ? item.format(item.used) : item.used;
                    const displayLimit = item.format ? item.format(item.limit) : item.limit;

                    return (
                        <Card key={item.title} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <item.icon className="w-5 h-5 text-gray-600 mr-2" />
                                        <CardTitle className="text-sm font-medium">
                                            {item.title}
                                        </CardTitle>
                                    </div>
                                    {status === 'critical' && (
                                        <Badge variant="destructive" className="text-xs">
                                            Critical
                                        </Badge>
                                    )}
                                    {status === 'warning' && (
                                        <Badge variant="secondary" className="text-xs">
                                            Warning
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-xs">
                                    {displayUsed} / {displayLimit} {item.unit}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    <Progress
                                        value={percentage}
                                        className="h-2"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>{Math.round(percentage)}% used</span>
                                        <span>{item.remaining} remaining</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Plan Features</CardTitle>
                        <CardDescription>
                            Features available in your current plan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {usageData.features.map((feature, index) => (
                                <div key={index} className="flex items-center text-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
