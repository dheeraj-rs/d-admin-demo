'use client';

import {
    Crown,
    Mail,
    Building,
    Key as KeyIcon,
    CheckCircle,
    XCircle,
    Trash2,
    UserCog,
    Link as LinkIcon,
    Shield,
    Users,
} from 'lucide-react';
import { User } from '../types';

interface AdminDetailsProps {
    selectedSuperAdmin: User;
    superAdminChildren: { admins: User[], users: User[] };
    handleDirectAccess: (superAdmin: User) => void;
    handleGenerateAccessLink: (superAdmin: User) => void;
    handleAction: (userId: string, action: string, collection: string, userName: string) => void;
    setSelectedSuperAdmin: (admin: User | null) => void;
    setSuperAdminChildren: (children: any) => void;
    setActiveTab: (tab: any) => void;
}

export const AdminDetails = ({
    selectedSuperAdmin,
    superAdminChildren,
    handleDirectAccess,
    handleGenerateAccessLink,
    handleAction,
    setSelectedSuperAdmin,
    setSuperAdminChildren,
    setActiveTab,
}: AdminDetailsProps) => {
    return (
        <div className="emails-page-container">
            {/* Back Button */}
            <div className="back-button-container">
                <button
                    className="back-button"
                    onClick={() => {
                        setSelectedSuperAdmin(null);
                        setSuperAdminChildren({ admins: [], users: [] });
                        setActiveTab('admins');
                    }}
                >
                    ← Back to Admins
                </button>
            </div>

            {/* SuperAdmin Info Card */}
            <div className="email-item superadmin-detail-card">
                <div className="email-row">
                    <div className="email-icon superadmin-icon">
                        {selectedSuperAdmin.profilePicture ? (
                            <img
                                src={selectedSuperAdmin.profilePicture}
                                alt={selectedSuperAdmin.name || 'Profile'}
                                className="profile-img"
                            />
                        ) : (
                            <Crown className="icon" />
                        )}
                    </div>

                    <div className="email-content">
                        <div className="email-address">
                            <span>{selectedSuperAdmin.name || 'Unknown'}</span>
                        </div>
                        <div className="email-category">
                            <Mail className="category-icon" />
                            <span>{selectedSuperAdmin.email}</span>
                        </div>
                        {selectedSuperAdmin.organizationName && (
                            <div className="email-category">
                                <Building className="category-icon" />
                                <span>{selectedSuperAdmin.organizationName}</span>
                            </div>
                        )}
                        {selectedSuperAdmin.organizationKey && (
                            <div className="email-category">
                                <KeyIcon className="category-icon" />
                                <span>{selectedSuperAdmin.organizationKey}</span>
                            </div>
                        )}
                    </div>
                </div>

                <span className={`status-badge-corner ${selectedSuperAdmin.isActive ? 'active' : 'inactive'}`}>
                    {selectedSuperAdmin.isActive ? 'Active' : 'Inactive'}
                </span>

                <div className="copy-buttons">
                    <button
                        onClick={() => handleDirectAccess(selectedSuperAdmin)}
                        className="copy-btn direct-access-btn"
                        title="🔐 Direct Access - Login as this Super Admin"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            color: 'white',
                        }}
                    >
                        <UserCog className="icon" />
                    </button>
                    <button
                        onClick={() => handleGenerateAccessLink(selectedSuperAdmin)}
                        className="copy-btn access-link-btn"
                        title="🚨 Generate Emergency Access Link (One-time use)"
                        style={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                            color: 'white',
                        }}
                    >
                        <LinkIcon className="icon" />
                    </button>
                    <button
                        onClick={() => handleAction(selectedSuperAdmin._id, 'activate', 'superadmins', selectedSuperAdmin.name || selectedSuperAdmin.email)}
                        className="copy-btn"
                        title="Set Active"
                    >
                        <CheckCircle className="icon" />
                    </button>
                    <button
                        onClick={() => handleAction(selectedSuperAdmin._id, 'inactive', 'superadmins', selectedSuperAdmin.name || selectedSuperAdmin.email)}
                        className="copy-btn"
                        title="Set Inactive"
                    >
                        <XCircle className="icon" />
                    </button>
                    <button
                        onClick={() => handleAction(selectedSuperAdmin._id, 'delete', 'superadmins', selectedSuperAdmin.name || selectedSuperAdmin.email)}
                        className="copy-btn delete-btn"
                        title="Delete"
                    >
                        <Trash2 className="icon" />
                    </button>
                </div>
            </div>

            {/* Admins Section */}
            {superAdminChildren.admins.length > 0 && (
                <div className="team-section">
                    <h3 className="team-section-title">
                        <Shield size={20} /> Admins ({superAdminChildren.admins.length})
                    </h3>
                    <div className="emails-list">
                        {superAdminChildren.admins.map((admin) => (
                            <div key={admin._id} className="email-item">
                                <div className="email-row">
                                    <div className="email-icon admin-icon">
                                        {admin.profilePicture ? (
                                            <img
                                                src={admin.profilePicture}
                                                alt={admin.name || 'Profile'}
                                                className="profile-img"
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Shield className="icon" />
                                        )}
                                    </div>
                                    <div className="email-content">
                                        <div className="email-address">
                                            <span>{admin.name || admin.username || 'Unknown'}</span>
                                        </div>
                                        <div className="email-category">
                                            <Mail className="category-icon" />
                                            <span>{admin.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className={`status-badge-corner ${admin.isActive ? 'active' : 'inactive'}`}>
                                    {admin.isActive ? 'Active' : 'Inactive'}
                                </span>

                                <div className="copy-buttons">
                                    <button
                                        onClick={() => handleAction(admin._id, 'activate', 'admins', admin.name || admin.email)}
                                        className="copy-btn"
                                        title="Set Active"
                                    >
                                        <CheckCircle className="icon" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(admin._id, 'inactive', 'admins', admin.name || admin.email)}
                                        className="copy-btn"
                                        title="Set Inactive"
                                    >
                                        <XCircle className="icon" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(admin._id, 'delete', 'admins', admin.name || admin.email)}
                                        className="copy-btn delete-btn"
                                        title="Delete"
                                    >
                                        <Trash2 className="icon" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Users Section */}
            {superAdminChildren.users.length > 0 && (
                <div className="team-section">
                    <h3 className="team-section-title">
                        <Users size={20} /> Users ({superAdminChildren.users.length})
                    </h3>
                    <div className="emails-list">
                        {superAdminChildren.users.map((user) => (
                            <div key={user._id} className="email-item">
                                <div className="email-row">
                                    <div className="email-icon user-icon">
                                        {user.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.name || 'Profile'}
                                                className="profile-img"
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Users className="icon" />
                                        )}
                                    </div>
                                    <div className="email-content">
                                        <div className="email-address">
                                            <span>{user.name || user.username || 'Unknown'}</span>
                                        </div>
                                        <div className="email-category">
                                            <Mail className="category-icon" />
                                            <span>{user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className={`status-badge-corner ${user.isActive ? 'active' : 'inactive'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>

                                <div className="copy-buttons">
                                    <button
                                        onClick={() => handleAction(user._id, 'activate', 'users', user.name || user.email)}
                                        className="copy-btn"
                                        title="Set Active"
                                    >
                                        <CheckCircle className="icon" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(user._id, 'inactive', 'users', user.name || user.email)}
                                        className="copy-btn"
                                        title="Set Inactive"
                                    >
                                        <XCircle className="icon" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(user._id, 'delete', 'users', user.name || user.email)}
                                        className="copy-btn delete-btn"
                                        title="Delete"
                                    >
                                        <Trash2 className="icon" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {superAdminChildren.admins.length === 0 && superAdminChildren.users.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Users className="icon" />
                    </div>
                    <div className="empty-message">No Team Members</div>
                    <div className="empty-suggestion">
                        This SuperAdmin doesn&apos;t have any admins or users yet.
                    </div>
                </div>
            )}
        </div>
    );
};
