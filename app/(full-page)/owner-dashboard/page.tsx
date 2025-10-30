'use client';

import toast, { Toaster } from 'react-hot-toast';
import { useOwnerDashboard } from './useOwnerDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { AdminsList } from './components/AdminsList';
import { AccountsList } from './components/AccountsList';
import { NotificationsSection } from './components/NotificationsSection';
import { SettingsSection } from './components/SettingsSection';
import { AdminDetails } from './components/AdminDetails';
import { PlansSection } from './components/PlansSection';
import '../../../styles/admin-styles/owner-dashboard.scss';
import '../../../styles/admin-styles/plans-section.scss';
import { ConfirmModal } from '../../../models';
import { InviteModal } from '../../../models';

const OwnerDashboard = () => {
    const {
        loading,
        users,
        superadmins,
        admins,
        selectedSuperAdmin,
        superAdminChildren,
        activeTab,
        confirmModal,
        inviteModalOpen,
        notifications,
        notificationFilter,
        backupKeys,
        showKeys,
        mobileSettingsExpanded,
        twoFactorEnabled,
        passwordRequired,
        hasPassword,
        loggingOut,
        setActiveTab,
        setConfirmModal,
        setInviteModalOpen,
        setNotificationFilter,
        setShowKeys,
        setMobileSettingsExpanded,
        setSelectedSuperAdmin,
        setSuperAdminChildren,
        handleAction,
        handleSuperAdminClick,
        handleLogout,
        handleInviteSuperAdmin,
        handleDirectAccess,
        handleGenerateAccessLink,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        handleGenerateBackupKey,
        handleToggleTwoFactor,
        handleTogglePasswordRequired,
        handleSetPassword,
        copyToClipboard,
    } = useOwnerDashboard();

    if (loading) {
        return (
            <div className="owner-dashboard loading">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="children__wrapper">
            <Toaster position="top-right" />
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                type={confirmModal.type}
                confirmText="OK"
                cancelText="Cancel"
            />
            <InviteModal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInvite={handleInviteSuperAdmin}
            />
            <div className="emails-page-wrapper">
                <DashboardHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    setSelectedSuperAdmin={setSelectedSuperAdmin}
                    setSuperAdminChildren={setSuperAdminChildren}
                    superadminsCount={superadmins.length}
                    usersCount={users.length}
                    unreadNotifications={notifications.filter((n) => !n.isRead).length}
                    setInviteModalOpen={setInviteModalOpen}
                    handleLogout={handleLogout}
                    loggingOut={loggingOut}
                    mobileSettingsExpanded={mobileSettingsExpanded}
                    setMobileSettingsExpanded={setMobileSettingsExpanded}
                />

                {/* Content based on active tab - Only show when no Admin selected */}
                {!selectedSuperAdmin && (
                    <div className="emails-page-container">
                        {/* Admins Tab */}
                        {activeTab === 'admins' && (
                            <AdminsList
                                superadmins={superadmins}
                                admins={admins}
                                searchQuery=""
                                handleSuperAdminClick={handleSuperAdminClick}
                                handleAction={handleAction}
                            />
                        )}

                        {/* Accounts Tab - Grouped by Plan */}
                        {activeTab === 'accounts' && !selectedSuperAdmin && (
                            <AccountsList users={users} handleAction={handleAction} />
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <NotificationsSection
                                notifications={notifications}
                                notificationFilter={notificationFilter}
                                setNotificationFilter={setNotificationFilter}
                                markAsRead={markAsRead}
                                markAllAsRead={markAllAsRead}
                                deleteNotification={deleteNotification}
                            />
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <SettingsSection
                                twoFactorEnabled={twoFactorEnabled}
                                backupKeys={backupKeys}
                                showKeys={showKeys}
                                passwordRequired={passwordRequired}
                                hasPassword={hasPassword}
                                handleToggleTwoFactor={handleToggleTwoFactor}
                                handleGenerateBackupKey={handleGenerateBackupKey}
                                handleTogglePasswordRequired={handleTogglePasswordRequired}
                                handleSetPassword={handleSetPassword}
                                setShowKeys={setShowKeys}
                                copyToClipboard={copyToClipboard}
                            />
                        )}

                        {/* Plans Tab */}
                        {activeTab === 'plans' && (
                            <PlansSection
                                onSave={async (permissions) => {
                                    try {
                                        console.log('💾 Saving permissions...', permissions.length, 'pages');
                                        const response = await fetch('/api/plan-permissions', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ permissions }),
                                        });

                                        console.log('📡 Response status:', response.status);
                                        const data = await response.json();
                                        console.log('📦 Response data:', data);

                                        if (data.success) {
                                            toast.success('✅ Plan permissions updated successfully!');
                                        } else {
                                            const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
                                            console.error('❌ API Error:', errorMsg);
                                            toast.error(errorMsg || 'Failed to update permissions');
                                        }
                                    } catch (error: any) {
                                        console.error('❌ Error saving permissions:', error);
                                        toast.error(`Failed to save permissions: ${error.message}`);
                                    }
                                }}
                                onReset={async () => {
                                    try {
                                        const response = await fetch('/api/plan-permissions', {
                                            method: 'GET',
                                            headers: { 'Content-Type': 'application/json' },
                                        });
                                        const data = await response.json();
                                        if (data.success && data.data) {
                                            return data.data.permissions;
                                        } else {
                                            throw new Error(data.error || 'Failed to fetch permissions');
                                        }
                                    } catch (error) {
                                        console.error('Error fetching permissions:', error);
                                        throw error;
                                    }
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Selected Admin Details - Show when Admin selected */}
                {selectedSuperAdmin && (
                    <AdminDetails
                        selectedSuperAdmin={selectedSuperAdmin}
                        superAdminChildren={superAdminChildren}
                        handleDirectAccess={handleDirectAccess}
                        handleGenerateAccessLink={handleGenerateAccessLink}
                        handleAction={handleAction}
                        setSelectedSuperAdmin={setSelectedSuperAdmin}
                        setSuperAdminChildren={setSuperAdminChildren}
                        setActiveTab={setActiveTab}
                    />
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
