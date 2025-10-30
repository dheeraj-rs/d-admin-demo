'use client';

import { useEffect, useState } from 'react';
import { usePreferences } from '../../../components/providers/PreferencesProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
    Palette,
    Globe,
    Layout,
    Settings,
    Zap,
    Shield,
    Download,
    Upload,
    Eye,
    Code
} from 'lucide-react';

export default function FreeAccessPage() {
    const { preferences, updatePreferences, setTheme, setLanguage, setLayout } = usePreferences();
    const [sessionId, setSessionId] = useState<string>('');

    useEffect(() => {
        // Generate session ID for anonymous user
        const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        setSessionId(id);
    }, []);

    const handleThemeChange = async (themeName: string) => {
        await setTheme({ name: themeName });
    };

    const handleLanguageChange = async (languageCode: string) => {
        await setLanguage({ code: languageCode });
    };

    const handleLayoutChange = async (layout: Partial<NonNullable<typeof preferences>['layout']>) => {
        await setLayout(layout);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome to D-Admin
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Free access to website building and management tools
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="text-sm">
                                FREE Access
                            </Badge>
                            <Button variant="outline">
                                Sign In for More Features
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Quick Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <Palette className="w-5 h-5 mr-2" />
                                Theme Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Current Theme</label>
                                    <p className="text-sm text-gray-600">{preferences?.theme?.name || 'lara-light-indigo'}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant={preferences?.theme?.name === 'lara-light-indigo' ? 'default' : 'outline'}
                                        onClick={() => handleThemeChange('lara-light-indigo')}
                                    >
                                        Light
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={preferences?.theme?.name === 'd-admin-dark' ? 'default' : 'outline'}
                                        onClick={() => handleThemeChange('d-admin-dark')}
                                    >
                                        Dark
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <Globe className="w-5 h-5 mr-2" />
                                Language
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Current Language</label>
                                    <p className="text-sm text-gray-600">{preferences?.language?.code?.toUpperCase() || 'EN'}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant={preferences?.language?.code === 'en' ? 'default' : 'outline'}
                                        onClick={() => handleLanguageChange('en')}
                                    >
                                        English
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={preferences?.language?.code === 'es' ? 'default' : 'outline'}
                                        onClick={() => handleLanguageChange('es')}
                                    >
                                        Español
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                                <Layout className="w-5 h-5 mr-2" />
                                Layout
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Grid Size</label>
                                    <p className="text-sm text-gray-600 capitalize">{preferences?.layout?.gridSize || 'medium'}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        size="sm"
                                        variant={preferences?.layout?.gridSize === 'small' ? 'default' : 'outline'}
                                        onClick={() => handleLayoutChange({ gridSize: 'small' })}
                                    >
                                        Small
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={preferences?.layout?.gridSize === 'medium' ? 'default' : 'outline'}
                                        onClick={() => handleLayoutChange({ gridSize: 'medium' })}
                                    >
                                        Medium
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={preferences?.layout?.gridSize === 'large' ? 'default' : 'outline'}
                                        onClick={() => handleLayoutChange({ gridSize: 'large' })}
                                    >
                                        Large
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Free Features */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center">
                                    <Eye className="w-5 h-5 mr-2" />
                                    View Elements
                                </CardTitle>
                                <CardDescription>
                                    Browse and preview UI elements
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Browse Elements
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center">
                                    <Code className="w-5 h-5 mr-2" />
                                    Basic Builder
                                </CardTitle>
                                <CardDescription>
                                    Simple website builder
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Start Building
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center">
                                    <Download className="w-5 h-5 mr-2" />
                                    Download
                                </CardTitle>
                                <CardDescription>
                                    Download your creations
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Download
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center">
                                    <Settings className="w-5 h-5 mr-2" />
                                    Settings
                                </CardTitle>
                                <CardDescription>
                                    Customize your experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    Open Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Upgrade Prompt */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center text-blue-900">
                            <Zap className="w-5 h-5 mr-2" />
                            Unlock More Features
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            Get access to advanced features, unlimited downloads, and priority support
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-4">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Upgrade to PRO
                            </Button>
                            <Button variant="outline" className="border-blue-300 text-blue-700">
                                Learn More
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Session Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Session ID: {sessionId}</p>
                    <p>Your preferences are automatically saved and will be restored on your next visit.</p>
                </div>
            </div>
        </div>
    );
}
