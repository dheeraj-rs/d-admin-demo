'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Eye, EyeOff, Shield, Mail, FileText, Database, Key, Settings, CreditCard, Users, BarChart, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PinProtectionModal from './PinProtectionModal';
import '../../styles/components/pin-protection-settings.scss';

interface ProtectedPage {
    pagePath: string;
    pageName: string;
    isEnabled: boolean;
    icon?: string;
    category?: string;
}

interface PinSettings {
    isPinEnabled: boolean;
    hasPinSet: boolean;
    protectedPages: ProtectedPage[];
}

// Available pages that can be protected
const AVAILABLE_PAGES = [
    { pagePath: '/emails', pageName: 'Email Accounts', icon: 'Mail', category: 'sensitive' },
    { pagePath: '/admin-keys', pageName: 'Admin Keys', icon: 'Key', category: 'sensitive' },
    { pagePath: '/document', pageName: 'Documents', icon: 'FileText', category: 'content' },
    { pagePath: '/ai-websites', pageName: 'AI Websites', icon: 'Database', category: 'content' },
    { pagePath: '/code-library', pageName: 'Code Library', icon: 'Database', category: 'content' },
    { pagePath: '/users', pageName: 'User Management', icon: 'Users', category: 'admin' },
    { pagePath: '/analytics', pageName: 'Analytics', icon: 'BarChart', category: 'admin' },
    { pagePath: '/billing', pageName: 'Billing & Payments', icon: 'CreditCard', category: 'sensitive' },
];

const PinProtectionSettings: React.FC = () => {
    const [settings, setSettings] = useState<PinSettings>({
        isPinEnabled: false,
        hasPinSet: false,
        protectedPages: []
    });
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/pin-settings');
            const data = await response.json();

            if (data.success) {
                // Merge with available pages
                const mergedPages = AVAILABLE_PAGES.map(page => {
                    const existing = data.data.protectedPages.find(
                        (p: ProtectedPage) => p.pagePath === page.pagePath
                    );
                    return existing || { ...page, isEnabled: false };
                });

                setSettings({
                    ...data.data,
                    protectedPages: mergedPages
                });
            } else {
                toast.error(data.error || 'Failed to load PIN settings');
            }
        } catch (error) {
            console.error('Error fetching PIN settings:', error);
            toast.error('Failed to load PIN settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPin = async () => {
        if (!newPin || !confirmPin) {
            toast.error('Please enter PIN in both fields');
            return;
        }

        if (newPin.length < 4) {
            toast.error('PIN must be at least 4 digits');
            return;
        }

        if (newPin !== confirmPin) {
            toast.error('PINs do not match');
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch('/api/pin-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pin: newPin,
                    isPinEnabled: settings.isPinEnabled,
                    protectedPages: settings.protectedPages
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('PIN set successfully!');
                setNewPin('');
                setConfirmPin('');
                setSettings(prev => ({ ...prev, hasPinSet: true }));
                fetchSettings();
            } else {
                toast.error(data.error || 'Failed to set PIN');
            }
        } catch (error) {
            console.error('Error setting PIN:', error);
            toast.error('Failed to set PIN');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemovePin = async () => {
        if (!confirm('Are you sure you want to remove PIN protection? This will disable all page protections.')) {
            return;
        }

        try {
            setIsSaving(true);
            const response = await fetch('/api/pin-settings', {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                toast.success('PIN removed successfully!');
                setNewPin('');
                setConfirmPin('');
                fetchSettings();
            } else {
                toast.error(data.error || 'Failed to remove PIN');
            }
        } catch (error) {
            console.error('Error removing PIN:', error);
            toast.error('Failed to remove PIN');
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoading) {
        return (
            <div className="pin-protection-settings loading">
                <div className="spinner"></div>
                <p>Loading PIN settings...</p>
            </div>
        );
    }

    return (
        <div className="pin-protection-settings">
            <div className="settings-header">
                <div className="header-icon">
                    <Shield size={24} />
                </div>
                <div className="header-content">
                    <h3>PIN Protection</h3>
                    <p>Secure sensitive pages with PIN authentication</p>
                </div>
            </div>

            {/* PIN Setup Section */}
            <div className="settings-section">
                <div className="section-header">
                    <Lock size={20} />
                    <h4>PIN Configuration</h4>
                </div>

                <div className="pin-status">
                    {settings.hasPinSet ? (
                        <div className="status-badge success">
                            <CheckCircle size={16} />
                            <span>PIN is set</span>
                        </div>
                    ) : (
                        <div className="status-badge warning">
                            <AlertCircle size={16} />
                            <span>No PIN set</span>
                        </div>
                    )}
                </div>

                <div className="pin-inputs">
                    <div className="input-group">
                        <label>New PIN (4-8 digits)</label>
                        <div className="input-with-icon">
                            <input
                                type={showPin ? 'text' : 'password'}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="Enter new PIN"
                                maxLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPin(!showPin)}
                                className="toggle-visibility"
                            >
                                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Confirm PIN</label>
                        <div className="input-with-icon">
                            <input
                                type={showConfirmPin ? 'text' : 'password'}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="Confirm new PIN"
                                maxLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPin(!showConfirmPin)}
                                className="toggle-visibility"
                            >
                                {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pin-actions">
                    <button
                        onClick={handleSetPin}
                        disabled={isSaving || !newPin || !confirmPin}
                        className="btn-primary"
                    >
                        <Save size={18} />
                        {settings.hasPinSet ? 'Change PIN' : 'Set PIN'}
                    </button>

                    {settings.hasPinSet && (
                        <button
                            onClick={handleRemovePin}
                            disabled={isSaving}
                            className="btn-danger"
                        >
                            <Trash2 size={18} />
                            Remove PIN
                        </button>
                    )}
                </div>
            </div>

            {/* Configure Protected Pages */}
            {settings.hasPinSet && (
                <button
                    className="configure-pages-button"
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="button-content">
                        <Shield size={24} />
                        <div className="button-text">
                            <h4>Configure Protected Pages</h4>
                            <p>Manage PIN protection for individual pages</p>
                        </div>
                    </div>
                    <div className="button-arrow">→</div>
                </button>
            )}

            {/* Modal */}
            <PinProtectionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchSettings(); // Refresh settings when modal closes
                }}
            />
        </div>
    );
};

export default PinProtectionSettings;
