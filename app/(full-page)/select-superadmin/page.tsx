'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2, ChevronRight, Loader2, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import '../../../styles/admin-styles/admin-login.scss';

interface SuperAdmin {
    _id: string;
    organizationName: string;
    email: string;
    name: string;
    profilePicture?: string;
}

export default function SelectSuperAdminPage() {
    const router = useRouter();
    const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);

    useEffect(() => {
        fetchSuperAdmins();
    }, []);

    const fetchSuperAdmins = async () => {
        try {
            const response = await fetch('/api/auth/superadmins');
            const data = await response.json();

            if (data.success) {
                setSuperAdmins(data.superAdmins || []);
            } else {
                toast.error('Failed to load organizations');
            }
        } catch (error) {
            console.error('Error fetching SuperAdmins:', error);
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSuperAdmin = async (superAdminId: string, orgName: string) => {
        setSelecting(true);
        toast.loading(`Joining ${orgName}...`, { id: 'selecting' });

        try {
            // Store selection in localStorage for the auth flow
            localStorage.setItem('selectedSuperAdminId', superAdminId);

            toast.dismiss('selecting');
            toast.success(`Joined ${orgName}! Redirecting...`);

            // Redirect back to login with superAdminId in URL
            setTimeout(() => {
                router.push(`/account-login?superAdminId=${superAdminId}`);
            }, 1000);
        } catch (error) {
            console.error('Error selecting SuperAdmin:', error);
            toast.dismiss('selecting');
            toast.error('Failed to select organization');
            setSelecting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-login-page">
                <Toaster position="top-center" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="animate-spin mx-auto mb-4" size={40} />
                        <p className="text-lg">Loading organizations...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-login-page">
            <Toaster position="top-center" />

            <div className="bg-effects">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-container">
                <div className="login-header">
                    <div className="logo-container">
                        <Building2 size={48} className="logo-icon" />
                    </div>
                    <h1>Select Organization</h1>
                    <p className="subtitle">Choose an organization to join</p>
                </div>

                <div className="login-card">
                    <div className="card-content" style={{ padding: '2rem' }}>
                        {superAdmins.length === 0 ? (
                            <div className="text-center py-8">
                                <Shield size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 mb-2">No organizations available</p>
                                <p className="text-sm text-gray-500">Please contact an administrator</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {superAdmins.map((superAdmin) => (
                                    <button
                                        key={superAdmin._id}
                                        onClick={() => handleSelectSuperAdmin(superAdmin._id, superAdmin.organizationName)}
                                        disabled={selecting}
                                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {superAdmin.profilePicture ? (
                                                    <img
                                                        src={superAdmin.profilePicture}
                                                        alt={superAdmin.name}
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <Building2 size={24} className="text-blue-600" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{superAdmin.organizationName}</h3>
                                                    <p className="text-sm text-gray-500">{superAdmin.email}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="text-gray-400 group-hover:text-blue-500" size={20} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
