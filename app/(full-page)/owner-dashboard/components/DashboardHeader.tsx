'use client';

import { Crown, Users, Bell, UserPlus, Settings as SettingsIcon, LogOut, Shield } from 'lucide-react';
import { ActiveTab } from '../types';

interface DashboardHeaderProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    setSelectedSuperAdmin: (admin: any) => void;
    setSuperAdminChildren: (children: any) => void;
    superadminsCount: number;
    usersCount: number;
    unreadNotifications: number;
    setInviteModalOpen: (open: boolean) => void;
    handleLogout: () => void;
    loggingOut: boolean;
    mobileSettingsExpanded: boolean;
    setMobileSettingsExpanded: (expanded: boolean) => void;
}

export const DashboardHeader = ({
    activeTab,
    setActiveTab,
    setSelectedSuperAdmin,
    setSuperAdminChildren,
    superadminsCount,
    usersCount,
    unreadNotifications,
    setInviteModalOpen,
    handleLogout,
    loggingOut,
    mobileSettingsExpanded,
    setMobileSettingsExpanded,
}: DashboardHeaderProps) => {
    const resetSelection = () => {
        setSelectedSuperAdmin(null);
        setSuperAdminChildren({ admins: [], users: [] });
    };

    return (
        <div className="emails-page-categories">
            <div className="emails-categories-scroll">
                <button
                    className={`category-btn ${activeTab === 'admins' ? 'active' : ''}`}
                    style={{ '--category-color': 'var(--primary-color)' } as React.CSSProperties}
                    onClick={() => {
                        setActiveTab('admins');
                        resetSelection();
                    }}
                >
                    <Shield className="category-icon" />
                    <span className="category-name">Admins</span>
                    <span className="category-count">{superadminsCount}</span>
                </button>
                <button
                    className={`category-btn ${activeTab === 'accounts' ? 'active' : ''}`}
                    style={{ '--category-color': '#8b5cf6' } as React.CSSProperties}
                    onClick={() => {
                        setActiveTab('accounts');
                        resetSelection();
                    }}
                >
                    <Users className="category-icon" />
                    <span className="category-name">Accounts</span>
                    <span className="category-count">{usersCount}</span>
                </button>
                <button
                    className={`category-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    style={{ '--category-color': '#f59e0b' } as React.CSSProperties}
                    onClick={() => {
                        setActiveTab('notifications');
                        resetSelection();
                    }}
                >
                    <Bell className="category-icon" />
                    <span className="category-name">Notifications</span>
                    {unreadNotifications > 0 && (
                        <span className="category-count">{unreadNotifications}</span>
                    )}
                </button>
                <button
                    className={`category-btn ${activeTab === 'plans' ? 'active' : ''}`}
                    style={{ '--category-color': '#10b981' } as React.CSSProperties}
                    onClick={() => {
                        setActiveTab('plans');
                        resetSelection();
                    }}
                >
                    <Shield className="category-icon" />
                    <span className="category-name">Plans</span>
                </button>
            </div>
            <div className="owner-action-buttons">
                {/* Desktop view */}
                <div className="desktop-buttons">
                    <button
                        className="add-email-btn"
                        onClick={() => setInviteModalOpen(true)}
                        title="Invite SuperAdmin"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        <UserPlus className="icon" />
                        <span className="btn-text">Invite</span>
                    </button>
                    <button
                        className="add-email-btn"
                        onClick={() => {
                            setActiveTab('settings');
                            resetSelection();
                        }}
                        title="Settings"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }}
                    >
                        <SettingsIcon className="icon" />
                        <span className="btn-text">Settings</span>
                    </button>
                    <button
                        className="add-email-btn"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        title={loggingOut ? 'Logging out...' : 'Logout'}
                        style={{
                            opacity: loggingOut ? 0.6 : 1,
                            cursor: loggingOut ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <LogOut className="icon" />
                        <span className="btn-text">{loggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                </div>

                {/* Mobile view */}
                <div className="mobile-buttons">
                    <button
                        className="add-email-btn"
                        onClick={() => setMobileSettingsExpanded(!mobileSettingsExpanded)}
                        title="Menu"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        }}
                    >
                        <SettingsIcon className="icon" />
                    </button>

                    {mobileSettingsExpanded && (
                        <div className="mobile-dropdown">
                            <button
                                className="add-email-btn"
                                onClick={() => {
                                    setInviteModalOpen(true);
                                    setMobileSettingsExpanded(false);
                                }}
                                title="Invite SuperAdmin"
                                style={{
                                    background: 'transparent',
                                    border: '2px solid #667eea',
                                    color: '#667eea',
                                    width: '100%',
                                    justifyContent: 'center',
                                }}
                            >
                                <UserPlus className="icon" />
                                <span className="btn-text">Invite</span>
                            </button>
                            <button
                                className="add-email-btn"
                                onClick={() => {
                                    setActiveTab('settings');
                                    resetSelection();
                                    setMobileSettingsExpanded(false);
                                }}
                                title="Settings"
                                style={{
                                    background: 'transparent',
                                    border: '2px solid #10b981',
                                    color: '#10b981',
                                    width: '100%',
                                    justifyContent: 'center',
                                }}
                            >
                                <SettingsIcon className="icon" />
                                <span className="btn-text">Settings</span>
                            </button>
                            <button
                                className="add-email-btn"
                                onClick={() => {
                                    handleLogout();
                                    setMobileSettingsExpanded(false);
                                }}
                                disabled={loggingOut}
                                title={loggingOut ? 'Logging out...' : 'Logout'}
                                style={{
                                    background: 'transparent',
                                    border: '2px solid var(--surface-border)',
                                    color: 'var(--text-color)',
                                    width: '100%',
                                    justifyContent: 'center',
                                    opacity: loggingOut ? 0.6 : 1,
                                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <LogOut className="icon" />
                                <span className="btn-text">{loggingOut ? 'Logging out...' : 'Logout'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
