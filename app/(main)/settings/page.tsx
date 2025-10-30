'use client';

import { useState, useEffect } from 'react';
import {
    User,
    LogOut,
    Palette,
    Layout,
    Bell,
    Monitor,
    Moon,
    Sun,
    Smartphone,
    Tablet,
    EyeOff,
    Code,
    Zap,
    Database,
    Shield,
    Globe,
    Layers,
    Type,
    ChevronDown,
    Languages,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePageCache } from '../../../lib/pageCache';
import '../../../styles/components/cache-manager.scss';
import { RoleAccessInfo } from '../../../components/auth/RoleAccessInfo';
import { useAuth } from '../../../hooks/useAuth';
import { canUseSetting, UserRole } from '../../../lib/roles';
import { useLanguage, LanguageData } from '../../../lib/i18n';
import { ThemeCategory } from '../../../components/theme/ThemeCategory';
import { getCurrentUser } from '../../../lib/permissions';
import { useTheme } from '../../../components/theme/ThemeContext';

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; icon?: any }[];
    label: string;
}

const SettingsPage = () => {
    const router = useRouter();
    const { t, language, setLanguage, availableLanguages } = useLanguage();
    const { user: oldAuthUser } = useAuth();

    // Check both auth systems
    const superAdminUser = getCurrentUser();
    const authUser = superAdminUser || oldAuthUser;
    const role = (authUser?.role || 'user') as UserRole;
    const { pageCache, clearPageCache, clearExpiredCache, clearAllCache, getCacheInfo } = usePageCache() as any;
    const [isClearing, setIsClearing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [planDetails, setPlanDetails] = useState<{
        billingPeriod?: string;
        planEndDate?: string;
        isPlanActive?: boolean;
    }>({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch user data function (reusable)
    const fetchUser = async () => {
        try {
            console.log('🔄 Fetching user data from API...');

            // Force fresh data with timestamp to bypass all caching
            const timestamp = Date.now();
            const response = await fetch(`/api/auth/user?_t=${timestamp}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
            const data = await response.json();
            console.log('📦 User API response (fresh):', data);

            if (data.success && data.user) {
                console.log('✅ Setting currentUser:', data.user);
                setCurrentUser(data.user);

                // Set plan details
                setPlanDetails({
                    billingPeriod: data.user.billingPeriod,
                    planEndDate: data.user.planEndDate,
                    isPlanActive: data.user.isPlanActive,
                });

                // Also update localStorage to ensure consistency
                const userDataForStorage = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role || 'account',
                    plan: data.user.plan || 'FREE',
                    tier: data.user.tier || 'free', // Use tier directly from API
                    profilePicture: data.user.profilePicture,
                };
                localStorage.setItem('user', JSON.stringify(userDataForStorage));
                console.log('✅ localStorage updated with fresh user data:', userDataForStorage);
            } else {
                console.warn('⚠️ No user data in API response');
            }
        } catch (error) {
            console.error('❌ Error fetching user:', error);
        }
    };

    // Manual refresh handler
    const handleRefreshPlan = async () => {
        setIsRefreshing(true);
        await fetchUser();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // Fetch current user on mount
    useEffect(() => {
        fetchUser();
    }, []);

    // User state - initialize with defaults, will be updated when currentUser is fetched
    const [profile, setProfile] = useState({
        name: 'User',
        email: '',
        avatar: '/api/placeholder/80/80',
        role: 'user',
        tier: 'free', // Default, will be updated by useEffect
    });

    // Theme state
    const { layoutConfig, changeTheme } = useTheme();
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

    // Hydration-safe initialization - only read state, don't apply theme
    useEffect(() => {
        setIsMounted(true);

        // Load saved theme preference (read only, don't apply)
        const savedThemeMode = localStorage.getItem('themeMode') as 'light' | 'dark' | 'auto' | null;
        if (savedThemeMode) {
            setThemeMode(savedThemeMode);
        }

        // Detect system theme (for display purposes only)
        const initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setSystemTheme(initialTheme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Handle theme mode change
    const handleThemeModeChange = (mode: 'light' | 'dark' | 'auto') => {
        setThemeMode(mode);
        if (mode === 'auto') {
            // Use system theme when in auto mode
            const newTheme = systemTheme === 'dark' ? 'lara-dark-indigo' : 'lara-light-indigo';
            changeTheme(newTheme, systemTheme);
        } else {
            // Use the selected theme mode
            const newTheme = mode === 'dark' ? 'lara-dark-indigo' : 'lara-light-indigo';
            changeTheme(newTheme, mode);
        }

        // Save preference to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('themeMode', mode);
        }
    };

    // Filter themes based on selected mode
    const getFilteredThemes = (themes: any[]) => {
        if (themeMode === 'auto') {
            return themes.filter((t) => t.colorScheme === systemTheme);
        }
        return themes.filter((t) => t.colorScheme === themeMode);
    };

    // Layout state
    const [layout, setLayout] = useState({
        sidebar: 'left',
        headerStyle: 'fixed',
        contentWidth: 'full',
        viewMode: 'desktop',
        navigationStyle: 'horizontal',
        footerStyle: 'sticky',
    });

    // Notifications state
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        desktop: true,
        marketing: false,
        updates: true,
        comments: true,
        errors: true,
        deployment: true,
    });

    // Website controls
    const [websiteControls, setWebsiteControls] = useState({
        autoGenerate: true,
        showElementsPanel: true,
        developerMode: true,
        previewMode: false,
        autoSave: true,
        codeEditor: true,
        responsivePreview: true,
        gridSystem: true,
    });

    // Advanced settings
    const [advanced, setAdvanced] = useState({
        animationSpeed: 'normal',
        language: language,
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'decimal',
        codeTheme: themeMode === 'auto' ? systemTheme : themeMode,
        fontSize: 'medium',
        compactMode: false,
    });

    // SEO & Performance
    const [seoSettings, setSeoSettings] = useState({
        metaGeneration: true,
        sitemap: true,
        robotsTxt: true,
        imageOptimization: true,
        lazyLoading: true,
        minification: true,
        caching: true,
        analytics: false,
    });

    // Auto-save functionality
    useEffect(() => {
        const saveTimeout = setTimeout(() => { }, 1000);

        return () => clearTimeout(saveTimeout);
    }, [themeMode, systemTheme, layout, notifications, websiteControls, advanced, seoSettings]);

    // Update advanced.language when language changes
    useEffect(() => {
        setAdvanced(prev => ({ ...prev, language }));
    }, [language]);

    // Update profile when currentUser changes
    useEffect(() => {
        console.log('🔄 Profile update useEffect triggered, currentUser:', currentUser ? 'EXISTS' : 'NULL');

        if (currentUser) {
            console.log('👤 Updating profile with currentUser:', {
                name: currentUser.name,
                email: currentUser.email,
                plan: currentUser.plan,
                tier: currentUser.tier,
                role: currentUser.role,
            });

            // Map tier values to display names (User model uses: free, premium, enterprise)
            const tierToDisplayMap: Record<string, string> = {
                free: 'free',
                premium: 'pro',      // premium → pro for display
                enterprise: 'max',   // enterprise → max for display
            };

            // Handle both 'plan' (Account users) and 'tier' (legacy users)
            const userPlan = currentUser.plan || currentUser.tier || 'FREE';
            const userTier = currentUser.tier || 'free';

            console.log('🗺️ Tier mapping:', { userTier, beforeMapping: userTier });

            // Map tier for display (premium → pro, enterprise → max)
            const displayTier = tierToDisplayMap[userTier.toLowerCase()] || userTier.toLowerCase();

            console.log('🗺️ After mapping:', { displayTier });

            const newProfile = {
                name: currentUser.name || 'User',
                email: currentUser.email || '',
                avatar: currentUser.profilePicture || '/api/placeholder/80/80',
                role: currentUser.role || 'account',
                tier: displayTier, // Display tier (free, pro, max)
            };

            console.log('📝 Setting new profile:', newProfile);
            setProfile(newProfile);

            console.log('✅ Profile state updated:', {
                name: newProfile.name,
                email: newProfile.email,
                role: newProfile.role,
                tier: newProfile.tier,
                dbTier: userTier,
                originalPlan: userPlan,
            });
        } else {
            console.log('⚠️ currentUser is null/undefined, skipping profile update');
        }
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            // Call simple logout API
            await fetch('/api/auth/simple-logout', {
                method: 'POST',
            });

            // Set logout flags to prevent auto-login
            localStorage.setItem('prevent_auto_login', 'true');
            sessionStorage.setItem('logout_performed', 'true');

            // Redirect to home page
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            router.push('/');
        }
    };

    const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, label }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="custom-select-container">
                <label className="control-label">{label}</label>
                <div className="custom-select" onClick={() => setIsOpen(!isOpen)}>
                    <div className="select-value">
                        {options.find((opt) => opt.value === value)?.label || value}
                        <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
                    </div>
                    {isOpen && (
                        <div className="select-options">
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    className={`select-option ${value === option.value ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    {option.icon && <option.icon size={16} />}
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="children__wrapper settings-container__wrapper">
            <div className="settings-grid">
                {/* User Profile Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <User size={20} />
                            <span>{t('settings.userProfile')}</span>
                        </div>
                        <div className="card-badge">{t('common.account')}</div>
                    </div>

                    <div className="user-profile">
                        <div className="user-avatar">
                            {profile.avatar && profile.avatar !== '/api/placeholder/80/80' ? (
                                <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <User size={32} color="white" style={{ zIndex: 1 }} />
                            )}
                        </div>
                        <div className="user-info">
                            <h3>{profile.name}</h3>
                            <p>{profile.email}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                }}>
                                    {profile.role || 'ACCOUNT'}
                                </span>
                                <span style={{
                                    background: profile.tier === 'free' ? '#10b981' : profile.tier === 'pro' ? '#f59e0b' : profile.tier === 'max' ? '#8b5cf6' : '#10b981',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                }}>
                                    {(profile.tier || 'FREE').toUpperCase()} PLAN
                                </span>
                            </div>
                            {/* Plan Details */}
                            {planDetails.billingPeriod && (
                                <div style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-color-secondary)' }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        <strong>Billing:</strong> {planDetails.billingPeriod === 'yearly' ? '📅 Yearly (Save 17%)' : '📅 Monthly'}
                                    </div>
                                    {planDetails.planEndDate && (
                                        <div>
                                            <strong>Expires:</strong> {new Date(planDetails.planEndDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Refresh Plan Button */}
                    <button
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '16px',
                            background: isRefreshing ? '#6b7280' : 'var(--surface-border)',
                            color: 'var(--text-color)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: isRefreshing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                        }}
                        onClick={handleRefreshPlan}
                        disabled={isRefreshing}
                        onMouseEnter={(e) => {
                            if (!isRefreshing) {
                                e.currentTarget.style.background = 'var(--surface-hover)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isRefreshing) {
                                e.currentTarget.style.background = 'var(--surface-border)';
                            }
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{
                                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                            }}
                        >
                            <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                        </svg>
                        {isRefreshing ? 'Refreshing...' : 'Refresh Plan Data'}
                    </button>

                    <div className="control-group">
                        <label className="control-label">{t('user.displayName')}</label>
                        <input className="control-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>

                    <div className="control-group">
                        <label className="control-label">{t('user.email')}</label>
                        <input className="control-input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                    </div>

                    {/* Upgrade Plan Button */}
                    {profile.tier !== 'max' && (
                        <button
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginBottom: '12px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9375rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                            }}
                            onClick={() => router.push(`/upgrade?currentPlan=${profile.tier.toUpperCase()}`)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Zap size={16} />
                            Upgrade Plan
                        </button>
                    )}

                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} />
                        {t('user.logout')}
                    </button>
                </div>

                {/* Role Access Information */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Shield size={20} />
                            <span>{t('settings.roleAccess')}</span>
                        </div>
                        <div className="card-badge">{t('common.security')}</div>
                    </div>
                    <RoleAccessInfo />
                </div>

                {/* Language Settings */}
                {canUseSetting('language', role) && (
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Languages size={20} />
                                <span>{t('advanced.language')}</span>
                            </div>
                            <div className="card-badge">{t('common.system')}</div>
                        </div>

                        <div className="control-group">
                            <label className="control-label">{t('advanced.language')}</label>
                            <div className="language-options">
                                {availableLanguages.map((lang: LanguageData) => (
                                    <button
                                        key={lang.code}
                                        className={`language-option ${language === lang.code ? 'active' : ''}`}
                                        onClick={() => setLanguage(lang.code)}
                                    >
                                        <span className="language-flag">{lang.flag}</span>
                                        <div className="language-info">
                                            <span className="language-name">{lang.name}</span>
                                            <span className="language-native">{lang.nativeName}</span>
                                        </div>
                                        {language === lang.code && (
                                            <div className="language-check">✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Theme Controls */}
                {canUseSetting('theme', role) && (
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Palette size={20} />
                                <span>{t('settings.themeAppearance')}</span>
                            </div>
                            <div className="card-badge">{t('common.visual')}</div>
                        </div>

                        <div className="control-group">
                            <label className="control-label">{t('theme.themeMode')}</label>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${themeMode === 'light' ? 'active' : ''}`}
                                    onClick={() => handleThemeModeChange('light')}
                                    aria-label={t('theme.light')}
                                >
                                    <Sun size={14} />
                                    {t('theme.light')}
                                </button>
                                <button
                                    className={`toggle-btn ${themeMode === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleThemeModeChange('dark')}
                                    aria-label={t('theme.dark')}
                                >
                                    <Moon size={14} />
                                    {t('theme.dark')}
                                </button>
                                <button
                                    className={`toggle-btn ${themeMode === 'auto' ? 'active' : ''}`}
                                    onClick={() => handleThemeModeChange('auto')}
                                    aria-label={t('theme.auto')}
                                    title={t('theme.autoDescription')}
                                >
                                    <Monitor size={14} />
                                    {t('theme.auto')}
                                </button>
                            </div>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('theme.customTheme')}</div>
                                <div className="description">{t('theme.customThemeDesc')}</div>
                            </div>

                        </div>

                        <div className="theme-container">
                            <ThemeCategory
                                title={t('config.bootstrap')}
                                themes={getFilteredThemes([
                                    {
                                        theme: 'bootstrap4-light-blue',
                                        colorScheme: 'light',
                                        name: t('config.blue'),
                                        primary: '#0d6efd',
                                        secondary: '#f8f9fa',
                                        gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
                                    },
                                    {
                                        theme: 'bootstrap4-light-purple',
                                        colorScheme: 'light',
                                        name: t('config.purple'),
                                        primary: '#6f42c1',
                                        secondary: '#e9ecef',
                                        gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
                                    },
                                    {
                                        theme: 'bootstrap4-dark-blue',
                                        colorScheme: 'dark',
                                        name: t('config.blue'),
                                        primary: '#0d6efd',
                                        secondary: '#212529',
                                        gradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
                                    },
                                    {
                                        theme: 'bootstrap4-dark-purple',
                                        colorScheme: 'dark',
                                        name: t('config.purple'),
                                        primary: '#6f42c1',
                                        secondary: '#212529',
                                        gradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
                                    },
                                ])}
                            />
                            <ThemeCategory
                                title={t('config.materialDesign')}
                                themes={getFilteredThemes([
                                    {
                                        theme: 'md-light-indigo',
                                        colorScheme: 'light',
                                        name: t('config.indigo'),
                                        primary: '#3f51b5',
                                        secondary: '#ffffff',
                                        gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                                    },
                                    {
                                        theme: 'md-light-deeppurple',
                                        colorScheme: 'light',
                                        name: t('config.deepPurple'),
                                        primary: '#673ab7',
                                        secondary: '#ffffff',
                                        gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
                                    },
                                    {
                                        theme: 'md-dark-indigo',
                                        colorScheme: 'dark',
                                        name: t('config.indigo'),
                                        primary: '#3f51b5',
                                        secondary: '#212529',
                                        gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
                                    },
                                    {
                                        theme: 'md-dark-deeppurple',
                                        colorScheme: 'dark',
                                        name: t('config.deepPurple'),
                                        primary: '#673ab7',
                                        secondary: '#212529',
                                        gradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
                                    },
                                ])}
                            />
                            <ThemeCategory
                                title={t('config.customDesign')}
                                themes={getFilteredThemes([
                                    {
                                        theme: 'lara-light-indigo',
                                        colorScheme: 'light',
                                        name: t('config.indigo'),
                                        primary: '#6366f1',
                                        secondary: '#ffffff',
                                        gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                                    },
                                    {
                                        theme: 'lara-light-blue',
                                        colorScheme: 'light',
                                        name: t('config.blue'),
                                        primary: '#3b82f6',
                                        secondary: '#ffffff',
                                        gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
                                    },
                                    {
                                        theme: 'lara-light-purple',
                                        colorScheme: 'light',
                                        name: t('config.purple'),
                                        primary: '#8b5cf6',
                                        secondary: '#ffffff',
                                        gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
                                    },
                                    {
                                        theme: 'lara-light-teal',
                                        colorScheme: 'light',
                                        name: t('config.teal'),
                                        primary: '#14b8a6',
                                        secondary: '#ffffff',
                                        gradient: 'bg-gradient-to-r from-teal-500 to-teal-600',
                                    },
                                    {
                                        theme: 'lara-dark-indigo',
                                        colorScheme: 'dark',
                                        name: t('config.indigo'),
                                        primary: '#6366f1',
                                        secondary: '#1e1e1e',
                                        gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
                                    },
                                    {
                                        theme: 'lara-dark-blue',
                                        colorScheme: 'dark',
                                        name: t('config.blue'),
                                        primary: '#3b82f6',
                                        secondary: '#1e1e1e',
                                        gradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
                                    },
                                    {
                                        theme: 'lara-dark-purple',
                                        colorScheme: 'dark',
                                        name: t('config.purple'),
                                        primary: '#8b5cf6',
                                        secondary: '#1e1e1e',
                                        gradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
                                    },
                                    {
                                        theme: 'lara-dark-teal',
                                        colorScheme: 'dark',
                                        name: t('config.teal'),
                                        primary: '#14b8a6',
                                        secondary: '#1e1e1e',
                                        gradient: 'bg-gradient-to-r from-teal-600 to-teal-700',
                                    },
                                ])}
                            />
                        </div>
                    </div>
                )}

                {/* Layout Controls */}
                {canUseSetting('layout', role) && (
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Layout size={20} />
                                <span>{t('settings.layoutNavigation')}</span>
                            </div>
                            <div className="card-badge">{t('common.structure')}</div>
                        </div>

                        <div className="control-group">
                            <label className="control-label">{t('layout.sidebarPosition')}</label>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${layout.sidebar === 'left' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, sidebar: 'left' })}
                                >
                                    <Layers size={14} />
                                    {t('layout.left')}
                                </button>
                                <button
                                    className={`toggle-btn ${layout.sidebar === 'right' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, sidebar: 'right' })}
                                >
                                    <Layers size={14} />
                                    {t('layout.right')}
                                </button>
                                <button
                                    className={`toggle-btn ${layout.sidebar === 'hidden' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, sidebar: 'hidden' })}
                                >
                                    <EyeOff size={14} />
                                    {t('layout.hidden')}
                                </button>
                            </div>
                        </div>

                        <div className="control-group">
                            <label className="control-label">{t('layout.navigationStyle')}</label>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${layout.navigationStyle === 'horizontal' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, navigationStyle: 'horizontal' })}
                                >
                                    {t('layout.horizontal')}
                                </button>
                                <button
                                    className={`toggle-btn ${layout.navigationStyle === 'vertical' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, navigationStyle: 'vertical' })}
                                >
                                    {t('layout.vertical')}
                                </button>
                            </div>
                        </div>

                        <CustomSelect
                            label={t('layout.headerStyle')}
                            value={layout.headerStyle}
                            onChange={(value) => setLayout({ ...layout, headerStyle: value })}
                            options={[
                                { value: 'fixed', label: t('layout.fixedHeader') },
                                { value: 'sticky', label: t('layout.stickyHeader') },
                                { value: 'static', label: t('layout.staticHeader') },
                                { value: 'floating', label: t('layout.floatingHeader') },
                            ]}
                        />

                        <CustomSelect
                            label={t('layout.footerStyle')}
                            value={layout.footerStyle}
                            onChange={(value) => setLayout({ ...layout, footerStyle: value })}
                            options={[
                                { value: 'sticky', label: t('layout.stickyFooter') },
                                { value: 'static', label: t('layout.staticFooter') },
                                { value: 'minimal', label: t('layout.minimalFooter') },
                                { value: 'hidden', label: t('layout.hiddenFooter') },
                            ]}
                        />

                        <div className="control-group">
                            <label className="control-label">{t('layout.responsivePreview')}</label>
                            <div className="toggle-group">
                                <button
                                    className={`toggle-btn ${layout.viewMode === 'desktop' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, viewMode: 'desktop' })}
                                >
                                    <Monitor size={14} />
                                    {t('layout.desktop')}
                                </button>
                                <button
                                    className={`toggle-btn ${layout.viewMode === 'tablet' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, viewMode: 'tablet' })}
                                >
                                    <Tablet size={14} />
                                    {t('layout.tablet')}
                                </button>
                                <button
                                    className={`toggle-btn ${layout.viewMode === 'mobile' ? 'active' : ''}`}
                                    onClick={() => setLayout({ ...layout, viewMode: 'mobile' })}
                                >
                                    <Smartphone size={14} />
                                    {t('layout.mobile')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Website Generation Controls */}
                {canUseSetting('website_generation', role) && (
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Zap size={20} />
                                <span>{t('settings.websiteGeneration')}</span>
                            </div>
                            <div className="card-badge">{t('common.aiTools')}</div>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('website.autoGenerateElements')}</div>
                                <div className="description">{t('website.autoGenerateElementsDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={websiteControls.autoGenerate}
                                    onChange={(e) => setWebsiteControls({ ...websiteControls, autoGenerate: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('website.elementsPanel')}</div>
                                <div className="description">{t('website.elementsPanelDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={websiteControls.showElementsPanel}
                                    onChange={(e) => setWebsiteControls({ ...websiteControls, showElementsPanel: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('website.developerMode')}</div>
                                <div className="description">{t('website.developerModeDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={websiteControls.developerMode}
                                    onChange={(e) => setWebsiteControls({ ...websiteControls, developerMode: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('website.livePreview')}</div>
                                <div className="description">{t('website.livePreviewDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={websiteControls.previewMode}
                                    onChange={(e) => setWebsiteControls({ ...websiteControls, previewMode: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('website.gridSystem')}</div>
                                <div className="description">{t('website.gridSystemDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={websiteControls.gridSystem}
                                    onChange={(e) => setWebsiteControls({ ...websiteControls, gridSystem: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('website.codeEditor')}</div>
                                <div className="description">{t('website.codeEditorDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={websiteControls.codeEditor}
                                    onChange={(e) => setWebsiteControls({ ...websiteControls, codeEditor: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                )}

                {/* SEO & Performance */}
                {canUseSetting('seo', role) && (
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Globe size={20} />
                                <span>{t('settings.seoPerformance')}</span>
                            </div>
                            <div className="card-badge">{t('common.optimization')}</div>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('seo.metaTagsGeneration')}</div>
                                <div className="description">{t('seo.metaTagsGenerationDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={seoSettings.metaGeneration}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, metaGeneration: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('seo.sitemapGeneration')}</div>
                                <div className="description">{t('seo.sitemapGenerationDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={seoSettings.sitemap}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, sitemap: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('seo.imageOptimization')}</div>
                                <div className="description">{t('seo.imageOptimizationDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={seoSettings.imageOptimization}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, imageOptimization: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('seo.lazyLoading')}</div>
                                <div className="description">{t('seo.lazyLoadingDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={seoSettings.lazyLoading}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, lazyLoading: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('seo.codeMinification')}</div>
                                <div className="description">{t('seo.codeMinificationDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={seoSettings.minification}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, minification: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('seo.browserCaching')}</div>
                                <div className="description">{t('seo.browserCachingDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={seoSettings.caching}
                                    onChange={(e) => setSeoSettings({ ...seoSettings, caching: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {canUseSetting('notifications', role) && (
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Bell size={20} />
                                <span>{t('settings.notifications')}</span>
                            </div>
                            <div className="card-badge">{t('common.alerts')}</div>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('notifications.emailNotifications')}</div>
                                <div className="description">{t('notifications.emailNotificationsDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('notifications.pushNotifications')}</div>
                                <div className="description">{t('notifications.pushNotificationsDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.push}
                                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('notifications.desktopAlerts')}</div>
                                <div className="description">{t('notifications.desktopAlertsDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.desktop}
                                    onChange={(e) => setNotifications({ ...notifications, desktop: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('notifications.errorNotifications')}</div>
                                <div className="description">{t('notifications.errorNotificationsDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.errors}
                                    onChange={(e) => setNotifications({ ...notifications, errors: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('notifications.deploymentAlerts')}</div>
                                <div className="description">{t('notifications.deploymentAlertsDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.deployment}
                                    onChange={(e) => setNotifications({ ...notifications, deployment: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Advanced Settings */}
                {canUseSetting('advanced', role) && (
                    <div className="settings-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Database size={20} />
                                <span>{t('settings.advancedSettings')}</span>
                            </div>
                            <div className="card-badge">{t('common.system')}</div>
                        </div>

                        <CustomSelect
                            label={t('advanced.animationSpeed')}
                            value={advanced.animationSpeed}
                            onChange={(value) => setAdvanced({ ...advanced, animationSpeed: value })}
                            options={[
                                { value: 'slow', label: t('advanced.slow') },
                                { value: 'normal', label: t('advanced.normal') },
                                { value: 'fast', label: t('advanced.fast') },
                                { value: 'none', label: t('advanced.disabled') },
                            ]}
                        />

                        <CustomSelect
                            label={t('advanced.timezone')}
                            value={advanced.timezone}
                            onChange={(value) => setAdvanced({ ...advanced, timezone: value })}
                            options={[
                                { value: 'UTC', label: t('timezone.utc') },
                                { value: 'EST', label: t('timezone.est') },
                                { value: 'PST', label: t('timezone.pst') },
                                { value: 'GMT', label: t('timezone.gmt') },
                                { value: 'CET', label: t('timezone.cet') },
                                { value: 'JST', label: t('timezone.jst') },
                                { value: 'IST', label: t('timezone.ist') },
                            ]}
                        />

                        <CustomSelect
                            label={t('advanced.fontSize')}
                            value={advanced.fontSize}
                            onChange={(value) => setAdvanced({ ...advanced, fontSize: value })}
                            options={[
                                { value: 'small', label: t('advanced.small'), icon: Type },
                                { value: 'medium', label: t('advanced.medium'), icon: Type },
                                { value: 'large', label: t('advanced.large'), icon: Type },
                                { value: 'xlarge', label: t('advanced.extraLarge'), icon: Type },
                            ]}
                        />

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('advanced.compactMode')}</div>
                                <div className="description">{t('advanced.compactModeDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={advanced.compactMode}
                                    onChange={(e) => setAdvanced({ ...advanced, compactMode: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-content">
                                <div className="notification-title">{t('advanced.autoSave')}</div>
                                <div className="description">{t('advanced.autoSaveDesc')}</div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={websiteControls.autoSave}
                                    onChange={(e) => setWebsiteControls({ ...websiteControls, autoSave: e.target.checked })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Security & Privacy */}
                {canUseSetting('security', role) && (
                    <>
                        {/* PIN Protection Settings - Only for SuperAdmin */}
                        {role === 'superadmin' && (
                            <div className="settings-card">
                                <div className="card-header">
                                    <div className="card-title">
                                        <Shield size={20} />
                                        <span>PIN Protection Settings</span>
                                    </div>
                                    <div className="card-badge">SuperAdmin Only</div>
                                </div>
                                <div className="notification-item">
                                    <div className="notification-content">
                                        <div className="notification-title">PIN Protection</div>
                                        <div className="notification-description">
                                            Configure PIN protection for Admin accounts. SuperAdmins always have full access.
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                    <p>PIN protection is available for Admin-level accounts.</p>
                                    <p>As a SuperAdmin, you have unrestricted access to all pages.</p>
                                </div>
                            </div>
                        )}

                        <div className="settings-card">
                            <div className="card-header">
                                <div className="card-title">
                                    <Shield size={20} />
                                    <span>{t('settings.securityPrivacy')}</span>
                                </div>
                                <div className="card-badge">{t('common.security')}</div>
                            </div>

                            <div className="notification-item">
                                <div className="notification-content">
                                    <div className="notification-title">{t('security.twoFactorAuth')}</div>
                                    <div className="description">{t('security.twoFactorAuthDesc')}</div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="notification-item">
                                <div className="notification-content">
                                    <div className="notification-title">{t('security.activityLogging')}</div>
                                    <div className="description">{t('security.activityLoggingDesc')}</div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="notification-item">
                                <div className="notification-content">
                                    <div className="notification-title">{t('security.analyticsTracking')}</div>
                                    <div className="description">{t('security.analyticsTrackingDesc')}</div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={seoSettings.analytics}
                                        onChange={(e) => setSeoSettings({ ...seoSettings, analytics: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="notification-item">
                                <div className="notification-content">
                                    <div className="notification-title">{t('security.cookieConsent')}</div>
                                    <div className="description">{t('security.cookieConsentDesc')}</div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="notification-item">
                                <div className="notification-content">
                                    <div className="notification-title">{t('security.sslCertificate')}</div>
                                    <div className="description">{t('security.sslCertificateDesc')}</div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {/* Cache Manager (Settings) */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <Database size={20} />
                            <span>{t('cache.pageCacheManager')}</span>
                        </div>
                        <div className="card-badge">{t('common.system')}</div>
                    </div>

                    <div className="cache-modal__stats" style={{ marginBottom: 12 }}>
                        <div className="cache-stat-card cache-stat-card--blue">
                            <div className="cache-stat-card__value">{Object.keys(pageCache || {}).length}</div>
                            <div className="cache-stat-card__label">{t('cache.cachedPages')}</div>
                        </div>
                        <div className="cache-stat-card cache-stat-card--green">
                            <div className="cache-stat-card__value">{(() => {
                                try { return (JSON.stringify(pageCache || {}).length / 1024).toFixed(2) + ' KB'; } catch { return '0 KB'; }
                            })()}</div>
                            <div className="cache-stat-card__label">{t('cache.totalSize')}</div>
                        </div>
                        <div className="cache-stat-card cache-stat-card--yellow">
                            <div className="cache-stat-card__value">{getCacheInfo().oldestEntry ? new Date(getCacheInfo().oldestEntry!).toLocaleString() : t('cache.notAvailable')}</div>
                            <div className="cache-stat-card__label">{t('cache.oldest')}</div>
                        </div>
                        <div className="cache-stat-card cache-stat-card--purple">
                            <div className="cache-stat-card__value">{getCacheInfo().newestEntry ? new Date(getCacheInfo().newestEntry!).toLocaleString() : t('cache.notAvailable')}</div>
                            <div className="cache-stat-card__label">{t('cache.newest')}</div>
                        </div>
                    </div>

                    {/* Per-page list */}
                    <div className="cache-section">
                        <h3 className="cache-section__title">{t('cache.cachedPages')}</h3>
                        <div className="cache-list">
                            {Object.entries(pageCache || {}).length === 0 && (
                                <div className="cache-section__text">{t('cache.noPagesYet')}</div>
                            )}
                            {Object.entries(pageCache || {}).map(([pageId, entry]: any) => (
                                <div key={pageId} className="cache-list__item">
                                    <div className="cache-list__info">
                                        <div className="cache-list__title">{pageId}</div>
                                        <div className="cache-list__meta">{t('cache.saved')}: {new Date(entry.timestamp).toLocaleString()}</div>
                                    </div>
                                    <div className="cache-list__actions">
                                        <button className="custom-button" onClick={() => clearPageCache(pageId)}>{t('cache.clear')}</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="cache-actions">
                        <button className="custom-button" onClick={() => { setIsClearing(true); clearExpiredCache(); setTimeout(() => setIsClearing(false), 400); }}>{t('cache.clearExpired')}</button>
                        <button className="custom-button" onClick={() => { if (confirm(t('cache.confirmClearAll'))) { setIsClearing(true); clearAllCache(); setTimeout(() => setIsClearing(false), 600); } }}>
                            {isClearing ? t('cache.clearing') : t('cache.clearAll')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
